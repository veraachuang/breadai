import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { categorizeTransaction } from '@/server/services/ai';
import { TRPCError } from '@trpc/server';
import { plaidClient } from '@/server/services/plaid';

const DUMMY_TRANSACTIONS = [
  // Monthly Allowance
  {
    name: "Monthly Allowance",
    amount: 6000.00,
    category: ["Income", "Allowance"],
    date: new Date(),
    merchantName: "Family Transfer",
  },
  // Monthly Salary
  {
    name: "Monthly Salary",
    amount: 5500.00,
    category: ["Income", "Direct Deposit"],
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    merchantName: "Employer Co.",
  },

  // Food and Drink - Daily/Weekly transactions
  ...[...Array(30)].map((_, i) => ({
    name: ["Starbucks Coffee", "Local Cafe", "Lunch Special", "Restaurant Dinner"][Math.floor(Math.random() * 4)],
    amount: -([3.75, 5.50, 10.50, 25.80][Math.floor(Math.random() * 4)]),
    category: ["Food and Drink", ["Coffee Shop", "Restaurants", "Fast Food"][Math.floor(Math.random() * 3)]],
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    merchantName: ["Starbucks", "Local Cafe", "Restaurant Chain", "Nice Restaurant"][Math.floor(Math.random() * 4)],
  })),

  // Shopping - Weekly transactions
  ...[...Array(8)].map((_, i) => ({
    name: ["Amazon Purchase", "Target Shopping", "Grocery Run", "Department Store"][Math.floor(Math.random() * 4)],
    amount: -([49.99, 76.75, 38.50, 84.25][Math.floor(Math.random() * 4)]),
    category: ["Shopping", ["Online Marketplaces", "Retail", "Groceries"][Math.floor(Math.random() * 3)]],
    date: new Date(Date.now() - (i * 3 + 2) * 24 * 60 * 60 * 1000),
    merchantName: ["Amazon", "Target", "Walmart", "Macy's"][Math.floor(Math.random() * 4)],
  })),

  // Transportation - Weekly/Monthly transactions
  ...[...Array(10)].map((_, i) => ({
    name: ["Gas Station", "Car Insurance", "Parking Fee", "Car Maintenance"][Math.floor(Math.random() * 4)],
    amount: -([25.50, 95.00, 8.00, 59.99][Math.floor(Math.random() * 4)]),
    category: ["Transportation", ["Gas", "Insurance", "Parking", "Service"][Math.floor(Math.random() * 4)]],
    date: new Date(Date.now() - (i * 3) * 24 * 60 * 60 * 1000),
    merchantName: ["Shell", "State Farm", "City Parking", "Auto Shop"][Math.floor(Math.random() * 4)],
  })),

  // Housing and Utilities - Monthly transactions
  {
    name: "Rent Payment",
    amount: -1500.00,
    category: ["Housing", "Rent"],
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    merchantName: "Property Management",
  },
  {
    name: "Electric Bill",
    amount: -75.67,
    category: ["Utilities", "Electric"],
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    merchantName: "Power Company",
  },
  {
    name: "Internet Service",
    amount: -49.99,
    category: ["Utilities", "Internet"],
    date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    merchantName: "ISP Corp",
  },
  {
    name: "Phone Bill",
    amount: -55.00,
    category: ["Utilities", "Phone"],
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    merchantName: "Mobile Carrier",
  },

  // Entertainment - Weekly/Monthly subscriptions
  {
    name: "Netflix Subscription",
    amount: -14.99,
    category: ["Entertainment", "Streaming Services"],
    date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    merchantName: "Netflix",
  },
  {
    name: "Hulu Subscription",
    amount: -11.99,
    category: ["Entertainment", "Streaming Services"],
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    merchantName: "Hulu",
  },
  ...[...Array(4)].map((_, i) => ({
    name: ["Movie Theater", "Concert Tickets", "Game Purchase", "Streaming Service"][Math.floor(Math.random() * 4)],
    amount: -([12.00, 35.00, 24.99, 14.99][Math.floor(Math.random() * 4)]),
    category: ["Entertainment", ["Movies", "Events", "Gaming", "Streaming"][Math.floor(Math.random() * 4)]],
    date: new Date(Date.now() - (i * 7 + 5) * 24 * 60 * 60 * 1000),
    merchantName: ["AMC", "Ticketmaster", "Steam", "Disney+"][Math.floor(Math.random() * 4)],
  })),
];

export const transactionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable(),
        category: z.string().optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view transactions',
        });
      }

      try {
        console.log("Starting transaction fetch for user:", ctx.session.user.id);

        // First check if the user has any Plaid accounts
        const plaidAccounts = await ctx.prisma.plaidAccount.findMany({
          where: { userId: ctx.session.user.id },
        });

        if (plaidAccounts.length === 0) {
          console.log("No Plaid accounts found for user:", ctx.session.user.id);
          return [];
        }

        console.log(`Found ${plaidAccounts.length} Plaid accounts:`, plaidAccounts.map(acc => acc.id));

        // Default to last 30 days if no dates provided
        const endDate = input.endDate ? new Date(input.endDate + 'T23:59:59.999Z') : new Date();
        const startDate = input.startDate ? new Date(input.startDate + 'T00:00:00.000Z') : new Date(endDate);
        if (!input.startDate) {
          startDate.setDate(endDate.getDate() - 30);
        }

        console.log("Querying transactions with date range:", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

        // First, let's check total transactions without date filtering
        const totalTransactions = await ctx.prisma.transaction.count({
          where: {
            userId: ctx.session.user.id,
            accountId: { in: plaidAccounts.map(account => account.id) },
          },
        });

        console.log("Total transactions in database (without date filter):", totalTransactions);

        // If we have no transactions at all, try to sync them
        if (totalTransactions === 0) {
          console.log("No transactions found, attempting to sync...");
          try {
            await ctx.prisma.$transaction(async (prisma) => {
              for (const account of plaidAccounts) {
                console.log(`Syncing transactions for account ${account.id}...`);
                const syncResponse = await plaidClient.transactionsSync({
                  access_token: account.accessToken,
                  options: {
                    include_personal_finance_category: true,
                    include_pending: true,
                  }
                });

                console.log(`Processing ${syncResponse.data.added.length} transactions for account ${account.id}`);

                // Process added transactions
                for (const transaction of syncResponse.data.added) {
                  try {
                    await prisma.transaction.create({
                      data: {
                        userId: ctx.session.user.id,
                        plaidId: transaction.transaction_id,
                        accountId: account.id,
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
                    console.log(`Created transaction: ${transaction.transaction_id}`);
                  } catch (error) {
                    if (error.code === 'P2002') {
                      console.log(`Skipping duplicate transaction: ${transaction.transaction_id}`);
                    } else {
                      console.error(`Error creating transaction: ${transaction.transaction_id}`, error);
                    }
                  }
                }
              }
            });

            // After syncing, let's check if we got any transactions
            const newTotalTransactions = await ctx.prisma.transaction.count({
              where: {
                userId: ctx.session.user.id,
                accountId: { in: plaidAccounts.map(account => account.id) },
              },
            });
            console.log(`After sync: found ${newTotalTransactions} total transactions`);

            // If we still have no transactions, try getting initial transactions
            if (newTotalTransactions === 0) {
              console.log("No transactions after sync, trying initial transaction fetch...");
              for (const account of plaidAccounts) {
                const now = new Date();
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(now.getDate() - 30);

                const transactionsResponse = await plaidClient.transactionsGet({
                  access_token: account.accessToken,
                  start_date: thirtyDaysAgo.toISOString().split('T')[0],
                  end_date: now.toISOString().split('T')[0],
                  options: {
                    include_personal_finance_category: true,
                    include_pending: true
                  }
                });

                console.log(`Found ${transactionsResponse.data.transactions.length} initial transactions for account ${account.id}`);

                for (const transaction of transactionsResponse.data.transactions) {
                  try {
                    await ctx.prisma.transaction.create({
                      data: {
                        userId: ctx.session.user.id,
                        plaidId: transaction.transaction_id,
                        accountId: account.id,
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
                    console.log(`Created initial transaction: ${transaction.transaction_id}`);
                  } catch (error) {
                    if (error.code === 'P2002') {
                      console.log(`Skipping duplicate initial transaction: ${transaction.transaction_id}`);
                    } else {
                      console.error(`Error creating initial transaction: ${transaction.transaction_id}`, error);
                    }
                  }
                }
              }
            }
          } catch (syncError) {
            console.error("Error syncing transactions:", syncError);
          }
        }

        const where = {
          userId: ctx.session.user.id,
          accountId: { in: plaidAccounts.map(account => account.id) },
          date: {
            gte: startDate,
            lte: endDate,
          },
          ...(input.category ? {
            category: {
              has: input.category
            },
          } : {}),
        };

        console.log("Executing query with where clause:", JSON.stringify(where, null, 2));

        // Get all transactions for the user's Plaid accounts
        const transactions = await ctx.prisma.transaction.findMany({
          where,
          orderBy: { date: 'desc' },
          include: {
            plaidAccount: true,
          },
        });

        console.log(`Found ${transactions.length} transactions within date range`);
        
        if (transactions.length === 0) {
          // If no transactions, let's check if there are any transactions at all for debugging
          const anyTransactions = await ctx.prisma.transaction.findFirst({
            where: {
              userId: ctx.session.user.id,
              accountId: { in: plaidAccounts.map(account => account.id) },
            },
            orderBy: { date: 'desc' },
          });
          
          if (anyTransactions) {
            console.log("Found transactions outside date range. Most recent transaction:", {
              date: anyTransactions.date,
              amount: anyTransactions.amount,
              name: anyTransactions.name
            });
          }
        } else {
          console.log("First transaction in range:", {
            date: transactions[0].date,
            amount: transactions[0].amount,
            name: transactions[0].name
          });
        }

        // Ensure all data is properly formatted
        const formattedTransactions = transactions.map(tx => ({
          ...tx,
          amount: Number(tx.amount),
          date: tx.date.toISOString(),
          category: Array.isArray(tx.category) ? tx.category : [],
          pending: Boolean(tx.pending),
          merchantName: tx.merchantName || null,
        }));

        console.log("Returning formatted transactions");
        return formattedTransactions;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch transactions",
          cause: error
        });
      }
    }),

  categorizeTransactions: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Get uncategorized transactions
        const transactions = await ctx.prisma.transaction.findMany({
          where: {
            userId: ctx.session.user.id,
            aiCategory: null,
          },
        });

        // Categorize each transaction
        for (const transaction of transactions) {
          const category = await categorizeTransaction({
            name: transaction.name,
            amount: transaction.amount,
            merchantName: transaction.merchantName || undefined,
          });

          // Update transaction with AI category
          await ctx.prisma.transaction.update({
            where: { id: transaction.id },
            data: { aiCategory: category },
          });
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to categorize transactions',
        });
      }
    }),

  getSpendingByCategory: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view spending data',
        });
      }

      try {
        // Use provided dates or default to last 30 days
        const endDate = input.endDate ? new Date(input.endDate) : new Date();
        const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate);
        if (!input.startDate) {
          startDate.setDate(endDate.getDate() - 30);
        }

        // Get transactions for the specified date range
        const transactions = await ctx.prisma.transaction.findMany({
          where: {
            userId: ctx.session.user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        // Calculate spending and income by category
        const spendingByCategory = transactions.reduce((acc, transaction) => {
          const category = Array.isArray(transaction.category) && transaction.category.length > 0
            ? transaction.category[0]
            : 'Uncategorized';
          
          const amount = Number(transaction.amount) || 0;
          
          // Initialize category if it doesn't exist
          if (!acc[category]) {
            acc[category] = 0;
          }
          
          // Add the amount (will be negative for expenses, positive for income)
          acc[category] += amount;
          
          return acc;
        }, {} as Record<string, number>);

        // Calculate total spending (excluding income categories)
        const totalSpending = Object.entries(spendingByCategory)
          .filter(([category]) => category !== 'Income')
          .reduce((sum, [_, amount]) => sum + Math.abs(amount), 0);

        // Convert to array and calculate percentages
        return Object.entries(spendingByCategory)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: category !== 'Income' ? Number(((Math.abs(amount) / totalSpending) * 100).toFixed(1)) : 0,
          }))
          .sort((a, b) => {
            // Put Income at the top, then sort others by absolute amount in descending order
            if (a.category === 'Income') return -1;
            if (b.category === 'Income') return 1;
            return Math.abs(b.amount) - Math.abs(a.amount);
          });
      } catch (error) {
        console.error("Error fetching spending by category:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch spending data",
          cause: error
        });
      }
    }),

  populateDummyData: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // First, delete any existing transactions for this user
        await ctx.prisma.transaction.deleteMany({
          where: { userId: ctx.session.user.id }
        });

        // Create a dummy Plaid account if none exists
        let dummyAccount = await ctx.prisma.plaidAccount.findFirst({
          where: { userId: ctx.session.user.id }
        });

        if (!dummyAccount) {
          dummyAccount = await ctx.prisma.plaidAccount.create({
            data: {
              accessToken: "dummy_token",
              itemId: "dummy_item",
              userId: ctx.session.user.id
            }
          });
        }

        // Create all dummy transactions
        const createdTransactions = await Promise.all(
          DUMMY_TRANSACTIONS.map(async (transaction) => {
            return ctx.prisma.transaction.create({
              data: {
                userId: ctx.session.user.id,
                accountId: dummyAccount.id,
                plaidId: `dummy_${Date.now()}_${Math.random()}`,
                amount: transaction.amount,
                date: transaction.date,
                name: transaction.name,
                merchantName: transaction.merchantName,
                category: transaction.category,
                pending: false,
              },
            });
          })
        );

        console.log(`Created ${createdTransactions.length} dummy transactions`);
        return { success: true, count: createdTransactions.length };
      } catch (error) {
        console.error("Error creating dummy transactions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create dummy transactions",
          cause: error
        });
      }
    }),
}); 