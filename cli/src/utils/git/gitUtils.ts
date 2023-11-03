import { execSync } from "child_process";

export function checkFileNotModifiedInGitOrThrow(filePath: string) {
  const gitStatus = execSync(`git status --porcelain ${filePath}`).toString();
  if (gitStatus.length > 0) {
    throw new Error(
      `The file ${filePath} has uncommitted changes. Please commit or stash them before running this script.`
    );
  }
}
