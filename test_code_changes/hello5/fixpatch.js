"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
function adjustPatchFile(filename) {
    var content = (0, fs_1.readFileSync)(filename, 'utf8');
    var lines = content.split('\n');
    var adjustedLines = [];
    var inChunk = false;
    var originalLineCount = 0;
    var newLineCount = 0;
    var chunkStartIndex = -1;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
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
        }
        else if (inChunk) {
            if (line.startsWith('-')) {
                originalLineCount++;
            }
            else if (line.startsWith('+')) {
                newLineCount++;
            }
        }
        else {
            adjustedLines.push(line); // lines outside chunks
        }
    }
    // Handle the last chunk
    if (inChunk) {
        adjustedLines.push(createChunkHeader(originalLineCount, newLineCount));
        adjustedLines = adjustedLines.concat(lines.slice(chunkStartIndex + 1));
    }
    (0, fs_1.writeFileSync)(filename, adjustedLines.join('\n'));
}
function createChunkHeader(originalLineCount, newLineCount) {
    // We assume chunks always start at line 1 for simplicity. Adjust if needed.
    return "@@ -1,".concat(originalLineCount, " +1,").concat(newLineCount, " @@");
}
// Call the function
adjustPatchFile('hello.patch');
