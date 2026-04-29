# 🛠️ AI Assistant Troubleshooting Guide (2026 Edition)

If you see an error in the chat, follow these steps to fix it:

## 1. "429: Resource Exhausted / Quota Exceeded"
**Why**: You are using the Google Free Tier and have sent too many messages in one minute.
**How to fix**: 
- Just wait **30-60 seconds** and try again.
- The limit is refreshed every minute.
- In `server.js`, I already switched to `gemini-2.0-flash`, which has the best free tier balance.

## 2. "404: Not Found"
**Why**: This happens if the model name is retired or your API key doesn't support it.
**How to fix**:
- Check `server.js` and ensure the model string is `gemini-2.0-flash`.
- Ensure your API key is from the **Google AI Studio** (AIza...) and not an old legacy key.

## 3. "500: Failed to process AI request"
**Why**: Something went wrong on the server side.
**How to fix**:
- Check your **Render Logs**.
- Look for "Error sending index.html" or "AI Error".
- Ensure your `GEMINI_API_KEY` environment variable is set correctly in the Render dashboard.

## 4. "The application build (dist/index.html) is missing"
**Why**: The frontend was not compiled.
**How to fix**:
- Ensure your Build Command in Render is: `npm install && npm run build`
- If you are running locally, run `npm run build` once before starting the server.

---

### Final Tip for Smooth Operation:
Always use **`npm start`** to run the server. I have optimized it to handle everything automatically!
