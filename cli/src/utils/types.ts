/** MP stands tentatively for MetaPrompting */
export type MPFilePath =
    string & {type: 'MPFilePath',}
export type PatchFilePathStr
  = string & { type: "PatchFilePathStr" };
export type MPFileContent =
    string & { type: "FileContent" };
export type FileTypeStr = 
    string & { type: "FileType" };
export type PatchContentStr = 
    string & { type: "PatchStringContent" };
export type MarkDownContentStr = 
    string & { type: "MarkDownStringContent" };

/** later this could involve stuff like images, etc., as part of the prompt */
export type MPUserPrompt =
    string & { type: "MPUserPrompt" };

export type MPFullPrompt =
    string & { type: "MPFullPrompt" };

