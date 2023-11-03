"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
function parsePatch(content) {
    var lines = content.split('\n').map(function (line) { return line.trim(); });
    var patch = { header: [], chunks: [] };
    var chunk = null;
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.startsWith('@@')) {
            if (chunk) {
                patch.chunks.push(chunk);
            }
            chunk = { lines: [] };
        }
        else if (chunk) {
            chunk.lines.push(line);
        }
        else {
            patch.header.push(line);
        }
    }
    if (chunk) {
        patch.chunks.push(chunk);
    }
    return patch;
}
function applyPatch(original, patch) {
    var originalLines = original.split('\n').map(function (line) { return line.trim(); });
    var output = [];
    var currentIndex = 0;
    for (var _i = 0, _a = patch.chunks; _i < _a.length; _i++) {
        var chunk = _a[_i];
        // Try to find the context before the chunk
        var contextIndex = -1;
        for (var _b = 0, _c = chunk.lines; _b < _c.length; _b++) {
            var line = _c[_b];
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
        for (var _d = 0, _e = chunk.lines; _d < _e.length; _d++) {
            var line = _e[_d];
            if (line.startsWith('-')) {
                // Skip line from original
                currentIndex++;
            }
            else if (line.startsWith('+')) {
                // Add line from patch
                output.push(line.slice(1));
            }
            else {
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
function patchFile(filePath, patchPath) {
    var originalContent = fs.readFileSync(filePath, 'utf-8');
    var patchContent = fs.readFileSync(patchPath, 'utf-8');
    var patch = parsePatch(patchContent);
    var result = applyPatch(originalContent, patch);
    fs.writeFileSync(filePath + "_applied2", result);
}
// Example usage
patchFile('hello.ts', 'hello.patch');
