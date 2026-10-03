const { GoogleGenAI } = require('@google/genai');
async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // or any key? wait, it will fail if I don't have a key.
    console.log("SDK loaded");
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
