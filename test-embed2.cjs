const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent("Hello world");
    console.log("embedding-001 Embed success!", result.embedding.values.slice(0, 5));
  } catch(e) {
    console.error("embedding-001 error:", e.message);
  }
}
run();
