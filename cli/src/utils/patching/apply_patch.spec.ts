import { applyPatch, applyPatchToViaStrings } from './apply_patch';
import {patch} from "./makePatch";
import {FileContentStr} from "../types"; // replace with your actual module name

// TODO: no context: No context found for chunk, skipping...
// --- a/examples/hello_simple/hello.ts
// +++ b/examples/hello_simple/hello.ts
// @@ -1,4 +1,14 @@
// -// start
// -console.log('hello world')
// -console.debug('bye')
// -// end
// +function repeatHello() {
// +  for (let i = 0; i < 7; i++) {
// +    console.log('\x1b[31m', 'hello world'); // red
// +    console.debug('\x1b[33m', 'bye'); // yellow
// +  }
// +  console.log('\x1b[34m\x1b[1m', 'Goodnight!'); // blue and bold
// +}
// +
// +repeatHello();

describe('Patch tests', () => {


    test('Empty patch and original content', () => {
        const result = applyPatchToViaStrings(patch(''), '' as FileContentStr);
        expect(result).toBe('');
    });

test("hello_simple - patch from openai, but without whitespace", () => {
  const origContent = `// start
console.log('hello world')
console.debug('bye')
// end
` as FileContentStr;
  const patchContent = patch(`--- a/examples/hello_simple/hello.ts
+++ b/examples/hello_simple/hello.ts
@@ -1,5 +1,5 @@
 // start
-console.log('hello world')
+console.log('hello Earth')
 console.debug('bye')
 // end
`);

  const result = applyPatchToViaStrings(patchContent, origContent);
  const expected = `// start
console.log('hello Earth')
console.debug('bye')
// end
`;
  expect(result).toBe(expected);
});

test("hello_simple - patch from openai with whitespace", () => {
  const origContent = `// start
console.log('hello world')
console.debug('bye')
// end
` as FileContentStr;
  const patchContent = patch(`--- examples/hello_simple/hello.ts
+++ examples/hello_simple/hello.ts
@@ -1,4 +1,4 @@
 // start
-console.log('hello world')
+console.log('hello Earth')
 console.debug('bye')
 // end`);

  const result = applyPatchToViaStrings(patchContent, origContent);
  const expected = `// start
console.log('hello Earth')
console.debug('bye')
// end
`;
  expect(result).toBe(expected);
});

  xtest('Non-empty patch and empty original content', () => {
        const patchContent = patch(`@@ -1,3 +1,5 @@
+This is a new line
 This is an existing line
+This is another new line`);
        const result = applyPatchToViaStrings(patchContent, '' as FileContentStr);
        expect(result).toBe(patchContent);
    });

    xtest('hello7 from openai', () => {
        const origContent = `const startTime = Date.now();

for (let i = 1; i <= 99; i++) {
  console.log(\`Iteration: \${i}\`);
  if (i % 2 === 0) {
    for (let j = 0; j < 7; j++) {
      console.log(\`hi\`);
    }
  }
}

console.log(\`Total time taken: \${Date.now() - startTime}ms\`);
` as FileContentStr;
        const patchContent = patch(`--- a/examples/hello7/hello.ts
+++ b/examples/hello7/hello.ts
@@ -1,12 +1,12 @@
 const startTime = Date.now();

 for (let i = 1; i <= 99; i++) {
-  console.log(\`Iteration: \${i}\`);
-  if (i % 2 === 0) {
+  if (i % 3 === 0) {
     for (let j = 0; j < 7; j++) {
-      console.log(\`hi\`);
+      console.log(\`Iteration: \${j}\`);
     }
   }
 }

 console.log(\`Total time taken: \${Date.now() - startTime}ms\`);`);

        const result = applyPatchToViaStrings(patchContent, origContent);
        expect(result).toBe('____FIXME____');
    });

    test('Empty patch and non-empty original content', () => {
        const originalContent = `This is an existing line
This is another existing line` as FileContentStr;
        const result = applyPatchToViaStrings(patch(''), originalContent);
        expect(result).toBe(originalContent);
    });

    test('Non-empty patch and non-empty original content', () => {
        const originalContent = `This is an existing line
This is another existing line` as FileContentStr;
        const patchContent = patch(`@@ -1,2 +1,4 @@
+This is a new line
 This is an existing line
+This is another new line
 This is another existing line`);
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
        const result = applyPatchToViaStrings(patch(patchContent), originalContent as FileContentStr);
        expect(result).toBe(expectedContent);
    });
});