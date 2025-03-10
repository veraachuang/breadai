import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { plaidClient } from "@/server/services/plaid";
import { CountryCode, Products } from "plaid";

export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const request = {
          user: {
            client_user_id: ctx.session.user.id,
          },
          client_name: "BreadAI",
          products: [Products.Auth, Products.Transactions],
          country_codes: [CountryCode.Us],
          language: "en",
        }

        const createTokenResponse = await plaidClient.linkTokenCreate(request)
        return {
          linkToken: createTokenResponse.data.link_token
        }
      } catch (error) {
        console.error("Error creating link token:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Plaid link token",
          cause: error
        })
      }
    }),

  exchangePublicToken: protectedProcedure
    .input(
      z.object({
        publicToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await plaidClient.itemPublicTokenExchange({
          public_token: input.publicToken,
        });

        // Create the PlaidAccount and connect it to the user
        const plaidAccount = await ctx.prisma.plaidAccount.create({
          data: {
            accessToken: response.data.access_token,
            itemId: response.data.item_id,
            user: {
              connect: {
                id: ctx.session.user.id
              }
            }
          },
        });

        // Immediately sync transactions for the last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        
        await plaidClient.transactionsSync({
          access_token: response.data.access_token,
          options: {
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
          }
        }).then(async (syncResponse) => {
          // Process added transactions
          for (const transaction of syncResponse.data.added) {
            await ctx.prisma.transaction.create({
              data: {
                userId: ctx.session.user.id,
                plaidId: transaction.transaction_id,
                accountId: transaction.account_id,
                amount: transaction.amount,
                date: new Date(transaction.date),
                name: transaction.name,
                merchantName: transaction.merchant_name || null,
                category: transaction.category || [],
                pending: transaction.pending,
              },
            });
          }
        });

        return { success: true };
      } catch (error) {
        console.error("Error exchanging public token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect bank account",
          cause: error
        });
      }
    }),

  syncTransactions: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get all PlaidAccounts for the user
        const plaidAccounts = await ctx.prisma.plaidAccount.findMany({
          where: { userId: ctx.session.user.id },
        });

        for (const account of plaidAccounts) {
          const syncResponse = await plaidClient.transactionsSync({
            access_token: account.accessToken,
            options: {
              start_date: input.startDate,
              end_date: input.endDate,
            }
          });

          // Process added transactions
          for (const transaction of syncResponse.data.added) {
            await ctx.prisma.transaction.create({
              data: {
                userId: ctx.session.user.id,
                plaidId: transaction.transaction_id,
                accountId: transaction.account_id,
                amount: transaction.amount,
                date: new Date(transaction.date),
                name: transaction.name,
                merchantName: transaction.merchant_name || null,
                category: transaction.category || [],
                pending: transaction.pending,
              },
            });
          }

          // Process modified transactions
          for (const transaction of syncResponse.data.modified) {
            await ctx.prisma.transaction.update({
              where: { plaidId: transaction.transaction_id },
              data: {
                amount: transaction.amount,
                date: new Date(transaction.date),
                name: transaction.name,
                merchantName: transaction.merchant_name || null,
                category: transaction.category || [],
                pending: transaction.pending,
              },
            });
          }

          // Process removed transactions
          for (const transaction of syncResponse.data.removed) {
            await ctx.prisma.transaction.delete({
              where: { plaidId: transaction.transaction_id },
            });
          }
        }

        return { success: true };
      } catch (error) {
        console.error("Error syncing transactions:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync transactions',
        });
      }
    }),
}); 