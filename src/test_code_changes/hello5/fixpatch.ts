import { readFileSync, writeFileSync } from 'fs';

function adjustPatchFile(filename: string): void {
    const content = readFileSync(filename, 'utf8');
    const lines = content.split('\n');

    let adjustedLines: string[] = [];
    let inChunk = false;
    let originalLineCount = 0;
    let newLineCount = 0;
    let chunkStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('@@')) {
            // If we were already in a chunk, push the previous chunk's data
            if (inChunk) {
                adjustedLines.push(createChunkHeader(originalLineCount, newLineCount));
                adjustedLines = adjustedLines.concat(lines.slice(chunkStartIndex + 1, i));
            }

            // Reset counts and flags for the new chunk
            inChunk = true;
            originalLineCount = 0;
            newLineCount = 0;
            chunkStartIndex = i;
        } else if (inChunk) {
            if (line.startsWith('-')) {
                originalLineCount++;
            } else if (line.startsWith('+')) {
                newLineCount++;
            }
        } else {
            adjustedLines.push(line); // lines outside chunks
        }
    }

    // Handle the last chunk
    if (inChunk) {
        adjustedLines.push(createChunkHeader(originalLineCount, newLineCount));
        adjustedLines = adjustedLines.concat(lines.slice(chunkStartIndex + 1));
    }

    writeFileSync(filename, adjustedLines.join('\n'));
}

function createChunkHeader(originalLineCount: number, newLineCount: number): string {
    // We assume chunks always start at line 1 for simplicity. Adjust if needed.
    return `@@ -1,${originalLineCount} +1,${newLineCount} @@`;
}

// Call the function
adjustPatchFile('hello.patch');
