import { GoogleGenAI } from "@google/genai";

export const generateVeoVideo = async (prompt: string): Promise<string> => {
  console.log("Initiating Veo Video Generation...");
  
  // Create a new instance to ensure up-to-date key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fallback video for demo purposes
  const FALLBACK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '9:16'
      }
    });

    console.log('Veo operation started', operation);

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
      console.log('Veo polling status:', operation.metadata?.state);
    }
    
    if (operation.error) {
        throw new Error(`Veo generation failed: ${operation.error.message}`);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI in response");

    // Append API key for playback/download access
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error: any) {
    console.error("Veo Generation Error:", error);
    
    // Check if error is due to missing key or permissions
    if (error.message?.includes('403') || error.message?.includes('API key')) {
        console.warn("API Key issue detected. Ensure a valid key is selected.");
    }
    
    return FALLBACK_VIDEO;
  }
};