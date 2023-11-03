import { execSync } from "child_process";
import {MPFilePath} from "../types";
import {coloredFilePath} from "../fs/fsUtils";

export function checkFileNotModifiedInGitOrThrow(filePath: MPFilePath) {
  console.log('checking file not modified in git: ' + coloredFilePath(filePath))
  const gitStatus = execSync(`git status --porcelain ${filePath}`).toString();
  if (gitStatus.length > 0) {
    throw new Error(
      `The file ${filePath} has uncommitted changes. Please commit or stash them before running this script.`
    );
  }
}
