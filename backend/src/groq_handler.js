import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config({ quiet: true });

const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  : null;

export async function queryGroq(query) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
  });

  return response.choices[0].message.content;
}
