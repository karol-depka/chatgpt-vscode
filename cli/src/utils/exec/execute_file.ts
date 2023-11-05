import { MPFilePath } from "../types";
import { coloredFilePath } from "../fs/fsUtils";

export function executeFile(patchedFilePath: MPFilePath) {
  require("ts-node").register();
  console.log("===== Will execute", coloredFilePath(patchedFilePath));
  require("../" + patchedFilePath);
  console.log("===== Finished executing", coloredFilePath(patchedFilePath));
}
