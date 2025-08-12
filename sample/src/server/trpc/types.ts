export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'image';
  content?: string;
  imageUrl?: string;
  createdAt?: string;
};