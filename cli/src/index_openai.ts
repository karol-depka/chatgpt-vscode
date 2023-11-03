import yargs from 'yargs';
import dotenv from "dotenv";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import { hideBin } from 'yargs/helpers';
import fs from "fs";
import {
  applyPatchToViaStrings as applyPatchViaStrings, patchFileIfSafeOrThrow,
  printColoredDiff,
} from "./utils/patching/apply_patch";
import { yellow, reset, blue, green, red } from "./utils/colors";
import { checkFileNotModifiedInGitOrThrow } from "./utils/git/gitUtils";
import { showCosts } from "./utils/openai/pricingCalc";
import { makeCodeBlockForPrompt } from "./utils/markdown/generateMarkdown";
import {MPFilePath, MPFileContent, MPPatchContent, MPFullLLMPrompt, MPUserPrompt} from "./utils/types";
import {coloredFilePath, readFileFromPath} from "./utils/fs/fsUtils";
import {FileToPatch} from "./utils/patching/types";
import { makeAndSendFullPrompt } from "./utils/openai/sendPrompt";
import chalk from 'chalk';

console.log(chalk.inverse(chalk.blue('Hello world - chalk!')));
const argv = yargs(hideBin(process.argv)).options({
  'dry-run': {
    type: 'boolean',
    alias: 'd',
    description: 'Run without making changes to files (but still does call LLM API)'
  },
  'dont-call-llm': {
    type: 'boolean',
    alias: 'l',
    description: 'Run without making contacting LLM (and hence no changes to files)'
  },
}).argv;

console.log(`argv: `, argv);
// let dryRun = argv['dry-run'] as boolean;
// console.log(`dryRun: ${dryRun}`);
// if (!dryRun) {
//   console.warn('dryRun is false, will make changes to files');
// }
console.log(yellow + "Welcome to " + red + " MetaPrompting Technology" + reset);

dotenv.config();
const userPrompt = process.argv[3] as MPUserPrompt // || userPrompt;

const inputFilePath = process.argv[2] as MPFilePath;

console.log(blue + "inputFilePath: " + reset, coloredFilePath(inputFilePath));
console.log(blue + "userPrompt: " + reset, userPrompt); // TODO add some emojis

checkFileNotModifiedInGitOrThrow(inputFilePath);

const origFileContent = readFileFromPath(inputFilePath);


/** Later: FileChunksToPatch or something like that even with AST coordinates */
// if (!argv.dryRun) {
  /** Later: FileChunksToPatch or something like that even with AST coordinates */
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
  // if (!argv.dryRun) {
    //   console.log(`Total time taken: ${end - start} ms.`);

    showCosts(chatCompletion);

    require("ts-node").register();
    console.log("===== Will execute", coloredFilePath(patchedFilePath));
    require("../" + patchedFilePath);
    console.log("===== Finished executing", coloredFilePath(patchedFilePath));
}

// if (!argv.dryRun) {
  main();
// }
