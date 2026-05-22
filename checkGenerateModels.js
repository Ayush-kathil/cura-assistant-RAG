const fs = require("fs");

async function check() {
  const envFile = fs.readFileSync(".env.local", "utf-8");
  const keyLine = envFile.split("\n").find(line => line.startsWith("NEXT_PUBLIC_GEMINI_API_KEY="));
  if (!keyLine) return console.log("No key");
  const key = keyLine.split("=")[1].trim();

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await response.json();
  
  if (data.error) {
    console.error("API Error:", data.error);
    return;
  }

  const generateModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"));
  console.log("Supported Generate Models:", generateModels.map(m => m.name));
}

check();
