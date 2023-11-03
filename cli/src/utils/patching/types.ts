import {FileContent, FilePath} from "../types";

export interface FileToPatch {
    /** this later will be any kind of path. e.g. url */
    filePath: FilePath;
    /** this later can be any kind of file content,
     * e.g. binary, AST, some more difficult file types, that has to be patched in a special way,
     * or need to be printed in whole*/
    baseContent: FileContent;
}
