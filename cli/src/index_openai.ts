import OpenAI from "openai";
import dotenv from "dotenv";
import { performance } from "perf_hooks";

dotenv.config();

// console.log(process.env.OPENAI_API_KEY)
console.log('initializing OpenAI')
const openai = new OpenAI({
  //   apiKey: "My API Key", // defaults to process.env["OPENAI_API_KEY"]
  apiKey: process.env.OPENAI_API_KEY,
});

const filePath = `src/hello.ts`;
const fileContent = `const startTime = Date.now();

for (let i = 1; i <= 99; i++) {
    console.log(\`Iteration: \${i}\`);
    if (i % 2 === 0) {
        for (let j = 0; j < 7; j++) {
            console.log(\`hi\`);
        }
    }
}

console.log(\`Total time taken: \${Date.now() - startTime}ms\`);
`

async function main() {
    const promptText = `Given this file: 
File: ${filePath}
\`\`\`
${fileContent}    
\`\`\`

    print iteration numbers also in the inner loop.
    =====
    Print me the output as .patch file that can be automatically applied.
    Just print the file patches. No explanations, no pleasantries, no prelude.
    Before each file you output, provide full file path.
    `;
;
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: promptText }],
    // model: "gpt-3.5-turbo",
    model: "gpt-4",
    temperature: 0,
  });

  console.log(`chatCompletion.choices`, chatCompletion.choices);
  console.log(`chatCompletion.choices...`, chatCompletion.choices[0].message.content);
}

main();
