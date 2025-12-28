
import { GoogleGenAI, Type } from "@google/genai";
import { Game } from "../types";

/**
 * Advanced JSON extraction helper.
 * 1. Cleans markdown markers.
 * 2. Locates the first balanced JSON structure.
 * 3. Attempts to repair common truncation (missing closing brackets).
 */
function parseModelJson(text: string | undefined) {
  if (!text) return null;
  try {
    let clean = text.trim();
    
    // Remove markdown code block markers if present
    clean = clean.replace(/^```json\s*/i, "").replace(/```\s*$/g, "").trim();
    
    // Find the actual start of JSON content
    const startIdx = clean.search(/[\[\{]/);
    if (startIdx === -1) return null;

    // Find the last possible closing character
    const lastBracket = clean.lastIndexOf(']');
    const lastBrace = clean.lastIndexOf('}');
    let endIdx = Math.max(lastBracket, lastBrace);

    // If no closing character found, the model likely truncated
    if (endIdx === -1 || endIdx < startIdx) {
      // Basic repair strategy for simple truncation
      if (clean[startIdx] === '[') {
        try { return JSON.parse(clean + ']'); } catch (e) {}
      } else if (clean[startIdx] === '{') {
        try { return JSON.parse(clean + '}'); } catch (e) {}
      }
      return null;
    }

    const jsonStr = clean.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      // Second repair attempt: if it fails, check for unclosed objects inside array
      // This is a common failure point for large lists
      let repaired = jsonStr;
      if (repaired.startsWith('[') && !repaired.endsWith(']')) repaired += ']';
      if (repaired.startsWith('{') && !repaired.endsWith('}')) repaired += '}';
      try {
        return JSON.parse(repaired);
      } catch (e) {
        console.error("Failed to parse/repair JSON:", parseError);
        return null;
      }
    }
  } catch (e) {
    console.error("Unexpected parsing failure:", e);
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
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search sofascore.com and official league sites for 3-5 major sports matches for ${sports.join(', ')} scheduled for ${today}.
      CRITICAL: For 'homeLogoUrl' and 'awayLogoUrl', you must provide high-quality URLs to the OFFICIAL team crests (preferably transparent PNGs from Wikipedia Commons or official team sites). Do not provide generic sports icons or placeholder images.
      Return JSON: Array of {id, sport, league, homeTeam, awayTeam, startTime, homeLogoUrl, awayLogoUrl, insights: string[]}.`,
      config: {
        tools: [{ googleSearch: {} }],
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
    console.error("Live Games Fetch Failed:", error);
    return MOCK_FALLBACK_GAMES;
  }
}

export async function getGameAnalysis(homeTeam: string, awayTeam: string, sport: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Research news and betting trends for ${homeTeam} vs ${awayTeam} in ${sport}. 
      Include 4 quick bullet points and 3 betting angles with title, why, risk, and riskLevel (Low/Medium/High).`,
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

    return parseModelJson(response.text);
  } catch (error) { 
    console.error("Analysis Failed:", error);
    return null; 
  }
}

export async function getPlayerStats(playerName: string, sport: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search sofascore.com for the 2025/2026 season statistics of the athlete ${playerName} in ${sport}.
      Identify key performance indicators (like goals, assists, PPG, home runs, etc.) relevant to their sport.
      Return ONLY a JSON object of key-value pairs where keys are the metric names and values are the values found.
      Example: {"Goals": 10, "Assists": 5}.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return parseModelJson(response.text);
  } catch (error) {
    console.error("Player Stats Fetch Failed:", error);
    return null;
  }
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
          { text: "Detailed sports analysis of this image. Identify teams, players, and game context." }
        ]
      }
    });
    return response.text;
  } catch (error) { return "Analysis failed due to a transient error."; }
}

export async function generateVideoWithVeo(base64Image: string, prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Animate this sports photo with dynamic cinematic motion',
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
    console.error("Veo Video Generation Error:", error);
    return null;
  }
}

export async function generateAngleImage(angleTitle: string, sport: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Cinematic high-contrast sports graphic for "${angleTitle}" in ${sport}. Modern 3D style, no text.`,
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
      contents: `Explain the betting value for ${selection} in ${game} at ${odds}. AI estimated win probability: ${(appProb*100).toFixed(1)}%.`,
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
