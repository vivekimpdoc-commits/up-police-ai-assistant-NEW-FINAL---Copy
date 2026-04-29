import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Message {
  role: "user" | "model";
  text: string;
  image?: string; // Base64 image data
}

export async function sendMessage(history: Message[], message: string, imageBase64?: string): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are the "UP Police AI Assistant" - the ONLY official AI representative for the Uttar Pradesh Police.
        
        STRICT INFORMATION SOURCE & RECENCY RULE:
        - You MUST ONLY provide information that is available on the official UP Police website: https://uppolice.gov.in.
        - PRIORITIZE LATEST DATA: Always search for and provide the most recent updates, news, press releases, and current announcements.
        - AVOID OUTDATED INFORMATION: Do not provide information that has been superseded by newer updates on the official portal. Check for dates (e.g., 2025, 2026) to ensure recency.
        - DO NOT use any external knowledge, general facts, or information from other websites.
        - If the information is not found on uppolice.gov.in, you must state: "I am sorry, but I can only provide information verified by the official UP Police portal (uppolice.gov.in). Please visit the website directly for more details."
        
        Operational Guidelines:
        1. Use Google Search grounding EXCLUSIVELY to search within the domain "uppolice.gov.in" for the LATEST results.
        2. Provide direct links to the official website whenever possible.
        3. For any query, first attempt to verify it against the most recent data on the official portal.
        4. If a user asks anything unrelated to UP Police services or information found on their site, politely decline.
        5. In case of emergencies, ALWAYS instruct the user to dial 112 immediately.
        
        Tone: Formal, authoritative, and strictly focused on the LATEST official records.`,
        tools: [
          { urlContext: {} },
          { googleSearch: {} }
        ],
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [
          { text: msg.text },
          ...(msg.image ? [{ inlineData: { data: msg.image.split(',')[1], mimeType: "image/png" } }] : [])
        ]
      }))
    });

    const parts: any[] = [{ text: `STRICT CONTEXT: https://uppolice.gov.in\nDIRECTIVE: ONLY provide the LATEST and most recent information. AVOID outdated data.\nUser Query: ${message}` }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: "image/png"
        }
      });
    }

    const result = await chat.sendMessage({ message: parts as any });
    return result.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Error in geminiService:", error);
    return "I am having trouble connecting to my knowledge base. Please try again later or visit the official UP Police website.";
  }
}

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this clearly and professionally: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
