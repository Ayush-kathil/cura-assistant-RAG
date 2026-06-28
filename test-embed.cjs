const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent("Hello world");
    console.log("Embed success!", result.embedding.values.slice(0, 5));
  } catch(e) {
    console.error("Single embed error:", e.message);
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result2 = await model2.batchEmbedContents({
      requests: [{ content: { role: 'user', parts: [{text: "Hello"}] } }]
    });
    console.log("Batch embed success!", result2.embeddings[0].values.slice(0,5));
  } catch(e) {
    console.error("Batch embed error:", e.message);
  }
}
run();
