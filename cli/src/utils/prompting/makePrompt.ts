import { blue, reset } from "../colors";
import { makeCodeBlockForPrompt } from "../markdown/generateMarkdown";
import { customGuidelines } from "./custom_guidelines";
import { formattingGuidelines } from "./formattingGuidelines";
import { FileToPatch } from "../patching/types";
import { MPFullPrompt, MPUserPrompt } from "../types";
import { MPPromptInputs } from "./types";

/* Note: this makes GPT4 assumptions, like guidelines, markdown; will see how other LLM-s communicate */
export function makePrompt(promptInputs: MPPromptInputs): MPFullPrompt {
  const titledFileCodeBlocks = promptInputs.filesToPatch.map((f) =>
    makeCodeBlockForPrompt(f.filePath, f.baseContent)
  );
  const fullPromptTextToSend = `
Given the files listed below, perform those changes to the files:
${promptInputs.userPrompt}
Here are the files to patch:
${titledFileCodeBlocks.join("\n\n")}
=====
${customGuidelines.join("\n")}

==== Here I give you general output formatting guidelines - you must follow them!
${formattingGuidelines.join("\n")}
`;
  console.log(blue + "fullPromptTextToSend:\n" + reset, fullPromptTextToSend);
  return fullPromptTextToSend as MPFullPrompt;
}
