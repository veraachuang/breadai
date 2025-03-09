import { createTRPCRouter } from '@/server/api/trpc';
import { plaidRouter } from './routers/plaid';
import { transactionRouter } from './routers/transaction';
import { budgetRouter } from './routers/budget';
import { goalRouter } from './routers/goal';

export const appRouter = createTRPCRouter({
  plaid: plaidRouter,
  transaction: transactionRouter,
  budget: budgetRouter,
  goal: goalRouter,
});

export type AppRouter = typeof appRouter; 