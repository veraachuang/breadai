import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const goalRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.goal.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: 'desc' },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      targetAmount: z.number(),
      deadline: z.string().optional(),
      category: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.goal.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          targetAmount: input.targetAmount,
          currentAmount: 0,
          deadline: input.deadline ? new Date(input.deadline) : null,
          category: input.category,
          status: 'active',
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      currentAmount: z.number().optional(),
      targetAmount: z.number().optional(),
      deadline: z.string().optional(),
      status: z.enum(['active', 'completed', 'failed']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      return ctx.prisma.goal.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: {
          ...updateData,
          deadline: updateData.deadline ? new Date(updateData.deadline) : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.goal.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  getProgress: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const goal = await ctx.prisma.goal.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!goal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Goal not found',
        });
      }

      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      
      let timeRemaining = null;
      if (goal.deadline) {
        const now = new Date();
        const deadline = new Date(goal.deadline);
        const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        timeRemaining = daysRemaining > 0 ? daysRemaining : 0;
      }

      return {
        ...goal,
        progress,
        remaining,
        timeRemaining,
      };
    }),
}); 