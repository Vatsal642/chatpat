-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Conversations table
create table if not exists public.conversations (
  id text primary key,
  user_id text not null,
  created_at timestamp with time zone default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references public.conversations(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  is_image boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);