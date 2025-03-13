import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { plaidClient } from "@/server/services/plaid";
import { CountryCode, Products } from "plaid";

export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        console.log("Creating link token for user:", ctx.session.user.id);
        
        const request = {
          user: { client_user_id: ctx.session.user.id },
          client_name: "BreadAI",
          products: [Products.Auth, Products.Transactions],
          country_codes: [CountryCode.Us],
          language: "en",
          webhook: process.env.PLAID_WEBHOOK_URL,
        };

        console.log("Link token request:", JSON.stringify(request, null, 2));
        const createTokenResponse = await plaidClient.linkTokenCreate(request);
        console.log("Link token created successfully");
        
        return { linkToken: createTokenResponse.data.link_token };
      } catch (error: any) {
        console.error("Error creating link token:", error);
        if (error.response?.data) {
          console.error("Plaid API error details:", {
            error_type: error.response.data.error_type,
            error_code: error.response.data.error_code,
            error_message: error.response.data.error_message,
            display_message: error.response.data.display_message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.response?.data?.error_message || "Failed to create Plaid link token",
          cause: error
        });
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
        console.log("Starting public token exchange...");
        const response = await plaidClient.itemPublicTokenExchange({
          public_token: input.publicToken,
        });
        console.log("Successfully exchanged public token");

        // First get all accounts for this item to store them
        console.log("Fetching accounts for item...");
        const accountsResponse = await plaidClient.accountsGet({
          access_token: response.data.access_token,
        });
        
        // Create the PlaidAccount and connect it to the user
        console.log("Creating Plaid account in database...");
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
        console.log("Successfully created Plaid account:", plaidAccount.id);

        // Get initial transactions
        console.log("Fetching initial transactions...");
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        try {
          // Then get all transactions
          const transactionsResponse = await plaidClient.transactionsGet({
            access_token: response.data.access_token,
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: now.toISOString().split('T')[0],
            options: {
              include_personal_finance_category: true,
              include_pending: true
            }
          });

          console.log("Raw Plaid transactions response:", JSON.stringify({
            accounts: accountsResponse.data.accounts,
            transactions_length: transactionsResponse.data.transactions.length
          }, null, 2));

          // Process transactions in batches to avoid timeout
          const batchSize = 50;
          const transactions = transactionsResponse.data.transactions;
          
          console.log(`Processing ${transactions.length} transactions in batches of ${batchSize}`);
          
          for (let i = 0; i < transactions.length; i += batchSize) {
            const batch = transactions.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (transaction) => {
                try {
                  // Log transaction details for debugging
                  console.log(`Processing transaction: ${transaction.transaction_id}`, {
                    name: transaction.name,
                    amount: transaction.amount,
                    date: transaction.date,
                    account_id: transaction.account_id,
                    plaid_account_id: plaidAccount.id
                  });

                  // Create transaction with proper date handling
                  const transactionDate = new Date(transaction.date);
                  // Ensure the date is valid and within our range
                  if (transactionDate >= thirtyDaysAgo && transactionDate <= now) {
                    await ctx.prisma.transaction.create({
                      data: {
                        userId: ctx.session.user.id,
                        plaidId: transaction.transaction_id,
                        accountId: plaidAccount.id, // Use our PlaidAccount ID
                        amount: transaction.amount > 0 ? -transaction.amount : Math.abs(transaction.amount), // Invert positive amounts to represent spending
                        date: transactionDate,
                        name: transaction.name || "Unknown Transaction",
                        merchantName: transaction.merchant_name || null,
                        category: transaction.personal_finance_category 
                          ? [transaction.personal_finance_category.primary, ...(transaction.personal_finance_category.detailed ? [transaction.personal_finance_category.detailed] : [])]
                          : transaction.category || [],
                        pending: transaction.pending || false,
                      },
                    });
                    console.log(`Successfully created transaction: ${transaction.transaction_id}`);
                  } else {
                    console.log(`Skipping transaction ${transaction.transaction_id} due to date out of range`);
                  }
                } catch (error) {
                  if (error.code === 'P2002') {
                    console.log(`Skipping duplicate transaction: ${transaction.transaction_id}`);
                  } else {
                    console.error(`Error creating transaction: ${transaction.transaction_id}`, error);
                    throw error; // Re-throw to be caught by the outer try-catch
                  }
                }
              })
            );
            console.log(`Completed batch ${i / batchSize + 1} of ${Math.ceil(transactions.length / batchSize)}`);
          }
          console.log("Successfully processed initial transactions");

          // If in sandbox, fire webhook to get additional transactions
          if (process.env.PLAID_ENV === "sandbox") {
            console.log("Firing sandbox webhook for additional transactions...");
            await plaidClient.sandboxItemFireWebhook({
              access_token: response.data.access_token,
              webhook_code: "DEFAULT_UPDATE"
            });
          }
        } catch (syncError) {
          console.error("Error in initial transaction fetch:", syncError);
          // Don't throw here - we still want to return success for the account connection
        }

        return { success: true };
      } catch (error) {
        console.error("Error exchanging public token:", error);
        if (error.response) {
          console.error("Plaid API error details:", {
            status: error.response.status,
            data: error.response.data
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect bank account",
          cause: error
        });
      }
    }),

  // New endpoint to manually trigger sandbox webhooks
  fireSandboxWebhook: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (process.env.PLAID_ENV !== "sandbox") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This endpoint is only available in sandbox mode"
        });
      }

      try {
        const plaidAccounts = await ctx.prisma.plaidAccount.findMany({
          where: { userId: ctx.session.user.id }
        });

        for (const account of plaidAccounts) {
          await plaidClient.sandboxItemFireWebhook({
            access_token: account.accessToken,
            webhook_code: "DEFAULT_UPDATE"
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Error firing sandbox webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fire sandbox webhook",
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
        console.log("Starting transaction sync...");
        
        // Get all PlaidAccounts for the user
        const plaidAccounts = await ctx.prisma.plaidAccount.findMany({
          where: { userId: ctx.session.user.id },
        });

        console.log(`Found ${plaidAccounts.length} Plaid accounts to sync`);

        for (const plaidAccount of plaidAccounts) {
          console.log(`Syncing transactions for account: ${plaidAccount.id}`);
          
          const syncResponse = await plaidClient.transactionsSync({
            access_token: plaidAccount.accessToken,
            options: {
              include_personal_finance_category: true,
              include_pending: true,
            }
          });

          console.log(`Received sync response:`, {
            added: syncResponse.data.added.length,
            modified: syncResponse.data.modified.length,
            removed: syncResponse.data.removed.length,
          });

          // Process added transactions
          for (const transaction of syncResponse.data.added) {
            try {
              console.log(`Processing sync transaction:`, {
                id: transaction.transaction_id,
                name: transaction.name,
                amount: transaction.amount,
                date: transaction.date,
                category: transaction.personal_finance_category
              });

              await ctx.prisma.transaction.create({
                data: {
                  userId: ctx.session.user.id,
                  plaidId: transaction.transaction_id,
                  accountId: plaidAccount.id,
                  amount: transaction.amount > 0 ? -transaction.amount : Math.abs(transaction.amount),
                  date: new Date(transaction.date),
                  name: transaction.name || "Unknown Transaction",
                  merchantName: transaction.merchant_name || null,
                  category: transaction.personal_finance_category 
                    ? [transaction.personal_finance_category.primary, ...(transaction.personal_finance_category.detailed ? [transaction.personal_finance_category.detailed] : [])]
                    : transaction.category || [],
                  pending: transaction.pending || false,
                },
              });
              console.log(`Added transaction: ${transaction.transaction_id}`);
            } catch (error) {
              if (error.code === 'P2002') {
                console.log(`Skipping duplicate transaction: ${transaction.transaction_id}`);
              } else {
                console.error(`Error adding transaction: ${transaction.transaction_id}`, error);
              }
            }
          }

          // Process modified transactions
          for (const transaction of syncResponse.data.modified) {
            try {
              await ctx.prisma.transaction.update({
                where: { plaidId: transaction.transaction_id },
                data: {
                  amount: transaction.amount > 0 ? -transaction.amount : Math.abs(transaction.amount),
                  date: new Date(transaction.date),
                  name: transaction.name || "Unknown Transaction",
                  merchantName: transaction.merchant_name || null,
                  category: transaction.personal_finance_category 
                    ? [transaction.personal_finance_category.primary, ...(transaction.personal_finance_category.detailed ? [transaction.personal_finance_category.detailed] : [])]
                    : transaction.category || [],
                  pending: transaction.pending || false,
                },
              });
              console.log(`Modified transaction: ${transaction.transaction_id}`);
            } catch (error) {
              console.error(`Error modifying transaction: ${transaction.transaction_id}`, error);
            }
          }

          // Process removed transactions
          for (const transaction of syncResponse.data.removed) {
            try {
              await ctx.prisma.transaction.delete({
                where: { plaidId: transaction.transaction_id },
              });
              console.log(`Removed transaction: ${transaction.transaction_id}`);
            } catch (error) {
              console.error(`Error removing transaction: ${transaction.transaction_id}`, error);
            }
          }
        }

        console.log("Transaction sync completed successfully");
        return { success: true };
      } catch (error) {
        console.error("Error syncing transactions:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync transactions',
          cause: error,
        });
      }
    }),
}); 