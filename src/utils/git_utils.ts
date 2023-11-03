import { exec } from 'child_process';
import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

export async function isWorkingDirectoryClean(directoryPath: string) {
    console.log(`Checking if directory ${directoryPath} is clean...`);
    return new Promise((resolve, reject) => {
        exec('git status --porcelain', { cwd: directoryPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error checking directory ${directoryPath}: ${error}`);
                reject(error);
                return;
            }
            resolve(!stdout); // If there's no output, the directory is clean.
        });
    });
}

export async function getGitDirectories(): Promise<string[]> {
    let gitDirectories: string[] = [];

    const isGitRepository = (dir: string): boolean => {
        const exists = fs.existsSync(path.join(dir, '.git')); // TODO: handle submodules, which don't have .git; 
        // but prolly they will show as modified in git status
        console.log(`Checking if ${dir} is a Git repository: ${exists}`);
        return exists;
    };

    const searchForGitDirectories = (dir: string, currentDepth: number = 0): void => {
        if (isGitRepository(dir)) {
            console.log(`Found Git repository at ${dir}`);
            gitDirectories.push(dir);
            return;
        }
        if (currentDepth >= 2) {
            console.log(`Reached maximum search depth at ${dir}`);
            return;
        }

        const subdirs: string[] = fs.readdirSync(dir, { withFileTypes: true })
            .filter((dirent: any) => dirent.isDirectory())
            .map((dirent: any) => path.join(dir, dirent.name));

        for (const subdir of subdirs) {
            searchForGitDirectories(subdir, currentDepth + 1);
        }
    };

    if (vscode.workspace.workspaceFolders) {
        console.log(`Searching for Git repositories in workspace folders...`);
        for (const folder of vscode.workspace.workspaceFolders) {
            const folderPath: string = folder.uri.fsPath;
            searchForGitDirectories(folderPath);
        }
    }

    return gitDirectories;
}

// Usage
getGitDirectories().then(gitDirs => {
    console.log(`Found Git directories: ${gitDirs}`);
});
