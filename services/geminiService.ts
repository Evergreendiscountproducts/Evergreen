import { GoogleGenAI, Type } from "@google/genai";
import { FenceConfig, DesignAdvice } from "../types";

const getClient = (): GoogleGenAI => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDesignAdvice = async (config: FenceConfig): Promise<DesignAdvice> => {
  const ai = getClient();
  
  const prompt = `
    You are a professional landscape architect and garden designer.
    The user has designed a fence with the following configuration:
    - Main Panel Color: ${config.panelColor}
    - Post Color: ${config.postColor}
    - Trellis Style: ${config.trellisType}
    - Trellis Color: ${config.trellisColor}
    - Height: ${config.height}mm
    - Length: ${config.width} panels

    Provide a brief, encouraging design critique. Explain why these colors work well together (or if they contrast boldly).
    Suggest 3 specific types of plants or garden features that would look excellent against this specific fence background.
    
    Keep the tone professional yet friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy title for this fence style" },
            advice: { type: Type.STRING, description: "A paragraph of design advice" },
            suggestedPlants: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 plants"
            }
          },
          required: ["title", "advice", "suggestedPlants"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DesignAdvice;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails or key is missing
    return {
      title: "Classic Garden Look",
      advice: "This configuration provides a timeless backdrop for any garden. The colors selected are durable and stylish.",
      suggestedPlants: ["Climbing Roses", "Clematis", "Evergreen Shrubs"]
    };
  }
};
