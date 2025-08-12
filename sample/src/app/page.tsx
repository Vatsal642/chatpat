"use client";

import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/client/trpc';
import LoginButtons from '@/app/(components)/LoginButtons';

export default function Page() {
  const [message, setMessage] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.sendText.useMutation();
  const imageMutation = trpc.chat.generateImage.useMutation();
  const historyQuery = trpc.chat.history.useQuery();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [historyQuery.data]);

  const onSend = async () => {
    if (!message.trim()) return;
    await chatMutation.mutateAsync({ prompt: message });
    setMessage('');
  };

  const onImage = async () => {
    if (!message.trim()) return;
    await imageMutation.mutateAsync({ prompt: message });
    setMessage('');
  };

  return (
    <main className="app-root container d-flex flex-column p-0">
      <header className="d-flex align-items-center justify-content-between p-2 border-bottom">
        <strong>Sample Chat</strong>
        <LoginButtons />
      </header>

      <div ref={listRef} className="flex-grow-1 overflow-auto p-2" style={{ background: '#f7f7f8' }}>
        {historyQuery.data?.map((m) => (
          <div key={m.id} className="mb-2">
            <div className={`p-2 rounded ${m.role === 'user' ? 'bg-primary text-white' : 'bg-light border'}`}>
              {m.type === 'image' && m.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imageUrl} alt="generated" className="img-fluid rounded" />
              ) : (
                <span>{m.content}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-top bg-white">
        <form onSubmit={(e) => { e.preventDefault(); onSend(); }}>
          <div className="d-flex gap-2">
            <input
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
            />
            <button type="button" className="btn btn-primary" onClick={onSend} disabled={chatMutation.isPending}>Send</button>
            <button type="button" className="btn btn-secondary" onClick={onImage} disabled={imageMutation.isPending}>Image</button>
          </div>
        </form>
      </div>
    </main>
  );
}