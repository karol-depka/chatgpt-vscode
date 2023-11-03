import {
  MPFileContent,
  MPFilePath,
  FileTypeStr,
  MarkDownContentStr,
} from "../types";
import { blue, reset } from "../colors";

// import fs from "fs";

export function makeCodeBlockForPrompt(
  filePath: MPFilePath,
  fileContent: MPFileContent
  //   fileType: FileTypeString
): MarkDownContentStr {
  const fileType = "typescript"; // skipping for now coz maybe this prevents diff output
  //   console.log(blue + `original file content:\n${fileContent}` + reset);

  // \`\`\`${fileType}

  return `

File at path: ${filePath} :
\`\`\`
${fileContent}
\`\`\`
` as MarkDownContentStr;
}
