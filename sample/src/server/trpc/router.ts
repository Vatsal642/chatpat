import { router } from '@/server/trpc/init';
import { chatRouter } from '@/server/trpc/routers/chat';

export const appRouter = router({
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;