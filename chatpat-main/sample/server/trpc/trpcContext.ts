import { getSession } from '@auth0/nextjs-auth0';

export type Context = { userId: string | null };

export async function createContext(): Promise<Context> {
  try {
    const session = await getSession();
    return { userId: session?.user?.sub ?? null };
  } catch {
    return { userId: null };
  }
}