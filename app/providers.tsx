'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { api } from '@/utils/api';
import superjson from 'superjson';
import { SessionProvider } from 'next-auth/react';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc`,
          async headers() {
            return {
              'x-trpc-source': 'react',
            };
          },
        }),
      ],
      transformer: superjson,
    })
  );

  return (
    <SessionProvider>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </api.Provider>
    </SessionProvider>
  );
} 