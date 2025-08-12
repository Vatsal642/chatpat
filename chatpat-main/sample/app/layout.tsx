import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './providers';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Sample Chat',
  description: 'Auth0 + Supabase + Gemini Chat',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}