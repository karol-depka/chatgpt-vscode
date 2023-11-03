
// could run various combinations on those, automatically
export const formattingGuidelines = [
  `Modify minimum number of lines.`,
  `Do not make unrelated changes to the file`,
  `Ensure that the patch is valid`,
  // `Ensure that if you want to modify a line, it is prefixed`. // Could prefix with star or ~ or something (prolly not # coz comment and will confuse GPT4). Could fuzzy-apply lines not matching context, as changed lines - it's what GPT4 does sometimes
  "Print me the output as .patch file that can be automatically applied.",
  "The patch should contain proper indentation.",
  "Just print the file patches; no explanations, no pleasantries, no prelude.",
  "Always print me only the patches (each patch surrounded by markdown ```).",
  "Never print full file contents; unless you want to create new file.",
  "Before each file you output, provide full file path.",
  "If there are source code comments in the file, keep them.",
];
