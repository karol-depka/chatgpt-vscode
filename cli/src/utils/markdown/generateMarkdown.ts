import { FileContent } from "openai/resources";
import {
  FileContent,
  FilePath,
  FileTypeStr,
  MarkDownContentStr,
} from "../types";
import { blue, reset } from "../colors";

// import fs from "fs";

export function makeCodeBlockForPrompt(
  filePath: FilePath,
  fileContent: FileContent
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
