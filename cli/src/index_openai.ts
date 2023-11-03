import OpenAI from "openai";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import fs from "fs";
import {
  applyPatchToViaStrings as applyPatchViaStrings, patchFileIfSafeOrThrow,
  printColoredDiff,
} from "./utils/patching/apply_patch";
import { extractCodeFromMarkdown } from "./utils/markdown/markdown_utils";
import { customGuidelines } from "./utils/prompting/custom_guidelines";
import { formattingGuidelines } from "./utils/prompting/formattingGuidelines";
import { yellow, reset, blue, green, red } from "./utils/colors";
// import { userPrompt } from "./utils/prompting/userPrompt";
import { checkFileNotModifiedInGitOrThrow } from "./utils/git/gitUtils";
import { showCosts } from "./utils/openai/pricingCalc";
import { makeCodeBlockForPrompt } from "./utils/markdown/generateMarkdown";
import { MPFilePath, MPFileContent, PatchContentStr } from "./utils/types";
import {readFileFromPath} from "./utils/fs/fsUtils";
import {makePrompt} from "./utils/prompting/makePrompt";
import {FileToPatch} from "./utils/patching/types";

console.log(yellow + "Welcome to " + red + " MetaPrompting Technology" + reset);

dotenv.config();
const userPrompt = process.argv[3] as string // || userPrompt;

const inputFilePath = process.argv[2] as MPFilePath;

console.log(blue + "inputFilePath: " + reset, inputFilePath);
console.log(blue + "userPrompt: " + reset, userPrompt);
console.log("initializing OpenAI");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

checkFileNotModifiedInGitOrThrow(inputFilePath);

const origFileContent = readFileFromPath(inputFilePath);


/** Later: FileChunksToPatch or smth like that even with AST coordinates */
const filesToPatch: FileToPatch[] = [
  {
    filePath: inputFilePath,
    baseContent: origFileContent
  }
]


async function main() {
  const fullPromptTextToSend = makePrompt(userPrompt, filesToPatch);
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
  const responsePatch = extractCodeFromMarkdown(
    responseContent!
  ) as PatchContentStr;
  // console.debug(`responsePatch:` + green + responsePatch + "\x1b[0m");
  console.debug(`responsePatch:`);
  printColoredDiff(responsePatch);
  const patchedFilePath = inputFilePath; // inputFilePath.replace(".ts", ".patched.ts");
  patchFileIfSafeOrThrow(patchedFilePath, origFileContent, responsePatch);

  const end = performance.now();
  //   console.log(`Total time taken: ${end - start} ms.`);

  showCosts(chatCompletion);

  require("ts-node").register();
  console.log("===== Will execute", patchedFilePath);
  require("../" + patchedFilePath);
  console.log("===== Finished executing", patchedFilePath);
}

main();
