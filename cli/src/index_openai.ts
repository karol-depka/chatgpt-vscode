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
import {
  MPFilePath,
  MPFileContent,
  MPPatchContent,
  MPFullLLMPrompt,
  MPUserPrompt,
  MPFileContentBase
} from "./utils/types";
import {coloredFilePath, readFileFromPath} from "./utils/fs/fsUtils";
import {MPFileToPatch, MPFileToPatchToApply} from "./utils/patching/types";
import { makeAndSendFullPrompt } from "./utils/openai/sendPrompt";
import chalk from 'chalk';
dotenv.config();


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
  'prompt': {
    type: 'string',
    alias: 'p',
    description: 'User Prompt body',
    required: true,
  },
}).argv;

console.log(`argv: `, argv);

// const userPrompt = process.argv[3] as MPUserPrompt // || userPrompt;
const userPrompt = (argv as any).prompt as MPUserPrompt // || userPrompt;

let dryRun = (argv as any).dryRun as boolean;
console.log(`dryRun: ${dryRun}`);
// if (!dryRun) {
//   console.warn('dryRun is false, will make changes to files');
// }
console.log(yellow + "Welcome to " + red + " MetaPrompting Technology" + reset);


const inputFilePaths = (argv as any)._ as MPFilePath[];

for ( let inputFilePath of inputFilePaths) {
  console.log(blue + "inputFilePath: " + reset, coloredFilePath(inputFilePath));
  checkFileNotModifiedInGitOrThrow(inputFilePath);
}
console.log(blue + "userPrompt: " + reset, userPrompt); // TODO add some emojis



/** Later: FileChunksToPatch or something like that even with AST coordinates */
// if (!argv.dryRun) {
  /** Later: FileChunksToPatch or something like that even with AST coordinates */

const filesToPatch: MPFileToPatch[] = inputFilePaths.map(inputFilePath => {
  const origFileContent = readFileFromPath(inputFilePath) as string as MPFileContentBase;

  return {
    filePath: inputFilePath,
    baseContent: origFileContent
  }

})



async function main() {
  const { chatCompletion, responsePatch } = await makeAndSendFullPrompt({
    userPrompt,
    filesToPatch,
  });
  const fileToPatch = filesToPatch[0] // FIXME iterate over all files
  // console.debug(`responsePatch:` + green + responsePatch + "\x1b[0m");
  console.info(`Patch for file: ` + coloredFilePath(fileToPatch.filePath));
  printColoredDiff(responsePatch);
  const patchedFilePath = fileToPatch.filePath; // inputFilePath.replace(".ts", ".patched.ts");
  const fileToPatchToApply: MPFileToPatchToApply = {
    fileToPatch: fileToPatch,
    patchContents: responsePatch,
  }
  patchFileIfSafeOrThrow(fileToPatchToApply);

    showCosts(chatCompletion);

    require("ts-node").register();
    console.log("===== Will execute", coloredFilePath(patchedFilePath));
    require("../" + patchedFilePath);
    console.log("===== Finished executing", coloredFilePath(patchedFilePath));
}

// if (!argv.dryRun) {
  main();
// }
