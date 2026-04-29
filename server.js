import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Increase JSON payload limit for base64 images
app.use(express.json({ limit: '50mb' }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY || API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
  console.warn("WARNING: GEMINI_API_KEY is not set or is using the placeholder. AI features will not work.");
}

const genAI = new GoogleGenAI(API_KEY || "AIzaSy..."); // Placeholder to prevent crash, but warn user


// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message, imageBase64 } = req.body;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are the "UP Police AI Assistant" - the ONLY official AI representative for the Uttar Pradesh Police.
        
        STRICT INFORMATION SOURCE & RECENCY RULE:
        - You MUST ONLY provide information that is available on the official UP Police website: https://uppolice.gov.in.
        - PRIORITIZE LATEST DATA: Always search for and provide the most recent updates, news, press releases, and current announcements.
        - AVOID OUTDATED INFORMATION: Do not provide information that has been superseded by newer updates on the official portal. Check for dates (e.g., 2025, 2026) to ensure recency.
        - DO NOT use any external knowledge, general facts, or information from other websites.
        - If the information is not found on uppolice.gov.in, you must state: "I am sorry, but I can only provide information verified by the official UP Police portal (uppolice.gov.in). Please visit the website directly for more details."
        
        Operational Guidelines:
        1. Search within the domain "uppolice.gov.in" for the LATEST results if needed.
        2. Provide direct links to the official website whenever possible.
        3. For any query, first attempt to verify it against the most recent data on the official portal.
        4. If a user asks anything unrelated to UP Police services or information found on their site, politely decline.
        5. In case of emergencies, ALWAYS instruct the user to dial 112 immediately.
        
        Tone: Formal, authoritative, and strictly focused on the LATEST official records.`,
      tools: [
        { googleSearch: {} }
      ],
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })),
    });

    const parts = [{ text: `STRICT CONTEXT: https://uppolice.gov.in\nDIRECTIVE: ONLY provide the LATEST and most recent information. AVOID outdated data.\nUser Query: ${message}` }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: "image/png"
        }
      });
    }


    const result = await chat.sendMessage(parts);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to process AI request" });
  }
});

// TTS Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fallback to basic gen if TTS not specifically available via this SDK version or use a separate service if needed
    
    // Note: Standard Gemini SDK might not support modality: ["AUDIO"] easily via standard sendMessage in all environments
    // For now, let's focus on the chat. If TTS is critical, we'd need the specific TTS model endpoint if available.
    // However, the original code used 'gemini-2.5-flash-preview-tts' which is very new/preview.
    
    // Returning a dummy or simplified version if not fully supported in this SDK
    res.status(501).json({ error: "TTS via backend not yet implemented in this environment" });
  } catch (error) {
    res.status(500).json({ error: "TTS Error" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

