import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq=new Groq({
  apiKey:process.env.GROQ_API_KEY,
});

export async function queryGroq(query) {
  const response=await groq.chat.completions.create({
    model:"openai/gpt-oss-20b",
    messages:[
      {
        role:"user",
        content:query,
      },
    ],
  });

  return response.choices[0].message.content;
}