import { MPFilePath } from "../types";
import { coloredFilePath } from "../fs/fsUtils";
import { execSync } from "child_process";

export function executeFile(patchedFilePath: MPFilePath) {
  //   require("ts-node").register();
  console.log("===== Will execute", coloredFilePath(patchedFilePath));
  //   require("../" + patchedFilePath);
  try {
    execSync(`ts-node ${patchedFilePath}`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error executing file:", error);
  }
  console.log("===== Finished executing", coloredFilePath(patchedFilePath));
}
