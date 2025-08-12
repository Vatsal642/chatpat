import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function callGeminiText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text;
}

// Image generation using Imagen 3.0 Fast via the Generative AI Images API (Node SDK provides generateContent with image output)
export async function callImagen(prompt: string): Promise<string> {
  // Some SDK versions support image generation via the same client with model 'imagen-3.0-fast'
  const model = genAI.getGenerativeModel({ model: 'imagen-3.0-fast' as any });
  const result = await model.generateContent(prompt);
  // The response may include base64 images; for demo, return a data URL if present
  const images = (result.response as any).candidates?.[0]?.content?.parts?.filter((p: any) => p.inlineData)?.map((p: any) => p.inlineData) ?? [];
  if (images.length > 0) {
    const first = images[0];
    const dataUrl = `data:${first.mimeType};base64,${first.data}`;
    return dataUrl;
  }
  // Fallback: return text if image not available
  return 'Image generation is not available right now.';
}