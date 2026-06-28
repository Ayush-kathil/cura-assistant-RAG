const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent("Hello world");
    console.log("gemini-embedding-001 Embed success!");
  } catch(e) {
    console.error("gemini-embedding-001 error:", e.message);
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result2 = await model2.embedContent("Hello world");
    console.log("gemini-embedding-2 Embed success!");
  } catch(e) {
    console.error("gemini-embedding-2 error:", e.message);
  }
}
run();
