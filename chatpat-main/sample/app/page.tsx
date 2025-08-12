'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function ChatPage() {
  const { user, isLoading: userLoading } = useUser()
  const [messages, setMessages] = useState<Array<{content: string, isUser: boolean}>>([])
  const [input, setInput] = useState('')

  // Example: Send message via TRPC
  const sendMessage = trpc.chat.send.useMutation()

  const handleSend = () => {
    if (!input.trim()) return
    
    // Add user message
    setMessages(prev => [...prev, {content: input, isUser: true}])
    
    // Send to AI and get response
    sendMessage.mutate({ message: input }, {
      onSuccess: (response) => {
        setMessages(prev => [...prev, {content: response.reply, isUser: false}])
      }
    })

    setInput('')
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">ChatGPT Mobile</h1>
        {!userLoading && (
          user ? (
            <a href="/api/auth/logout" className="text-sm text-blue-500">Logout</a>
          ) : (
            <a href="/api/auth/login" className="text-sm text-blue-500">Login</a>
          )
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div 
            key={i}
            className={`p-3 rounded-lg ${msg.isUser ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 mr-auto'}`}
            style={{maxWidth: '80%'}}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-3 border rounded-lg"
            placeholder="Type a message..."
          />
          <button 
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 rounded-lg"
            disabled={sendMessage.isLoading}
          >
            {sendMessage.isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}