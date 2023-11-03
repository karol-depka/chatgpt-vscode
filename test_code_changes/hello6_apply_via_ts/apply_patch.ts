import * as fs from 'fs';

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

    console.log('Finished parsing patch.');
    return patch;
}

function applyPatch(original: string, patch: Patch): string {
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

// Main function
function patchFile(filePath: string, patchPath: string): void {
    console.log(`Patching file ${filePath} with patch ${patchPath}...`);
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    const patchContent = fs.readFileSync(patchPath, 'utf-8');

    const patch = parsePatch(patchContent);
    const result = applyPatch(originalContent, patch);

    fs.writeFileSync(filePath + ".applied.ts", result);
    console.log(`Finished patching file. Output written to ${filePath}.applied.ts`);
}

// Example usage

// patchFile('../../cli/src/index.ts', 'hello.patch');
patchFile('apply_patch.ts', 'hello.patch');
