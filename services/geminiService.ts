
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Helper to extract JSON from a model response, handling potential markdown wrappers or unexpected text.
 */
function parseModelJson(text: string | undefined) {
  if (!text) return null;
  try {
    // Remove markdown code blocks if the model wrapped them despite instructions
    const cleanJson = text.replace(/```json\n?|```/g, "").trim();
    // Find the first [ or { and last ] or } to handle cases where text surrounds the JSON
    const startIdx = Math.max(cleanJson.indexOf('['), cleanJson.indexOf('{'));
    const endIdx = Math.max(cleanJson.lastIndexOf(']'), cleanJson.lastIndexOf('}'));
    
    if (startIdx === -1 || endIdx === -1) return JSON.parse(cleanJson);
    
    const jsonSubstring = cleanJson.substring(startIdx, endIdx + 1);
    return JSON.parse(jsonSubstring);
  } catch (e) {
    console.error("JSON Parsing Error:", e, "Raw text snippet:", text?.substring(0, 100));
    return null;
  }
}

export async function getLiveGames(sports: string[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for the 5 most popular upcoming or live sports matches for: ${sports.join(', ')}. 
      Provide the details in a valid JSON array. 
      For each match, include: id, sport, league, homeTeam, awayTeam, startTime, and 3 insights.
      Also, try to find a direct URL to the official team logo (.png or .svg) for both teams. If a direct URL isn't found, use an empty string.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              sport: { type: Type.STRING },
              league: { type: Type.STRING },
              homeTeam: { type: Type.STRING },
              awayTeam: { type: Type.STRING },
              homeLogoUrl: { type: Type.STRING },
              awayLogoUrl: { type: Type.STRING },
              startTime: { type: Type.STRING },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['id', 'sport', 'league', 'homeTeam', 'awayTeam', 'startTime', 'insights']
          }
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    const games = parseModelJson(response.text);
    
    if (Array.isArray(games)) {
      return games.map((g: any) => ({ 
        ...g, 
        insights: Array.isArray(g.insights) ? g.insights : [],
        homeLogoUrl: g.homeLogoUrl || '',
        awayLogoUrl: g.awayLogoUrl || '',
        groundingSources: sources 
      }));
    }
    return [];
  } catch (error) {
    console.error("Live Games Error:", error);
    return [];
  }
}

export async function getGameAnalysis(homeTeam: string, awayTeam: string, sport: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for current news, injury reports, and betting odds for ${homeTeam} vs ${awayTeam} in ${sport}. 
      Provide 4 bullet points of "Quick Take" insights. 
      Also provide 3 "Betting Angles" in JSON format with: title, why, risk, riskLevel, market, and selection.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quickTakes: { type: Type.ARRAY, items: { type: Type.STRING } },
            angles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  why: { type: Type.STRING },
                  risk: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  market: { type: Type.STRING },
                  selection: { type: Type.STRING }
                },
                required: ['title', 'why', 'risk', 'riskLevel', 'market', 'selection']
              }
            }
          },
          required: ['quickTakes', 'angles']
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    const data = parseModelJson(response.text);
    if (data) {
      return { 
        quickTakes: Array.isArray(data.quickTakes) ? data.quickTakes : [],
        angles: Array.isArray(data.angles) ? data.angles : [],
        sources 
      };
    }
    return null;
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
}

export async function generateProImage(prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: "1:1" | "16:9" | "9:16" = "16:9") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found.")) {
       throw new Error("API_KEY_ERROR");
    }
    console.error("Pro Image Generation Error:", error);
    return null;
  }
}

export async function editImage(base64Image: string, prompt: string, mimeType: string = 'image/jpeg') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType } },
          { text: prompt }
        ]
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
}

export async function generateAngleImage(angleTitle: string, sport: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Professional high-end sports broadcast graphic for "${angleTitle}" in ${sport}. Sleek 3D isometric minimalist design, cinematic lighting, vibrant blues and indigos. No text.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });
    if (response.generatedImages?.[0]?.image?.imageBytes) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getValueExplanation(game: string, market: string, selection: string, odds: string, appProb: number, rating: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Game: ${game}, Market: ${market}, Selection: ${selection}, Odds: ${odds}, AI Prob: ${(appProb*100).toFixed(1)}%, Rating: ${rating}. Explain this value in plain English with 3 bullets why and 2 bullets risk.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['points', 'risks']
        }
      }
    });
    const data = parseModelJson(response.text);
    return data || { points: [], risks: [] };
  } catch (error) { return null; }
}
