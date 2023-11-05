/* eslint-disable @typescript-eslint/naming-convention */
import yargs from "yargs";
import dotenv from "dotenv";
// import inquirer from 'inquirer';
import { execSync } from "child_process";
import { hideBin } from "yargs/helpers";
import {
  patchFileIfSafeOrThrow,
  printColoredDiff,
} from "./utils/patching/apply_patch";
import { blue, red, reset, yellow } from "./utils/colors";
import { checkFileNotModifiedInGitOrThrow } from "./utils/git/gitUtils";
import { MPFileContentBase, MPFilePath, MPUserPrompt } from "./utils/types";
import { coloredFilePath, readFileFromPath } from "./utils/fs/fsUtils";
import { MPFileToPatch, MPFileToPatchToApply } from "./utils/patching/types";
import { makeAndSendFullPrompt } from "./utils/openai/sendPrompt";
import { executeFile } from "./utils/exec/execute_file";
import { opts } from "./opts/opts";
import { Args } from "./opts/opts.types";

dotenv.config();

const argv = yargs(hideBin(process.argv)).options({
  dryRun: {
    type: "boolean",
    alias: "d",
    description:
      "Run without making changes to files (but still does call LLM API)",
    // implies: ["dontExec"],
  },
  "dont-call-llm": {
    type: "boolean",
    alias: "l",
    description:
      "Run without making contacting LLM (and hence no changes to files). Will still generate the metaprompt and check preconditions.",
    implies: ["dry-run", "dontExec"],
  },
  dontExec: {
    type: "boolean",
    description: "Run without executing the resulting file",
  },
  askBeforePatching: {
    type: "boolean",
    description: "Require user confirmation before applying the patch",
  },
  prompt: {
    type: "string",
    alias: "p",
    description: "User Prompt body",
    required: true,
  },
  llmModel: {
    type: "string",
    description: "LLM Model name",
    default: "gpt-4",
  },
  debugChunks: {
    type: "boolean",
    default: false,
  },
}).argv as Args;

console.log(`argv: `, argv);
opts.opts = argv;

const userPrompt = (argv as any).prompt as MPUserPrompt;

let dryRun = (argv as any).dryRun as boolean;
console.log(`dryRun: ${dryRun}`);
// if (!dryRun) {
//   console.warn('dryRun is false, will make changes to files');
// }
console.log(
  yellow + "Welcome to " + red + " MetaPRO MetaPrompting Technology" + reset
);

const inputFilePaths = (argv as any)._ as MPFilePath[];

for (let inputFilePath of inputFilePaths) {
  console.log(blue + "inputFilePath: " + reset, coloredFilePath(inputFilePath));
  if (!dryRun) {
    checkFileNotModifiedInGitOrThrow(inputFilePath);
  }
  //   const isUncommitted = execSync(`git diff --name-only ${inputFilePath}`)
  //     .toString()
  //     .trim();
  //   if (isUncommitted) {
  //     const answers = await inquirer.prompt([
  //       {
  //         type: "confirm",
  //         name: "proceed",
  //         message: `The file ${inputFilePath} is uncommitted. Do you want to proceed?`,
  //       },
  //     ]);
  //     console.log(`User's answer: ${answers.proceed}`);
  //   }
}
console.log(blue + "userPrompt: " + reset, userPrompt); // TODO add some emojis

/** Later: FileChunksToPatch or something like that even with AST coordinates */
// if (!argv.dryRun) {
/** Later: FileChunksToPatch or something like that even with AST coordinates */

const filesToPatch: MPFileToPatch[] = inputFilePaths.map((inputFilePath) => {
  const origFileContent = readFileFromPath(
    inputFilePath
  ) as string as MPFileContentBase;

  return {
    filePath: inputFilePath,
    baseContent: origFileContent,
  };
});

async function main() {
  const { chatCompletion, responsePatch } = await makeAndSendFullPrompt({
    userPrompt,
    filesToPatch,
  });
  const fileToPatch = filesToPatch[0]; // FIXME iterate over all files
  // console.debug(`responsePatch:` + green + responsePatch + "\x1b[0m");
  console.info(`Patch for file: ` + coloredFilePath(fileToPatch.filePath));
  printColoredDiff(responsePatch);
  const patchedFilePath = fileToPatch.filePath; // inputFilePath.replace(".ts", ".patched.ts");
  const fileToPatchToApply: MPFileToPatchToApply = {
    fileToPatch: fileToPatch,
    patchContents: responsePatch,
  };

  if (!dryRun) {
    patchFileIfSafeOrThrow(fileToPatchToApply);
  }

  // showCosts(chatCompletion);
  if (!!!argv.dontExec && !!!argv.dryRun) {
    executeFile(patchedFilePath);
  }
}

main();
