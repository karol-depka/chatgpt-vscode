import {MPFileContent, MPFileContentBase, MPFilePath, MPPatchContent} from "../types";

/** TODO maybe call it candidate or input or smth */
export interface MPFileToPatch {
    /** this later will be any kind of path. e.g. url */
    filePath: MPFilePath;
    /** this later can be any kind of file content,
     * e.g. binary, AST, some more difficult file types, that has to be patched in a special way,
     * or need to be printed in whole*/
    baseContent: MPFileContentBase;
}

export interface MPFileToPatchToApply {
    fileToPatch: MPFileToPatch;
    patchContents: MPPatchContent;
}
