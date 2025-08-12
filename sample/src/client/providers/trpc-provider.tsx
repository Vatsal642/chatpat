"use client";

import { httpBatchLink } from '@trpc/client';
import { useState, type PropsWithChildren } from 'react';
import { trpc } from '@/client/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function TRPCProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [client] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={client} queryClient={queryClient}>{children}</trpc.Provider>
    </QueryClientProvider>
  );
}