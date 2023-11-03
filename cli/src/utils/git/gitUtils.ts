import { execSync } from "child_process";
import {FilePath} from "../types";

export function checkFileNotModifiedInGitOrThrow(filePath: FilePath) {
  const gitStatus = execSync(`git status --porcelain ${filePath}`).toString();
  if (gitStatus.length > 0) {
    throw new Error(
      `The file ${filePath} has uncommitted changes. Please commit or stash them before running this script.`
    );
  }
}
