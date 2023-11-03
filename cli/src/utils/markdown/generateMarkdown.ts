import { FileContent } from "openai/resources";
import {
  FileContentStr,
  FilePathStr,
  FileTypeStr,
  MarkDownContentStr,
} from "../types";
import { blue, reset } from "../colors";

// import fs from "fs";

export function makeCodeBlockForPrompt(
  filePath: FilePathStr,
  fileContent: FileContentStr
  //   fileType: FileTypeString
): MarkDownContentStr {
  const fileType = "typescript"; // skipping for now coz maybe this prevents diff output
  //   console.log(blue + `original file content:\n${fileContent}` + reset);

  // \`\`\`${fileType}

  return `File at path: ${filePath} :
\`\`\`
${fileContent}
\`\`\`
` as MarkDownContentStr;
}
