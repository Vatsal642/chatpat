import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import type { Conversation, Message, User } from "@shared/schema";
import { Menu, Sun, Moon, Send, Bot, Sparkles, Image as ImageIcon, PenLine, Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatInterface() {
  const { user } = useAuth() as { user: User | undefined };
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // Fetch messages for current conversation
  const { data: messages = [], isPending: isMessagesPending } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setCurrentConversationId(newConversation.id);
      setSidebarOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
      return response.json();
    },
    onMutate: async ({ conversationId, content }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      
      // Get current messages
      const previousMessages = queryClient.getQueryData(["/api/conversations", conversationId, "messages"]) as Message[] || [];
      
      // Optimistically update with user message
      const optimisticUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        imageUrl: null,
        createdAt: new Date().toISOString()
      };
      
      queryClient.setQueryData(["/api/conversations", conversationId, "messages"], [...previousMessages, optimisticUserMessage]);
      
      // Clear input and set typing
      setMessage("");
      setIsTyping(true);
      
      // Return context for rollback
      return { previousMessages, conversationId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", currentConversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setIsTyping(false);
    },
    onError: (error, variables, context) => {
      setIsTyping(false);
      
      // Rollback optimistic update
      if (context) {
        queryClient.setQueryData(["/api/conversations", context.conversationId, "messages"], context.previousMessages);
      }
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    let conversationId = currentConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      const title = trimmedMessage.length > 50 ? trimmedMessage.substring(0, 50) + "..." : trimmedMessage;
      const newConversation = await createConversationMutation.mutateAsync(title);
      conversationId = newConversation.id;
    }

    if (conversationId) {
      sendMessageMutation.mutate({ conversationId, content: trimmedMessage });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessage("");
    setSidebarOpen(false);
  };

  const quickActions = [
    {
      Icon: Sparkles,
      label: "Explain Concepts",
      prompt: "Explain quantum computing in simple terms"
    },
    {
      Icon: ImageIcon,
      label: "Generate Images",
      prompt: "Generate an image of a serene mountain landscape"
    },
    {
      Icon: PenLine,
      label: "Write Content",
      prompt: "Help me write a professional email"
    },
    {
      Icon: Newspaper,
      label: "Get Updates",
      prompt: "What's the latest in technology news?"
    }
  ];

  return (
    <div className="chat-container bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-3">
          <button 
            className="p-2 rounded hover:bg-muted text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">ChatAI</h1>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded hover:bg-muted text-foreground"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="dropdown">
              <button className="btn btn-link p-0" data-bs-toggle="dropdown">
                <img 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>
              <ul className="dropdown-menu dropdown-menu-end bg-card border-border">
                <li><span className="dropdown-item-text px-3 py-2 text-sm">{user?.email}</span></li>
                <li><hr className="dropdown-divider border-border" /></li>
                <li><a className="dropdown-item text-foreground" href="/api/logout">Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewChat={startNewChat}
      />

      {/* Messages Area */}
      <div className="messages-container flex-grow-1 p-3 overflow-y-auto" style={{ height: "calc(100vh - 140px)" }}>
        {!currentConversationId ? (
          <div className="text-center my-5">
            <div className="mb-4">
              <div className="bg-primary text-primary-foreground rounded-full w-15 h-15 inline-flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3">How can I help you today?</h3>
            <p className="text-muted-foreground mb-4">Start a conversation, ask questions, or request image generation</p>
            
            <div className="grid grid-cols-2 gap-2 mb-4 max-w-md mx-auto">
              {quickActions.map((action, index) => (
                <button 
                  key={index}
                  className="btn btn-outline-primary py-3 text-center"
                  onClick={() => setMessage(action.prompt)}
                >
                  <action.Icon className="w-4 h-4 mb-1 block" />
                  <small>{action.label}</small>
                </button>
              ))}
            </div>
          </div>
        ) : (isMessagesPending && messages.length === 0) ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center opacity-80">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isTyping && (
              <div className="flex mb-3">
                <div className="me-2 mt-1">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-[0_0_18px_rgba(51,153,255,0.35)]">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="typing-indicator rounded-lg p-3 bg-gradient-to-br from-accent/60 to-card shadow-inner">
                  <div className="typing-dots flex gap-1">
                    <div className="typing-dot bg-muted-foreground"></div>
                    <div className="typing-dot bg-muted-foreground"></div>
                    <div className="typing-dot bg-muted-foreground"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-container bg-card/95 backdrop-blur border-t border-border p-3">
        <div className="flex items-end gap-2">
          <div className="flex-grow-1">
            <textarea 
              ref={textareaRef}
              className="form-control border-0 bg-input text-foreground resize-none"
              placeholder="Message ChatAI..."
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button 
            className="send-button bg-primary text-primary-foreground border-0 w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          ChatAI can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  );
}
