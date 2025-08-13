import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Conversation } from "@shared/schema";
import { Plus, Trash2, MessageSquareText } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewChat 
}: SidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest("DELETE", `/api/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (currentConversationId) {
        onNewChat();
      }
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
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {};
    
    conversations.forEach(conv => {
      if (!conv.createdAt) return;
      const date = new Date(conv.createdAt);
      let groupKey: string;
      
      if (isToday(date)) {
        groupKey = "Today";
      } else if (isYesterday(date)) {
        groupKey = "Yesterday";
      } else {
        groupKey = format(date, "MMMM d, yyyy");
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conv);
    });
    
    return groups;
  };

  const formatTime = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, "h:mm a");
    } else if (isYesterday(d)) {
      return "Yesterday";
    } else {
      return format(d, "MMM d");
    }
  };

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`overlay fixed inset-0 bg-black/50 transition-all duration-300 z-50 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`sidebar fixed h-full bg-card text-card-foreground border-r border-border transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: "280px", top: 0, left: 0 }}
      >
        <div className="relative p-3 border-b border-border/60 bg-gradient-to-br from-card to-accent/20">
          <div className="absolute left-3 right-3 -top-[2px]">
            <div className="h-1 rounded-full bg-gradient-to-r from-primary via-accent to-primary" />
          </div>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">Chat History</h5>
            <button 
              className="inline-flex items-center justify-center rounded-md px-2 py-1 text-card-foreground transition hover:scale-105 bg-sidebar-accent/40 hover:bg-sidebar-accent/60 focus:outline-none"
              onClick={onNewChat}
              title="New Chat"
              aria-label="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-3 overflow-y-auto" style={{ height: "calc(100vh - 80px)" }}>
          {Object.entries(groupedConversations).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquareText className="w-6 h-6 mb-2 inline-block" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            Object.entries(groupedConversations).map(([groupKey, convs]) => (
              <div key={groupKey} className="mb-4">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  {groupKey}
                </div>
                
                {convs.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`chat-item group p-2 mb-2 rounded cursor-pointer transition-colors ${
                      currentConversationId === conversation.id 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {conversation.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(conversation.createdAt || null)}
                        </div>
                      </div>
                      <button
                        className="btn btn-link p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversationMutation.mutate(conversation.id);
                        }}
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}