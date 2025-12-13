import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateInsight = async (contextData: string): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Using simulated AI insight: Based on current trends, we recommend increasing ADR for weekend bookings to capitalize on high leisure demand. Corporate bookings show a 5% decline, suggesting a need for targeted B2B marketing campaigns.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Act as a senior hotel data analyst. 
      Analyze the following hotel performance context and provide a strategic executive summary (max 3 sentences).
      Highlight risks and opportunities.
      
      Context: ${contextData}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Insight temporarily unavailable due to connection issues.";
  }
};