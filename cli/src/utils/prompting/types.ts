import { FileToPatch } from "../patching/types";
import { MPUserPrompt } from "../types";

export type FilesToPatch = FileToPatch[];

export interface MPPromptInputs {
  userPrompt: MPUserPrompt;
  filesToPatch: FilesToPatch;
}
