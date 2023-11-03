import dotenv from "dotenv";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import fs from "fs";
import {
  applyPatchToViaStrings as applyPatchViaStrings, patchFileIfSafeOrThrow,
  printColoredDiff,
} from "./utils/patching/apply_patch";
import { yellow, reset, blue, green, red } from "./utils/colors";
import { checkFileNotModifiedInGitOrThrow } from "./utils/git/gitUtils";
import { showCosts } from "./utils/openai/pricingCalc";
import { makeCodeBlockForPrompt } from "./utils/markdown/generateMarkdown";
import {MPFilePath, MPFileContent, MPPatchContent, MPFullPrompt, MPUserPrompt} from "./utils/types";
import {readFileFromPath} from "./utils/fs/fsUtils";
import {FileToPatch} from "./utils/patching/types";
import { makeAndSendFullPrompt } from "./utils/openai/sendPrompt";
// import chalk from 'chalk';

// console.log(chalk.inverse(chalk.blue('Hello world - chalk!')));

console.log(yellow + "Welcome to " + red + " MetaPrompting Technology" + reset);

dotenv.config();
const userPrompt = process.argv[3] as MPUserPrompt // || userPrompt;

const inputFilePath = process.argv[2] as MPFilePath;

console.log(blue + "inputFilePath: " + reset, inputFilePath);
console.log(blue + "userPrompt: " + reset, userPrompt);

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
  const { chatCompletion, responsePatch } = await makeAndSendFullPrompt({
    userPrompt,
    filesToPatch,
  });
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
