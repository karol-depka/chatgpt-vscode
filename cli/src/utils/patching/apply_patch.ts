import * as fs from 'fs';
import {MPFileContent, MPFileContentBase, MPFilePath, MPPatchContent, MPPatchFilePath} from '../types';
import { blue, green, red, reset } from '../colors';
import {checkFileNotModifiedInGitOrThrow} from "../git/gitUtils";
import {coloredFilePath, readFileFromPath} from "../fs/fsUtils";
import {MPFileToPatch, MPFileToPatchToApply} from "./types";

interface Patch {
    header: string[];
    chunks: Chunk[];
}

interface Chunk {
    lines: string[];
}

function parsePatch(content: string): Patch {
    console.log('Parsing patch...');
    const lines = content.split('\n');
    const patch: Patch = { header: [], chunks: [] };
    let chunk: Chunk | null = null;

    for (let line of lines) {
        if (line.startsWith('---') || line.startsWith('+++')) {
            patch.header.push(line);
        } else if (line.startsWith('@@')) {
            if (chunk) {
                patch.chunks.push(chunk);
            }
            chunk = { lines: [] };
        } else if (chunk) {
            chunk.lines.push(line);
        } else {
            patch.header.push(line);
        }
    }

    if (chunk) {
        patch.chunks.push(chunk);
    }

    console.log('Finished parsing patch.');
    return patch;
}

export function applyPatch(original: MPFileContentBase, patch: Patch): string {
    console.log('Applying patch...');
    const originalLines = original.split('\n');
    let output: string[] = [];
    let currentIndex = 0;

    for (let chunk of patch.chunks) {
        let foundContext = false;
        // Search for context lines in original file to determine where the chunk applies
        for (let line of chunk.lines) {
            if (!line.startsWith('+') && !line.startsWith('-')) {
                const contextLine = line.trim();
                while (currentIndex < originalLines.length) {
                    if (originalLines[currentIndex].trim() === contextLine) {
                        foundContext = true;
                        break;
                    }
                    output.push(originalLines[currentIndex]);
                    currentIndex++;
                }
                if (foundContext) break;
            }
        }

        if (!foundContext) {
            // If no context was found, just skip this chunk
            console.log('No context found for chunk, skipping...');
            continue;
        }

        // Apply patch chunk
        for (let line of chunk.lines) {
            if (line.startsWith('-')) {
                // Remove line
                console.log(`Removing line: ${line}`);
                currentIndex++;
            } else if (line.startsWith('+')) {
                // Add line
                console.log(`Adding line: ${line}`);
                output.push(line.slice(1));
            } else {
                // Context line, keep from original
                console.log(`Keeping original line: ${line}`);
                output.push(originalLines[currentIndex]);
                currentIndex++;
            }
        }
    }

    // Copy remaining lines
    while (currentIndex < originalLines.length) {
        output.push(originalLines[currentIndex]);
        currentIndex++;
    }

    console.log('Finished applying patch.');
    return output.join('\n');
}


export function patchFile(filePath: MPFilePath, patchPath: MPPatchFilePath): void {
  console.log(`Patching file ${coloredFilePath(filePath)} with patch file ${coloredFilePath(patchPath as string as MPFilePath)}...`);
  const originalContent = fs.readFileSync(filePath, "utf-8") as MPFileContentBase;
  const patchContent = fs.readFileSync(patchPath, "utf-8") as MPPatchContent;

  const result = applyPatchToViaStrings(patchContent, originalContent);

  fs.writeFileSync(filePath + ".applied.ts", result);
  console.log(
    `Finished patching file. Output written to ${filePath}.applied.ts`
  );
}

export function applyPatchToViaStrings(
    patchContent: MPPatchContent,
    originalContent: MPFileContentBase)
{
    const patch = parsePatch(patchContent);
    const result = applyPatch(originalContent, patch);
    return result;
}

export function printColoredDiff(diffStr: MPPatchContent): void {

  const lines = diffStr.split("\n");
  for (let line of lines) {
    if (line.startsWith("-")) {
      console.log(`${red}${line}${reset}`);
    } else if (line.startsWith("+")) {
      console.log(`${green}${line}${reset}`);
    } else {
      console.log(`${blue}${line}${reset}`);
    }
  }
}


function checkFileContentIsSameOrThrow(filePath: MPFilePath, baseContent: MPFileContentBase) {
    const currentContent = readFileFromPath(filePath);
    if ( currentContent !== (baseContent as string as MPFileContent) ) {
        throw new Error(
            `The file ${filePath} has been modified since the base content was generated. 
            Please revert it to the original state before running this script. 
            Content: \n\n${currentContent}`
        );
    }
}

export function patchFileIfSafeOrThrow(
    filePatchToApply: MPFileToPatchToApply
) {
  const fileToPatch = filePatchToApply.fileToPatch;
  const pathOfFileToPatch = fileToPatch.filePath;
  checkFileNotModifiedInGitOrThrow(pathOfFileToPatch); // just before writing - check again git status
  checkFileContentIsSameOrThrow(pathOfFileToPatch, fileToPatch.baseContent);
  const patchedFileContents = applyPatchToViaStrings(
      filePatchToApply.patchContents,
      fileToPatch.baseContent,
  ); /// WARNING: PATCH IS FIRST ARG, then ORIG content
  // console.info("patchedFileContents: \n \n", patchedFileContents);

  console.log(
    "will write file (after checking git status) - patchedFilePath: ",
    coloredFilePath(pathOfFileToPatch)
  );

  fs.writeFileSync(pathOfFileToPatch, patchedFileContents);
}
