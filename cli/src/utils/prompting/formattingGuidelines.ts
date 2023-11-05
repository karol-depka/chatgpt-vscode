
// could run various combinations on those, automatically

const g = {
  files: ["Before each file you output, provide full file path."],
  printAsPatches: [
    "Always print me the output as .patch file that can be automatically applied to the original file I gave you. I cannot accept any other output format than patches.",
    `Ensure that the patch is valid.`,
    // `Ensure that if you want to modify a line, it is prefixed`. // Could prefix with star or ~ or something (prolly not # coz comment and will confuse GPT4). Could fuzzy-apply lines not matching context, as changed lines - it's what GPT4 does sometimes
    "The patch should contain proper indentation.",
    "The patch context should be more or less 3 lines (3 lines before and efter).",
    "Just give me the file patches; no explanations, no pleasantries, no prelude.",
    "Always print me only the patches (each patch surrounded by markdown ```patch).",
    // "Never print full file contents; unless you want to create new file.",
  ],
  printAsFullFiles: [
    "Print full exact contents of the files you want me to modify.",
  ],
  minimizeChanges: [
    // `Modify minimum number of lines.`,
    // `Do not make unrelated changes to the file.`,
  ],
  brevity: [
      "Don't print me explanations, nor pleasantries nor preambles like 'here you go' or 'you need to do this', just print me the code.", // TODO: this will prolly be fixed by `instruct` model
      "Don't put comments in the code, unless something very unusual or tricky is happening in the code",
  ]
};
export const formattingGuidelines = [
  "If there are source code comments in the file, keep them.",
  ...g.files,
  ...g.minimizeChanges,
  // Mutually exclusive:
  ...g.printAsFullFiles,
  // ...g.printAsPatches,

  ...g.brevity,

];
