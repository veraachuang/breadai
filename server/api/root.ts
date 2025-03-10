import { createTRPCRouter } from "./trpc"
import { plaidRouter } from "./routers/plaid"
import { transactionRouter } from "./routers/transaction"

export const appRouter = createTRPCRouter({
  plaid: plaidRouter,
  transaction: transactionRouter,
})

export type AppRouter = typeof appRouter 