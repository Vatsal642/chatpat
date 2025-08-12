import { useState } from "react";
import { format } from "date-fns";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return "";
    return format(new Date(date), "h:mm a");
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="message-bubble user-message bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg max-w-xs md:max-w-md animate-fadeInUp">
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs opacity-75 mt-1">{formatTime(message.createdAt || null)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-3">
      <div className="me-2 mt-1">
        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
          <i className="fas fa-robot text-sm"></i>
        </div>
      </div>
      <div className="message-bubble ai-message bg-muted border border-border p-3 rounded-lg max-w-xs md:max-w-md animate-fadeInUp">
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {message.imageUrl && (
          <div className="mt-3">
            <img 
              src={message.imageUrl} 
              alt="Generated image" 
              className="generated-image max-w-full rounded-lg shadow-md"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground">{formatTime(message.createdAt || null)}</div>
          <div className="flex gap-2">
            <button 
              className="btn btn-sm btn-link p-1 text-muted-foreground hover:text-foreground"
              onClick={copyToClipboard}
              title={copied ? "Copied!" : "Copy message"}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}