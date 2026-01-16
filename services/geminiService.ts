import { GoogleGenAI, Type } from "@google/genai";
import { VideoProject } from "../types";

// Initialize Gemini Client
// NOTE: We rely on process.env.API_KEY being injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = "gemini-3-flash-preview";

export const generateViralIdeas = async (niche: string, count: number = 3): Promise<Partial<VideoProject>[]> => {
  try {
    const prompt = `
      You are an expert viral content strategist for the "${niche}" niche.
      Generate ${count} highly viral video concepts.
      Focus on high-retention hooks, controversy, or high value.
      
      Return the response in JSON format conforming to this schema:
      Array of Objects with keys: "topic", "title", "hook", "viralityScore" (number 1-100).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    title: { type: Type.STRING },
                    hook: { type: Type.STRING },
                    viralityScore: { type: Type.NUMBER }
                },
                required: ["topic", "title", "hook", "viralityScore"]
            }
        }
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating ideas:", error);
    return [];
  }
};

export const generateScript = async (topic: string, hook: string, platform: string): Promise<string> => {
  try {
    const prompt = `
      Write a viral 60-second video script for ${platform} about "${topic}".
      
      Structure:
      1. Hook (0-3s): Use the hook "${hook}"
      2. Agitation/Pattern Interrupt (3-10s)
      3. Value/Core Content (10-50s)
      4. Strong Call to Action (50-60s)
      
      Style: "Millionaire Mindset", authoritative, fast-paced.
      Include [Visual Cues] in brackets.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });

    return response.text || "Failed to generate script.";
  } catch (error) {
    console.error("Error generating script:", error);
    return "Error generating script. Please try again.";
  }
};

export const analyzeTrend = async (keyword: string): Promise<string> => {
    try {
        const prompt = `Analyze current social media trends for the keyword: "${keyword}". Provide a brief 2-sentence summary of what is working right now for this topic.`;
         const response = await ai.models.generateContent({
            model: MODEL_TEXT,
            contents: prompt,
        });
        return response.text || "No trend data available.";
    } catch (error) {
        return "Unable to analyze trends.";
    }
}
