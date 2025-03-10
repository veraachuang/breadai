import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/api/root';
import { createContext } from '@/server/api/trpc';
import { db } from '@/server/db';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      try {
        // Ensure database is connected
        await db.$connect();
        // Create context with connected client
        return await createContext({ req });
      } catch (error) {
        console.error('Error creating context:', error);
        throw error;
      }
    },
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST }; 