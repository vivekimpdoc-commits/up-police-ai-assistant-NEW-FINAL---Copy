import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

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

// Initialize the new Google Gen AI client
const client = createClient({ apiKey: API_KEY || "AIzaSy..." });


// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message, imageBase64 } = req.body;
    
    // Formatting history for the new SDK
    const contents = history.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // Adding the current user message and optional image
    const userParts = [{ text: `STRICT CONTEXT: https://uppolice.gov.in\nDIRECTIVE: ONLY provide the LATEST and most recent information. AVOID outdated data.\nUser Query: ${message}` }];
    
    if (imageBase64) {
      userParts.push({
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: "image/png"
        }
      });
    }

    contents.push({
      role: 'user',
      parts: userParts
    });

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash", // Use 2.0 Flash for best results in 2026
      contents: contents,
      config: {
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
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to process AI request" });
  }
});

// TTS Endpoint (Simplified/Stubbed as per project state)
app.post('/api/tts', async (req, res) => {
  try {
    res.status(501).json({ error: "TTS via backend not yet implemented in this environment" });
  } catch (error) {
    res.status(500).json({ error: "TTS Error" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("The application build (dist/index.html) is missing. Please run 'npm run build' before starting the server.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
     console.warn("WARNING: 'dist' directory not found. Ensure you have run 'npm run build'.");
  }
});
