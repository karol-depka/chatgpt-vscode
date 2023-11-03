import {FileContentStr, FilePathStr} from "../types";
import fs from "fs";

export function readFile(inputFilePath: FilePathStr) {
  return fs.readFileSync(
      inputFilePath,
      "utf8"
  ) as FileContentStr;
}
