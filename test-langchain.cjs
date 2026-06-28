const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
require('dotenv').config({ path: '.env.local' });
async function run() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    });
    const result = await embeddings.embedQuery("Hello");
    console.log("text-embedding-004 success!");
  } catch(e) {
    console.error("text-embedding-004 error:", e.message);
  }
}
run();
