import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateTextResponse, generateImage, isImageGenerationRequest } from "./gemini";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        userId,
      });
      
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conversation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create conversation" });
      }
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      const messages = await storage.getConversationMessages(conversationId, userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      // Verify user owns the conversation
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Add user message
      const userMessage = await storage.addMessage({
        conversationId,
        role: "user",
        content: content.trim(),
      });

      // Check if this is an image generation request
      const isImageRequest = await isImageGenerationRequest(content);
      
      let aiResponse: string;
      let imageUrl: string | undefined;

      if (isImageRequest) {
        try {
          const { imageData } = await generateImage(content);
          if (imageData) {
            // In a real app, you'd upload this to a cloud storage service
            // For now, we'll return the base64 data URL
            imageUrl = `data:image/png;base64,${imageData}`;
            aiResponse = "I've generated an image based on your request.";
          } else {
            aiResponse = "I apologize, but I couldn't generate an image for your request. Please try a different description.";
          }
        } catch (error) {
          console.error("Image generation error:", error);
          aiResponse = "I encountered an error while trying to generate the image. Please try again with a different prompt.";
        }
      } else {
        try {
          aiResponse = await generateTextResponse(content);
        } catch (error) {
          console.error("Text generation error:", error);
          aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again.";
        }
      }

      // Add AI response
      const aiMessage = await storage.addMessage({
        conversationId,
        role: "assistant",
        content: aiResponse,
        imageUrl,
      });

      // Update conversation title if this is the first exchange
      const messages = await storage.getConversationMessages(conversationId, userId);
      if (messages.length === 2) { // First user message + first AI response
        const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
        await storage.updateConversationTitle(conversationId, title, userId);
      }

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.delete("/api/conversations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      await storage.deleteConversation(conversationId, userId);
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types (typing indicators, etc.)
        if (message.type === 'typing') {
          // Broadcast typing indicator to other clients in the same conversation
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'typing',
                conversationId: message.conversationId,
                isTyping: message.isTyping
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
