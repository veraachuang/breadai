import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { suggestBudgetAdjustments } from '@/server/services/ai';
import { TRPCError } from '@trpc/server';

export const budgetRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.budget.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { category: 'asc' },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      category: z.string(),
      amount: z.number(),
      period: z.enum(['monthly', 'weekly', 'yearly']),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budget.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budget.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          amount: input.amount,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budget.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  getRecommendations: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const recommendations = await suggestBudgetAdjustments(ctx.session.user.id);
        return recommendations;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get budget recommendations',
        });
      }
    }),

  applyRecommendation: protectedProcedure
    .input(z.object({
      category: z.string(),
      suggestedBudget: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budget.updateMany({
        where: {
          userId: ctx.session.user.id,
          category: input.category,
        },
        data: {
          amount: input.suggestedBudget,
          aiSuggested: input.suggestedBudget,
        },
      });
    }),

  getProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [budgets, transactions] = await Promise.all([
        ctx.prisma.budget.findMany({
          where: { userId: ctx.session.user.id },
        }),
        ctx.prisma.transaction.findMany({
          where: {
            userId: ctx.session.user.id,
            date: { gte: startOfMonth },
          },
        }),
      ]);

      const spendingByCategory = transactions.reduce((acc, transaction) => {
        const category = transaction.aiCategory || transaction.category[0] || 'uncategorized';
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

      return budgets.map(budget => ({
        ...budget,
        spent: spendingByCategory[budget.category] || 0,
        remaining: budget.amount - (spendingByCategory[budget.category] || 0),
      }));
    }),
}); 