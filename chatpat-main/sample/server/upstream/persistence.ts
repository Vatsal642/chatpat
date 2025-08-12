import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey;

let cachedClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  if (!supabaseUrl || !serviceKey) return null;
  cachedClient = createClient(supabaseUrl, serviceKey);
  return cachedClient;
}

export type MessageRecord = {
  id?: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  userId: string;
  isImage?: boolean;
  created_at?: string;
};

// In-memory fallback for local dev/build without env
const memoryStore: { [conversationId: string]: Array<{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isImage?: boolean;
  createdAt: string;
}> } = {};

export async function insertMessage(msg: MessageRecord) {
  const client = getAdminClient();
  if (!client) {
    const list = memoryStore[msg.conversationId] ?? (memoryStore[msg.conversationId] = []);
    list.push({ id: Math.random().toString(36).slice(2), role: msg.role, content: msg.content, isImage: msg.isImage, createdAt: new Date().toISOString() });
    return;
  }
  await client.from('messages').insert({
    conversation_id: msg.conversationId,
    role: msg.role,
    content: msg.content,
    user_id: msg.userId,
    is_image: msg.isImage ?? false,
  });
}

export async function getConversationWithMessages(conversationId: string, userId: string) {
  const client = getAdminClient();
  if (!client) {
    const messages = memoryStore[conversationId] ?? [];
    return { conversationId, messages };
  }
  // Ensure conversation exists
  await client.from('conversations').upsert({ id: conversationId, user_id: userId }).select();
  const { data } = await client
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return { conversationId, messages: (data ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    isImage: m.is_image,
    createdAt: m.created_at,
  })) };
}