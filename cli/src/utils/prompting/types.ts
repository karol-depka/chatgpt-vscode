import { MPFileToPatch } from "../patching/types";
import { MPUserPrompt } from "../types";

export type FilesToPatch = MPFileToPatch[];

export interface MPPromptInputs {
  userPrompt: MPUserPrompt;
  filesToPatch: FilesToPatch;
}
