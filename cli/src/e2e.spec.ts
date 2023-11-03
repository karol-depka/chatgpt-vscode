// describe('E2E tests - including LLM and file modifications and executing resulting file', () => {
//     // some stuff that is reliable to not have flaky tests cause LLM randomness;
//     // e.g. skip whitespaces / indent
//
//     // those tests could be reused at patcher test level too - but patcher tests much faster and cheaper to execute
//
//     test("hello_simple - patch from openai, but without whitespace", () => {
//         const origContent = `// start
// console.log('hello world')
// console.debug('bye')
// // end
// ` as MPFileContent;
//         const patchContent = patch(`--- a/examples/hello_simple/hello.ts
// +++ b/examples/hello_simple/hello.ts
// @@ -1,5 +1,5 @@
//  // start
// -console.log('hello world')
// +console.log('hello Earth')
//  console.debug('bye')
//  // end
// `);
//
// })
