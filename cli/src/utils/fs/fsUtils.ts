import {FileContent, FilePath} from "../types";
import fs from "fs";

export function readFileFromPath(inputFilePath: FilePath) {
  return fs.readFileSync(
      inputFilePath,
      "utf8"
  ) as FileContent;
}
