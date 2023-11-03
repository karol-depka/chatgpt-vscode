import OpenAI from "openai";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import fs from "fs";
import {
  applyPatchToViaStrings as applyPatchViaStrings,
  printColoredDiff,
} from "./utils/patching/apply_patch";
import { extractCodeFromMarkdown } from "./utils/markdown/markdown_utils";
import { customGuidelines } from "./utils/prompting/custom_guidelines";
import { formattingGuidelines } from "./utils/prompting/formattingGuidelines";
import { yellow, reset, blue, green } from "./utils/colors";
import { userPrompt } from "./utils/prompting/userPrompt";
import { checkFileNotModifiedInGitOrThrow } from "./utils/git/gitUtils";
import { showCosts } from "./utils/openai/pricingCalc";

console.log(yellow + "Welcome to MetaPrompting Technology" + reset);

dotenv.config();

const inputFilePath = process.argv[2];
console.log(blue + "inputFilePath: " + reset, inputFilePath);
console.log(blue + "userPrompt: " + reset, userPrompt);
console.log("initializing OpenAI");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

checkFileNotModifiedInGitOrThrow(inputFilePath);

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

    ==== Here I give you general output formatting guidelines - you must follow them!
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
  const patchedFileContents = applyPatchViaStrings(responsePatch, origFileContent); /// WARNING: PATCH IS FIRST ARG, then ORIG content
  console.info("patchedFileContents: \n \n", patchedFileContents);

  const patchedFilePath = inputFilePath; // inputFilePath.replace(".ts", ".patched.ts");
  console.log("will write file (after checking git status) - patchedFilePath: ", patchedFilePath);
  checkFileNotModifiedInGitOrThrow(inputFilePath); // just before writing - check again git status

  fs.writeFileSync(patchedFilePath, patchedFileContents);

  const end = performance.now();
  //   console.log(`Total time taken: ${end - start} ms.`);

  showCosts(chatCompletion);

  require("ts-node").register();
  console.log("===== Will execute", patchedFilePath);
  require("../" + patchedFilePath);
  console.log("===== Finished executing", patchedFilePath);
}

main();

