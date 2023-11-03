import { applyPatch, applyPatchToViaStrings } from './apply_patch'; // replace with your actual module name

describe('Patch tests', () => {
    test('Empty patch and original content', () => {
        const result = applyPatchToViaStrings('', '');
        expect(result).toBe('');
    });

    test('Non-empty patch and empty original content', () => {
        const patchContent = `@@ -1,3 +1,5 @@
+This is a new line
 This is an existing line
+This is another new line`;
        const result = applyPatchToViaStrings(patchContent, '');
        expect(result).toBe(patchContent);
    });

    test('Empty patch and non-empty original content', () => {
        const originalContent = `This is an existing line
This is another existing line`;
        const result = applyPatchToViaStrings('', originalContent);
        expect(result).toBe(originalContent);
    });

    test('Non-empty patch and non-empty original content', () => {
        const originalContent = `This is an existing line
This is another existing line`;
        const patchContent = `@@ -1,2 +1,4 @@
+This is a new line
 This is an existing line
+This is another new line
 This is another existing line`;
        const result = applyPatchToViaStrings(patchContent, originalContent);
        const expectedContent = `This is a new line
This is an existing line
This is another new line
This is another existing line`;
        expect(result).toBe(expectedContent);
    });

    test('Large patch and large original content', () => {
        let originalContent = '';
        let patchContent = '';
        let expectedContent = '';
        for (let i = 0; i < 30; i++) {
            originalContent += `This is line ${i}\n`;
            patchContent += `@@ -${i},1 +${i},2\n+This is a new line\n This is line ${i}\n`;
            expectedContent += `This is a new line\nThis is line ${i}\n`;
        }
        const result = applyPatchToViaStrings(patchContent, originalContent);
        expect(result).toBe(expectedContent);
    });
});
