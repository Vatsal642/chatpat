import { z } from 'zod';
import { procedure, protectedProcedure, router } from '@/server/trpc/init';
import { getSupabaseAdmin } from '@/server/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function insertMessage(record: {
  user_id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'image';
  content?: string | null;
  image_url?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('messages').insert({
    user_id: record.user_id,
    role: record.role,
    type: record.type,
    content: record.content ?? null,
    image_url: record.image_url ?? null,
  });
  if (error) throw error;
}

export const chatRouter = router({
  history: protectedProcedure.query(async ({ ctx }) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('messages')
      .select('id, user_id, role, type, content, image_url, created_at')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      type: m.type as 'text' | 'image',
      content: m.content ?? undefined,
      imageUrl: m.image_url ?? undefined,
      createdAt: m.created_at,
    }));
  }),

  sendText: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await insertMessage({ user_id: ctx.userId!, role: 'user', type: 'text', content: input.prompt });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY missing');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const resp = await model.generateContent([{ text: input.prompt }]);
      const text = resp.response.text();

      await insertMessage({ user_id: ctx.userId!, role: 'assistant', type: 'text', content: text });
      return { content: text };
    }),

  generateImage: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await insertMessage({ user_id: ctx.userId!, role: 'user', type: 'text', content: input.prompt });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY missing');

      const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast:generateImages?key=' + apiKey;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: { text: input.prompt },
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Imagen API error: ${res.status} ${body}`);
      }
      const json: any = await res.json();
      const base64 = json?.images?.[0]?.imageBytes || json?.image?.base64 || '';
      if (!base64) throw new Error('No image in response');
      const dataUrl = `data:image/png;base64,${base64}`;

      await insertMessage({ user_id: ctx.userId!, role: 'assistant', type: 'image', image_url: dataUrl });
      return { imageUrl: dataUrl };
    }),
});