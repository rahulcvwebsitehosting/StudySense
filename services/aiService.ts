
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const refineNotesWithGemini = async (transcript: string): Promise<string> => {
  if (!transcript.trim()) return "";

  try {
    const prompt = `
      You are an expert study assistant. Refine the following raw text into a clean, structured study note.

      Output Rules:
      1. Return ONLY plain text.
      2. Do NOT use Markdown symbols (no #, *, **, _).
      3. Do NOT use emojis.
      4. Use simple dashes (-) for bullet points.
      5. Keep sentences concise and easy to read.
      6. Fix grammar and remove filler words.
      7. Structure with clear sections using UPPERCASE labels (e.g., SUMMARY:, KEY POINTS:).

      Raw Text:
      "${transcript}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Could not generate notes.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to refine notes. Please check your API key or internet connection.");
  }
};

export const getMoodReflectionFeedback = async (mood: string, userReflection: string): Promise<string> => {
  try {
    const prompt = `
      The user was studying and felt "${mood}". 
      When asked why, they replied: "${userReflection}".
      
      Provide a short, supportive, and constructive response (max 2 sentences). 
      If they were happy/focused, encourage them. 
      If they were negative, offer a specific tip to help.
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
    });

    return response.text || "Keep going, you're doing great!";
  } catch (error) {
    console.error("AI Reflection Error", error);
    return "Thanks for sharing. Keep up the good work!";
  }
};

export const askStudyTutor = async (query: string, context?: string): Promise<string> => {
    if (!query.trim()) return "";
    
    try {
        const prompt = `
            You are a helpful, encouraging academic tutor.
            
            CONTEXT ABOUT THE USER'S SESSION:
            ${context || "No specific session data available."}

            User Question: "${query}"
            
            Instructions:
            1. Answer the user's question clearly and concisely.
            2. If relevant, reference their mood/stats from the context (e.g., "I see you were frustrated, let's break this down simply").
            3. If the question is not related to studying or academic topics, politely steer them back to studying.
        `;
        
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt
        });
        
        return response.text || "I couldn't find an answer for that specific query.";
    } catch (error) {
        console.error("AI Tutor Error", error);
        throw new Error("Failed to get answer. Please check your connection.");
    }
};

export const askAppSupport = async (query: string, history: { role: string; text: string }[]): Promise<string> => {
  if (!query.trim()) return "";

  try {
    const historyText = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
    
    const prompt = `
      You are the friendly, helpful support AI for the StudySense web app.
      
      APP CONTEXT:
      - **What is StudySense?**: A privacy-first AI study companion that runs entirely in the browser.
      - **Privacy**: 100% Local. Webcam data is processed via Face-API.js (TensorFlow) on the user's device. No video is ever sent to a server.
      - **Features**: 
        - Real-time Mood Detection (Happy, Sad, Frustrated, Focused, etc.).
        - Focus Tracking (based on gaze and expression).
        - Posture Alerts (detects slouching relative to calibrated position).
        - Smart Timer (tracks focus duration).
        - Session Summary (Graphs, Stats, AI Reflection).
        - Note Refiner (Uses AI to structure rough notes).
      - **Troubleshooting**:
        - "Camera not working": Check browser permissions (lock icon in address bar). Ensure no other app is using camera.
        - "Models not loading": Check internet connection (models load from CDN once).
        - "Analysis seems wrong": Ensure good lighting and face the camera directly. Use the "Calibrate" button in session.

      YOUR GOAL:
      Answer the user's question specifically about this app. Keep answers short (under 3 sentences) unless a detailed explanation is needed.
      If the user asks about general topics (e.g., "What is the capital of France?"), politely explain you only help with StudySense features.

      CONVERSATION HISTORY:
      ${historyText}

      USER QUESTION: "${query}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("App Support Bot Error", error);
    return "I'm having trouble connecting to the support brain. Please check your internet.";
  }
};
