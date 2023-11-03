import OpenAI from "openai";
import dotenv from "dotenv";
const red = "\x1b[31m\x1b[1m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const green = "\x1b[32m";
import { performance } from "perf_hooks";
import fs from "fs";
import { applyPatchToViaStrings as applyPatchViaStrings } from "./utils/apply_patch";
import { extractCodeFromMarkdown } from "./utils/markdown_utils";

dotenv.config();

console.log("initializing OpenAI");
console.log(red + yellow + "Welcome to MetaPrompting" + "\x1b[0m\x1b[22m");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const filePath = `examples/hello7/hello.ts`;
// const filePath = `examples/hello_simple/hello.ts`;
// const filePath = `src/utils/apply_patch.ts`;
const filePath = `src/index_openai.ts`;
const origFileContent = fs.readFileSync(filePath, "utf8");
console.log(blue + `original file content:${origFileContent}` + "\x1b[0m\x1b[22m");
console.log(blue + `original file content:${origFileContent}` + "\x1b[0m");
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
  //     print iteration numbers in the inner loop. Remove printing iteration number in the outer loop. Change divisibility from odd to div by 3.

  //     make it say hello Earth

  //     put it in a loop to execute 7 times. On odd iterations, it should print "odd!" and then print "odd it is". Wrap the whole code into a function and call it.

  const userPrompt = `
    At the start of the program, print a welcome message "Welcome to MetaPrompting" in nice terminal colors - red and yellow colors. Have the color control sequences in const-s.
    Print original file contents in blue.
    Print new file contents in green.
    Remember to switch color back to default. Without external libraries.
`;

  const customGuidelines = [
    `Use strictest TypeScript settings in the code you generate.`,
    // `Generate unit tests`,
    // `Use newest libraries, API-s and language settings and style.`
  ];

  const promptText = `Given this file: 
File: ${filePath} :
\`\`\`
${origFileContent}
\`\`\`
    ${userPrompt}
    =====
    ${customGuidelines.join("\n")}
    
    Print me the output as .patch file that can be automatically applied. The patch should contain proper indentation.
    Just print the file patches. No explanations, no pleasantries, no prelude.
    Before each file you output, provide full file path.`;
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: promptText }],
    // model: "gpt-3.5-turbo",
    model: "gpt-4",
    temperature: 0,
  });

  console.debug(`chatCompletion.choices`, chatCompletion.choices);
  const responseContent = chatCompletion.choices[0].message.content;
  console.debug(`chatCompletion.choices...`, responseContent);
  console.log(green + `new file content:${responseContent}` + "\x1b[0m\x1b[22m");
  const responsePatch = extractCodeFromMarkdown(responseContent!);
  console.debug(`responsePatch:` + responsePatch);
  const patched = applyPatchViaStrings(responsePatch, origFileContent); /// WARNING: PATCH IS FIRST ARG, then ORIG content
  console.info("patched: \n \n", patched);

  const patchedFilePath = filePath.replace(".ts", ".patched.ts");
  console.log("patchedFilePath", patchedFilePath);
  fs.writeFileSync(patchedFilePath, patched);

  const end = performance.now();
  //   console.log(`Total time taken: ${end - start} ms.`);

  const tokensUsed = chatCompletion!.usage!.total_tokens;
  console.log(`Tokens used: ${tokensUsed}`);

  const costInDollars = (tokensUsed * 0.06) / 1000; // assuming $0.06 per token
  console.log(`Cost in dollars: $${costInDollars.toFixed(2)}`);

  require("ts-node").register();
  console.log("===== Will execute", patchedFilePath);
  require("../" + patchedFilePath);
  console.log("===== Finished executing", patchedFilePath);
}

main();