import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { categorizeTransaction } from '@/server/services/ai';
import { TRPCError } from '@trpc/server';

export const transactionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const where = {
          userId: ctx.session.user.id,
          ...(input.startDate && input.endDate ? {
            date: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          } : {}),
          ...(input.category ? {
            category: {
              has: input.category
            },
          } : {}),
        };

        const transactions = await ctx.prisma.transaction.findMany({
          where,
          orderBy: { date: 'desc' },
          include: {
            plaidAccount: true,
          },
        });

        return transactions;
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
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.prisma.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      });

      const spendingByCategory = transactions.reduce((acc, transaction) => {
        const category = transaction.aiCategory || transaction.category[0] || 'uncategorized';
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(spendingByCategory).map(([category, amount]) => ({
        category,
        amount,
      }));
    }),
}); 