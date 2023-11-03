import * as fs from 'fs';

interface Patch {
    header: string[];
    chunks: Chunk[];
}

interface Chunk {
    lines: string[];
}

function parsePatch(content: string): Patch {
    const lines = content.split('\n');
    const patch: Patch = { header: [], chunks: [] };
    let chunk: Chunk | null = null;

    for (let line of lines) {
        if (line.startsWith('@@')) {
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

    return patch;
}

function applyPatch(original: string, patch: Patch): string {
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
            continue;
        }

        // Apply patch chunk
        for (let line of chunk.lines) {
            if (line.startsWith('-')) {
                // Remove line
                currentIndex++;
            } else if (line.startsWith('+')) {
                // Add line
                output.push(line.slice(1));
            } else {
                // Context line, keep from original
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

    return output.join('\n');
}

// Main function
function patchFile(filePath: string, patchPath: string): void {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    const patchContent = fs.readFileSync(patchPath, 'utf-8');

    const patch = parsePatch(patchContent);
    const result = applyPatch(originalContent, patch);

    fs.writeFileSync(filePath + "_applied3", result);
}

// Example usage

patchFile('hello.ts', 'hello.patch');
