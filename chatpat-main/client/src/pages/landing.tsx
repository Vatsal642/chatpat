import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquareText, Image as ImageIcon, History } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-xl border-border/60 shadow-lg backdrop-blur">
        <CardContent className="pt-8 text-center">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Bot className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">ChatAI</h1>
            <p className="text-gray-600 dark:text-gray-300">Your intelligent assistant for conversation and creation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/70">
              <MessageSquareText className="text-blue-600 w-5 h-5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Natural conversations with AI</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/70">
              <ImageIcon className="text-green-600 w-5 h-5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Generate images from text</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/70">
              <History className="text-purple-600 w-5 h-5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Save and manage chat history</span>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => (window.location.href = "/api/login")}
          >
            Get Started
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Sign in to start your AI conversation</p>
        </CardContent>
      </Card>
    </div>
  );
}
