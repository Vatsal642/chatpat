import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export async function generateTextResponse(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini text generation error:", error);
    throw new Error(`Failed to generate text response: ${error}`);
  }
}

export async function generateImage(
  prompt: string,
  outputPath?: string
): Promise<{ imagePath?: string; imageData?: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("No content in response");
    }

    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageData = part.inlineData.data;
        
        if (outputPath) {
          const imageBuffer = Buffer.from(imageData, "base64");
          fs.writeFileSync(outputPath, imageBuffer);
          return { imagePath: outputPath };
        }
        
        return { imageData };
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini image generation error:", error);
    throw new Error(`Failed to generate image: ${error}`);
  }
}

export async function isImageGenerationRequest(message: string): Promise<boolean> {
  const imageKeywords = [
    'generate image', 'create image', 'draw', 'paint', 'sketch',
    'image of', 'picture of', 'photo of', 'illustration of',
    'visualize', 'show me', 'design'
  ];
  
  const lowerMessage = message.toLowerCase();
  return imageKeywords.some(keyword => lowerMessage.includes(keyword));
}
