import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-robot text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ChatAI</h1>
            <p className="text-gray-600">Your intelligent mobile assistant</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center text-left">
              <i className="fas fa-comments text-blue-500 mr-3"></i>
              <span className="text-sm text-gray-700">Natural conversations with AI</span>
            </div>
            <div className="flex items-center text-left">
              <i className="fas fa-image text-green-500 mr-3"></i>
              <span className="text-sm text-gray-700">Generate images from text</span>
            </div>
            <div className="flex items-center text-left">
              <i className="fas fa-history text-purple-500 mr-3"></i>
              <span className="text-sm text-gray-700">Save and manage chat history</span>
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Sign in to start your AI conversation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
