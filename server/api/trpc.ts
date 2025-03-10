import { initTRPC, TRPCError } from '@trpc/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/server/db';
import { authOptions } from '@/server/auth';
import type { Session } from 'next-auth';

type CreateContextOptions = {
  req: NextRequest | Request;
  res?: Response | null;
};

export async function createContext({ req, res }: CreateContextOptions) {
  const session = await getServerSession(authOptions);

  return {
    session,
    prisma,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to perform this action',
      });
    }
    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  })
); 