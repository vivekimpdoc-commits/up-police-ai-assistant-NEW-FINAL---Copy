export interface Message {
  role: "user" | "model";
  text: string;
  image?: string; // Base64 image data
}

export async function sendMessage(history: Message[], message: string, imageBase64?: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        message,
        imageBase64
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Error in geminiService:", error);
    return "I am having trouble connecting to my knowledge base. Please try again later or visit the official UP Police website.";
  }
}

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.audioData || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

