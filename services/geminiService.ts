
import { GoogleGenAI, Type } from "@google/genai";
import { Game } from "../types";

/**
 * Helper to extract JSON from a model response, handling potential markdown wrappers.
 */
function parseModelJson(text: string | undefined) {
  if (!text) return null;
  try {
    const cleanJson = text.replace(/```json\n?|```/g, "").trim();
    const startIdx = Math.max(cleanJson.indexOf('['), cleanJson.indexOf('{'));
    const endIdx = Math.max(cleanJson.lastIndexOf(']'), cleanJson.lastIndexOf('}'));
    
    if (startIdx === -1 || endIdx === -1) return JSON.parse(cleanJson);
    
    const jsonSubstring = cleanJson.substring(startIdx, endIdx + 1);
    return JSON.parse(jsonSubstring);
  } catch (e) {
    console.error("JSON Parsing Error:", e);
    return null;
  }
}

const MOCK_FALLBACK_GAMES: Game[] = [
  {
    id: 'f1',
    sport: 'Soccer',
    league: 'UCL',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Real Madrid',
    homeLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
    awayLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
    startTime: 'Today, 21:00',
    insights: ['High defensive block expected', 'Kane in scoring form', 'History favors the visitors']
  }
];

export async function getLiveGames(sports: string[]): Promise<Game[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Reference Date: ${todayStr}. 
      Search sofascore.com specifically for the most popular UPCOMING or LIVE sports matches for: ${sports.join(', ')}.
      Must be matches happening TODAY or TOMORROW.
      
      For each match provide:
      1. id, sport, league, homeTeam, awayTeam, startTime (Local Time).
      2. 3 AI insights based on current form.
      3. A DIRECT high-resolution URL to the official team logo (.png or .svg) from Sofascore or official sources.
      
      Return as a JSON array.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 8000 },
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
    if (Array.isArray(games) && games.length > 0) {
      return games.map((g: any) => ({ ...g, groundingSources: sources }));
    }
    return MOCK_FALLBACK_GAMES.filter(g => sports.includes(g.sport as any));
  } catch (error) {
    console.error("Live Games Error:", error);
    return MOCK_FALLBACK_GAMES;
  }
}

export async function getGameAnalysis(homeTeam: string, awayTeam: string, sport: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze ${homeTeam} vs ${awayTeam} in ${sport}. Focus on injury reports and latest news from Sofascore.`,
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

    const data = parseModelJson(response.text);
    return data;
  } catch (error) { return null; }
}

export async function generateProImage(prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "16:9") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio as any
        }
      }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found.")) throw new Error("API_KEY_ERROR");
    return null;
  }
}

export async function editImage(base64Image: string, prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
}

export async function analyzeImage(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Identify the sport, teams, and players in this image. Provide a brief expert analysis of what's happening." }
        ]
      }
    });
    return response.text;
  } catch (error) { return "Could not analyze image."; }
}

export async function generateVideoWithVeo(base64Image: string, prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Animate this sports scene with dynamic cinematic motion',
      image: {
        imageBytes: base64Image.split(',')[1],
        mimeType: 'image/jpeg'
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Veo Error:", error);
    return null;
  }
}

export async function generateAngleImage(angleTitle: string, sport: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Cinematic sports graphic for "${angleTitle}" in ${sport}. Minimalist, high-end 3D aesthetic.`,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
    });
    if (response.generatedImages?.[0]?.image?.imageBytes) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    return null;
  } catch (error) { return null; }
}

export async function getValueExplanation(game: string, market: string, selection: string, odds: string, appProb: number, rating: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain value for ${selection} in ${game} at ${odds}. AI Prob: ${(appProb*100).toFixed(1)}%.`,
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
    return parseModelJson(response.text);
  } catch (error) { return null; }
}
