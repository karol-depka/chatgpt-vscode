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
import { yellow, reset, blue, green, red } from "./utils/colors";
import { userPrompt } from "./utils/prompting/userPrompt";
import { checkFileNotModifiedInGitOrThrow } from "./utils/git/gitUtils";
import { showCosts } from "./utils/openai/pricingCalc";
import { makeCodeBlockForPrompt } from "./utils/markdown/generateMarkdown";
import { FilePathStr, FileContentStr, PatchContentStr } from "./utils/types";
import {readFile} from "./utils/fs/fsUtils";

console.log(yellow + "Welcome to " + red + " MetaPrompting Technology" + reset);

dotenv.config();

const inputFilePath = process.argv[2] as FilePathStr;
console.log(blue + "inputFilePath: " + reset, inputFilePath);
console.log(blue + "userPrompt: " + reset, userPrompt);
console.log("initializing OpenAI");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

checkFileNotModifiedInGitOrThrow(inputFilePath);

const origFileContent = readFile(inputFilePath);

async function main() {
  const fullPromptTextToSend = `
    Given the files listed below, perform those changes to the files:
    ${userPrompt}
    ${makeCodeBlockForPrompt(inputFilePath, origFileContent)}
    =====
    ${customGuidelines.join("\n\n")}

    ==== Here I give you general output formatting guidelines - you must follow them!
    ${formattingGuidelines.join("\n\n")}
`;
  console.log(blue + "fullPromptTextToSend:\n" + reset, fullPromptTextToSend);
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: fullPromptTextToSend }],
    // model: "gpt-3.5-turbo",
    model: "gpt-4",
    temperature: 0,
  });

  // console.debug(`chatCompletion.choices`, chatCompletion.choices);
  const responseContent = chatCompletion.choices[0].message.content;
  // console.debug(`chatCompletion.choices...`, responseContent);
  console.log(green + `responseContent:${responseContent}` + "\x1b[0m");
  const responsePatch = extractCodeFromMarkdown(responseContent!) as PatchContentStr;
  // console.debug(`responsePatch:` + green + responsePatch + "\x1b[0m");
  console.debug(`responsePatch:`);
  printColoredDiff(responsePatch);
  const patchedFileContents = applyPatchViaStrings(
    responsePatch,
    origFileContent
  ); /// WARNING: PATCH IS FIRST ARG, then ORIG content
  // console.info("patchedFileContents: \n \n", patchedFileContents);

  const patchedFilePath = inputFilePath; // inputFilePath.replace(".ts", ".patched.ts");
  console.log(
    "will write file (after checking git status) - patchedFilePath: ",
    patchedFilePath
  );
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
