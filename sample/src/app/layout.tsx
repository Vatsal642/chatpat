import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import { ReactQueryClientProvider } from '@/client/react-query-provider';
import Auth0Provider from '@/client/providers/auth0-provider';
import TRPCProvider from '@/client/providers/trpc-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sample - Mobile Chat',
  description: 'Mobile-only ChatGPT clone using Next.js, tRPC, Bootstrap, Supabase, Auth0, Gemini',
  icons: {},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          <ReactQueryClientProvider>
            <TRPCProvider>
              {children}
            </TRPCProvider>
          </ReactQueryClientProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}