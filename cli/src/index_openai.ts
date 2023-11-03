import OpenAI from "openai";
import dotenv from "dotenv";
import { performance } from "perf_hooks";
import fs from "fs";
import { applyPatchToViaStrings } from "./apply_patch";
import { extractCodeFromMarkdown } from "./utils/markdown_utils";

dotenv.config();

// console.log(process.env.OPENAI_API_KEY)
console.log('initializing OpenAI')
const openai = new OpenAI({
  //   apiKey: "My API Key", // defaults to process.env["OPENAI_API_KEY"]
  apiKey: process.env.OPENAI_API_KEY,
});

const filePath = `examples/hello7/hello.ts`;
const fileContent = fs.readFileSync(filePath, "utf8");
// const fileContent = `const startTime = Date.now();

// for (let i = 1; i <= 99; i++) {
//     console.log(\`Iteration: \${i}\`);
//     if (i % 2 === 0) {
//         for (let j = 0; j < 7; j++) {
//             console.log(\`hi\`);
//         }
//     }
// }

// console.log(\`Total time taken: \${Date.now() - startTime}ms\`);
// `

async function main() {
    const promptText = `Given this file: 
File: ${filePath}
\`\`\`
${fileContent}    
\`\`\`

    print iteration numbers in the inner loop. Remove printing iteration number in the outer loop. Change divisibility from odd to div by 3.
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

  console.debug(`chatCompletion.choices`, chatCompletion.choices);
  const responseContent = chatCompletion.choices[0].message.content;
  console.debug(`chatCompletion.choices...`, responseContent);
  const responsePatch = extractCodeFromMarkdown(responseContent!);
  const patched = applyPatchToViaStrings(fileContent, responsePatch);
  console.info("patched: \n \n", patched);

      const end = performance.now();
    //   console.log(`Total time taken: ${end - start} ms.`);

      const tokensUsed = chatCompletion!.usage!.total_tokens;
      console.log(`Tokens used: ${tokensUsed}`);

      const costInDollars = (tokensUsed * 0.06) / 1000; // assuming $0.06 per token
      console.log(`Cost in dollars: $${costInDollars.toFixed(2)}`);
}

main();
