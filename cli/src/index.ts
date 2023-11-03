import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_URL =
  "https://api.openai.com/v1/engines/davinci-codex/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("OpenAI API Key not found in .env file.");
  process.exit(1);
}

async function sendPromptToOpenAI(prompt: string) {
  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        prompt: prompt,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices?.[0]?.text.trim();
  } catch (error) {
    console.error("Error contacting OpenAI:", error);
  }
}

async function main() {
  const prompt =
    'Translate the following English text to French: "Hello, how are you?"';
  const response = await sendPromptToOpenAI(prompt);

  if (response) {
    console.log("OpenAI Response:", response);
  } else {
    console.log("No response from OpenAI.");
  }
}

main();
