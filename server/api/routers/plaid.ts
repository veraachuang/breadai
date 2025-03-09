import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createLinkToken, exchangePublicToken, getTransactions } from '@/server/services/plaid';
import { TRPCError } from '@trpc/server';

export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const response = await createLinkToken(ctx.session.user.id);
        return response;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create link token',
        });
      }
    }),

  setAccessToken: protectedProcedure
    .input(z.object({
      publicToken: z.string(),
      institutionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const exchangeResponse = await exchangePublicToken(input.publicToken);
        
        // Save the access token and item ID
        const plaidItem = await ctx.prisma.plaidItem.create({
          data: {
            userId: ctx.session.user.id,
            accessToken: exchangeResponse.access_token,
            itemId: exchangeResponse.item_id,
            institutionId: input.institutionId,
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set access token',
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
        // Get all Plaid items for the user
        const plaidItems = await ctx.prisma.plaidItem.findMany({
          where: { userId: ctx.session.user.id },
        });

        for (const item of plaidItems) {
          const transactions = await getTransactions(
            item.accessToken,
            input.startDate,
            input.endDate
          );

          // Process each transaction
          for (const transaction of transactions.transactions) {
            await ctx.prisma.transaction.upsert({
              where: { plaidId: transaction.transaction_id },
              create: {
                userId: ctx.session.user.id,
                plaidId: transaction.transaction_id,
                accountId: transaction.account_id,
                amount: transaction.amount,
                date: new Date(transaction.date),
                name: transaction.name,
                merchantName: transaction.merchant_name,
                category: transaction.category || [],
                pending: transaction.pending,
              },
              update: {
                amount: transaction.amount,
                date: new Date(transaction.date),
                name: transaction.name,
                merchantName: transaction.merchant_name,
                category: transaction.category || [],
                pending: transaction.pending,
              },
            });
          }
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync transactions',
        });
      }
    }),
}); 