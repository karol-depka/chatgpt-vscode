import {MPFileContent, MPFilePath, MPPatchFilePath} from "../types";
import fs from "fs";
import chalk from "chalk";

export function readFileFromPath(inputFilePath: MPFilePath) {
  return fs.readFileSync(
      inputFilePath,
      "utf8"
  ) as MPFileContent;
}

export function coloredFilePath(filePath: MPFilePath | MPPatchFilePath) {
  return chalk.blue(chalk.underline(filePath))
}
