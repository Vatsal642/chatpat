import { initTRPC } from '@trpc/server';

export type TRPCContext = {
  userId: string | null;
};

export async function createTRPCContext(_opts: { req: Request }): Promise<TRPCContext> {
  // For simplicity and compatibility in App Router route handlers, omit session lookup here.
  // Auth0 is handled via routes for login/logout, and we default to null user.
  return { userId: null };
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure; // no-op for now; can add auth guard later