
// could run various combinations on those, automatically
export const formattingGuidelines = [
  "Always print me the output as .patch file that can be automatically applied to the original file I gave you. I cannot accept any other output format than patches.",
  // `Modify minimum number of lines.`,
  // `Do not make unrelated changes to the file.`,
  `Ensure that the patch is valid.`,
  // `Ensure that if you want to modify a line, it is prefixed`. // Could prefix with star or ~ or something (prolly not # coz comment and will confuse GPT4). Could fuzzy-apply lines not matching context, as changed lines - it's what GPT4 does sometimes
  "The patch should contain proper indentation.",
  "The patch context should be more or less 3 lines (3 lines before and efter).",
  "Just give me the file patches; no explanations, no pleasantries, no prelude.",
  "Always print me only the patches (each patch surrounded by markdown ```patch).",
  // "Never print full file contents; unless you want to create new file.",
  "Before each file you output, provide full file path.",
  "If there are source code comments in the file, keep them.",
];
