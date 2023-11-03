import OpenAI from "openai";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import fs from "fs";
import { applyPatchToViaStrings as applyPatchViaStrings, printColoredDiff } from "./utils/apply_patch";
import { extractCodeFromMarkdown } from "./utils/markdown_utils";
import { customGuidelines } from "./custom_guidelines";

const red = "\x1b[31m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const green = "\x1b[32m";
const reset = "\x1b[0m";

console.log(yellow + "Welcome to MetaPrompting Technology" + reset);

dotenv.config();

const inputFilePath = process.argv[2];
console.log(blue+"inputFilePath: " +reset, inputFilePath);
console.log("initializing OpenAI");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gitStatus = execSync(`git status --porcelain ${inputFilePath}`).toString();
if (gitStatus.length > 0) {
  throw new Error(
    `The file ${inputFilePath} has uncommitted changes. Please commit or stash them before running this script.`
  );
}


// const filePath = `src/index_openai.ts`;
const origFileContent = fs.readFileSync(inputFilePath, "utf8");
console.log(blue + `original file content:${origFileContent}` + "\x1b[0m");

async function main() {
  
  // const userPrompt = `add logging to file called log.log. Use a library like winston. Make sure logs are appended, not overwritten. Make sure output still goes to the console.`;
  const userPrompt = `Check if inputFilePath file has uncommitted changes in git status. Throw exception if so.`;

  // could run various combinations on those, automatically
  const formattingGuidelines = [
    `Modify minimum number of lines.`,
    `Do not make unrelated changes to the file`,
    `Ensure that the patch is valid`,
    // `Ensure that if you want to modify a line, it is prefixed`. // Could prefix with star or something. Could fuzzy-apply lines not matching context, as changed lines - it's what GPT4 does sometimes
  ]

  const fullPromptText = `Given this file:
File: ${inputFilePath} :
\`\`\`typescript
${origFileContent}
\`\`\`
    ${userPrompt}
    =====
    ${customGuidelines.join("\n\n")}

    
    Print me the output as .patch file that can be automatically applied. The patch should contain proper indentation.
    Just print the file patches. No explanations, no pleasantries, no prelude. 
    Always print me only the patches (each patch surrounded by markdown \`\`\`). Never print full file contents.
    If there are source code comments in the file, keep them.
    ${formattingGuidelines.join("\n\n")}

    
    Before each file you output, provide full file path.`;
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: fullPromptText }],
    // model: "gpt-3.5-turbo",
    model: "gpt-4",
    temperature: 0,
  });
  console.log(`fullPromptText:\n`, fullPromptText);

  // console.debug(`chatCompletion.choices`, chatCompletion.choices);
  const responseContent = chatCompletion.choices[0].message.content;
  // console.debug(`chatCompletion.choices...`, responseContent);
  console.log(green + `responseContent:${responseContent}` + "\x1b[0m");
  const responsePatch = extractCodeFromMarkdown(responseContent!);
  // console.debug(`responsePatch:` + green + responsePatch + "\x1b[0m");
  console.debug(`responsePatch:`);
  printColoredDiff(responsePatch);
  const patched = applyPatchViaStrings(responsePatch, origFileContent); /// WARNING: PATCH IS FIRST ARG, then ORIG content
  console.info("patched: \n \n", patched);

  const patchedFilePath = inputFilePath.replace(".ts", ".patched.ts"); // TODO check if file not modified in git
  console.log("patchedFilePath", patchedFilePath);
  fs.writeFileSync(patchedFilePath, patched);

  const end = performance.now();
  //   console.log(`Total time taken: ${end - start} ms.`);

  // https://openai.com/pricing

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
