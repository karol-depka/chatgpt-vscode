export type FilePathStr = 
    string & {type: 'FilePath',}
export type PatchFilePathStr
  = string & { type: "PatchFilePathStr" };
export type FileContentStr = 
    string & { type: "FileContent" };
export type FileTypeStr = 
    string & { type: "FileType" };
export type PatchContentStr = 
    string & { type: "PatchStringContent" };
export type MarkDownContentStr = 
    string & { type: "MarkDownStringContent" };
