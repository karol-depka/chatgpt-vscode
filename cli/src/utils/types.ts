/** MP stands tentatively for MetaPrompting */
export type MPFilePath
  = string & {type: 'MPFilePath',}
export type MPPatchFilePath
  = string & { type: "MPPatchFilePath" };
export type MPFileContent
  = string & { type: "MPFileContent" };
export type MPFileType =
    string & { type: "MPFileType" };
export type MPPatchContent =
    string & { type: "MPPatchContent" };
export type MPMarkDownContent =
    string & { type: "MPMarkDownContent" };

/** later this could involve stuff like images, etc., as part of the prompt */
export type MPUserPrompt =
    string & { type: "MPUserPrompt" };

export type MPFullLLMPrompt =
    string & { type: "MPFullLLMPrompt" };

