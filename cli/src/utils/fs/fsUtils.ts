import {MPFileContent, MPFilePath} from "../types";
import fs from "fs";

export function readFileFromPath(inputFilePath: MPFilePath) {
  return fs.readFileSync(
      inputFilePath,
      "utf8"
  ) as MPFileContent;
}
