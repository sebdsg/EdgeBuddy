
import { GoogleGenAI, Type } from "@google/genai";

// Instantiate GoogleGenAI per-call to ensure fresh API key usage from the environment or dialog.

export async function getLiveGames(sports: string[]) {
  // Use a fresh instance for each request to ensure the latest API key is used as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the 5 biggest upcoming sports matches for today/tomorrow in these sports: ${sports.join(', ')}. 
      Return them in a JSON list of objects. Each object should have: id, sport, league, homeTeam, awayTeam, startTime (e.g. "7:00 PM ET"), and 3 'insights' based on recent form.`,
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
              startTime: { type: Type.STRING },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    const games = JSON.parse(response.text);
    return games.map((g: any) => ({ ...g, groundingSources: sources }));
  } catch (error) {
    console.error("Live Games Error:", error);
    return [];
  }
}

export async function getGameAnalysis(homeTeam: string, awayTeam: string, sport: string) {
  // Use a fresh instance for each request to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for current news, injury reports, and betting odds for ${homeTeam} vs ${awayTeam} in ${sport}. 
      Provide 4 bullet points of "Quick Take" insights including latest news. 
      Also provide 3 "Betting Angles" in JSON format with title, why it makes sense, what could break it, risk level (Low/Medium/High), market, and selection.`,
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
                }
              }
            }
          }
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    const data = JSON.parse(response.text);
    return { ...data, sources };
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
}

export async function generateProImage(prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: "1:1" | "16:9" | "9:16" = "16:9") {
  // Creating a fresh GoogleGenAI instance right before making an API call for pro models.
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

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    // Handling specific API key/billing issues to trigger re-selection.
    if (error.message?.includes("Requested entity was not found.")) {
       throw new Error("API_KEY_ERROR");
    }
    console.error("Pro Image Generation Error:", error);
    return null;
  }
}

export async function editImage(base64Image: string, prompt: string, mimeType: string = 'image/jpeg') {
  // Use a fresh instance for each request to ensure the latest API key is used.
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

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
}

export async function generateAngleImage(angleTitle: string, sport: string): Promise<string | null> {
  // Use a fresh instance for each request to ensure the latest API key is used.
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
  // Use a fresh instance for each request to ensure the latest API key is used.
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
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) { return null; }
}
