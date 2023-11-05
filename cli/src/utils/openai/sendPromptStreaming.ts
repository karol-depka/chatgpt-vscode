import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://openrouter.ai/api/v1",
});

export async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a helpful assistant." }, // TODO check those roles with content
      { role: "user", content: "Hello!" },
    ],
    stream: true,
  });

  for await (const chunk of completion) {
    console.log(chunk.choices[0].delta.content);
  }
}

main();
