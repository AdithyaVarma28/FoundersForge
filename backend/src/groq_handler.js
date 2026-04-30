import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

console.log(`[Groq] Using model: ${MODEL}`);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function queryGroq(prompt, { temperature = 0.3, maxTokens = 2048 } = {}) {
  console.log(`[Groq] Sending request to model: ${MODEL}`);
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature,
    max_tokens: maxTokens,
    messages: [
      {
        role: "system",
        content: "You are a precise JSON-only AI assistant. Never output anything other than valid JSON. No markdown, no explanation, no preamble.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  console.log(`[Groq] Raw response length: ${content?.length || 0} chars`);
  return content;
}