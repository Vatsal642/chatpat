import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

const t = initTRPC.create()

export const appRouter = t.router({
  chat: t.router({
    send: t.procedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ input }) => {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
        const result = await model.generateContent(input.message)
        return {
          reply: result.response.text()
        }
      })
  })
})

export type AppRouter = typeof appRouter