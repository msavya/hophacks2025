import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); 
// or process.env.GEMINI_API_KEY if your bundler supports process.env in browser

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateContent = async (prompt: string) => {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text(); // ✅ get the string, not the function
    console.log(text);
    return text;
  } catch (err) {
    console.error("Error generating content:", err);
    throw err;
  }
};
