import OpenAI from "openai";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import fs from "fs";
import {
  applyPatchToViaStrings as applyPatchViaStrings,
  printColoredDiff,
} from "./utils/apply_patch";
import { extractCodeFromMarkdown } from "./utils/markdown_utils";
import { customGuidelines } from "./custom_guidelines";
import { formattingGuidelines } from "./formattingGuidelines";
import { yellow, reset, blue, green } from "./utils/colors";
import { userPrompt } from "./userPrompt";

console.log(yellow + "Welcome to MetaPrompting Technology" + reset);

dotenv.config();

const inputFilePath = process.argv[2];
console.log(blue + "inputFilePath: " + reset, inputFilePath);
console.log(blue + "userPrompt: " + reset, userPrompt);
console.log("initializing OpenAI");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gitStatus = execSync(
  `git status --porcelain ${inputFilePath}`
).toString();
if (gitStatus.length > 0) {
  throw new Error(
    `The file ${inputFilePath} has uncommitted changes. Please commit or stash them before running this script.`
  );
}

// const filePath = `src/index_openai.ts`;
const origFileContent = fs.readFileSync(inputFilePath, "utf8");
console.log(blue + `original file content:\n${origFileContent}` + "\x1b[0m");

async function main() {

  const promptText = `Given this file:
File: ${inputFilePath} :
\`\`\`typescript
${origFileContent}
\`\`\`
    ${userPrompt}
    =====
    ${customGuidelines.join("\n\n")}

    ==== Output formatting guidelines:
    ${formattingGuidelines.join("\n\n")}
`;
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: promptText }],
    // model: "gpt-3.5-turbo",
    model: "gpt-4",
    temperature: 0,
  });

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

  const patchedFilePath = inputFilePath.replace(".ts", ".patched.ts");
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
