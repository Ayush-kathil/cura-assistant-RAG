const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
async function run() {
  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result2 = await model2.batchEmbedContents({
      requests: [{ content: { role: 'user', parts: [{text: "Hello"}] } }]
    });
    console.log("gemini-embedding-2 batch success!");
  } catch(e) {
    console.error("gemini-embedding-2 batch error:", e.message);
  }
}
run();
