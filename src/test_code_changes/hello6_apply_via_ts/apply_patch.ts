import * as fs from 'fs';

interface Patch {
    header: string[];
    chunks: Chunk[];
}

interface Chunk {
    lines: string[];
}

function parsePatch(content: string): Patch {
    const lines = content.split('\n').map(line => line.trim());
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
    const originalLines = original.split('\n').map(line => line.trim());
    let output: string[] = [];
    let currentIndex = 0;

    for (let chunk of patch.chunks) {
        // Try to find the context before the chunk
        let contextIndex = -1;
        for (let line of chunk.lines) {
            if (!line.startsWith('+') && !line.startsWith('-')) {
                contextIndex = originalLines.indexOf(line, currentIndex);
                if (contextIndex !== -1) {
                    break;
                }
            }
        }

        // Copy unchanged lines
        while (currentIndex < contextIndex) {
            output.push(originalLines[currentIndex]);
            currentIndex++;
        }

        // Apply patch chunk
        for (let line of chunk.lines) {
            if (line.startsWith('-')) {
                // Skip line from original
                currentIndex++;
            } else if (line.startsWith('+')) {
                // Add line from patch
                output.push(line.slice(1));
            } else {
                // Copy line from original
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

    fs.writeFileSync(filePath + "_applied2", result);
}

// Example usage

patchFile('hello.ts', 'hello.patch');
