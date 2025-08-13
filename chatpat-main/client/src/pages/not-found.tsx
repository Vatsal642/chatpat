import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6">
      <Card className="w-full max-w-md mx-4 border-border/60 shadow-lg backdrop-blur">
        <CardContent className="pt-8">
          <div className="flex mb-4 gap-3 items-center">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
