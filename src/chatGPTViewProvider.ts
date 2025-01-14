import * as vscode from 'vscode';
import {ChatGPTAPI} from "chatgpt";
import {AuthInfo, Settings} from "./types";
import { getGitDirectories, isWorkingDirectoryClean } from './utils/git_utils';

export const BASE_URL = 'https://api.openai.com/v1';


export class ChatGPTViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'chatgpt.chatView';
    private _view?: vscode.WebviewView;

    private _chatGPTAPI?: ChatGPTAPI;
    private _conversation?: any;

    private _response?: string;
    private _prompt?: string;
    private _fullPrompt?: string;
    private _currentMessageNumber = 0;

    private _settings: Settings = {
        selectedInsideCodeblock: false,
        codeblockWithLanguageId: false,
        pasteOnClick: true,
        keepConversation: true,
        timeoutLength: 60,
        apiUrl: BASE_URL,
        model: 'gpt-3.5-turbo'
    };
    private _authInfo?: AuthInfo;

    // In the constructor, we store the URI of the extension
    constructor(private readonly _extensionUri: vscode.Uri) {

    }

    // Set the API key and create a new API instance based on this key
    public setAuthenticationInfo(authInfo: AuthInfo) {
        this._authInfo = authInfo;
        this._newAPI();
    }

    public setSettings(settings: Settings) {
        let changeModel = false;
        if (settings.apiUrl || settings.model) {
            changeModel = true;
        }
        this._settings = {...this._settings, ...settings};

        if (changeModel) {
            this._newAPI();
        }
    }

    public getSettings() {
        return this._settings;
    }

    // This private method initializes a new ChatGPTAPI instance
    private _newAPI() {
        console.log("New API");
        if (!this._authInfo || !this._settings?.apiUrl) {
            console.warn("API key or API URL not set, please go to extension settings (read README.md for more info)");
        } else {
            this._chatGPTAPI = new ChatGPTAPI({
                apiKey: this._authInfo.apiKey || "xx",
                apiBaseUrl: this._settings.apiUrl,
                completionParams: {model: this._settings.model || "gpt-3.5-turbo"},
            });
            // console.log( this._chatGPTAPI );
        }
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
    
        // set options for the webview, allow scripts
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
    
        // set the HTML for the webview
        let html = this._getHtmlForWebview(webviewView.webview);
        html = this._addButtonsToCodeBlocks(html);  // Call the method here
        webviewView.webview.html = html;
    
        // add an event listener for messages received by the webview
        webviewView.webview.onDidReceiveMessage(async data => {
            console.log('onDidReceiveMessage', data)
            switch (data.type) {
                case 'codeSelected': {
                    // do nothing if the pasteOnClick option is disabled
                    if (!this._settings.pasteOnClick) {
                        break;
                    }
                    let code = data.value;
                    const snippet = new vscode.SnippetString();
                    snippet.appendText(code);
                    // insert the code as a snippet into the active text editor
                    vscode.window.activeTextEditor?.insertSnippet(snippet);
                    break;
                }
                case 'prompt': {
                    this.search(data.value);
                    break;
                }
                case 'applyAll': {
                    console.log('applyAll message handler')
                    getGitDirectories().then(async (folderPaths) => {
                        for ( let folderPath of folderPaths ) {
                            // const folderPath = folder.uri.fsPath;
                            console.log('folderPath', folderPath);
                            let isClean = await isWorkingDirectoryClean(folderPath);
                            if (isClean) {
                                vscode.window.showInformationMessage('The working directory is clean!');
                            } else {
                                vscode.window.showWarningMessage(folderPath + ' has uncommitted changes');
                            }
                            console.log('folderPath', folderPath);
                            }
                    });

                    // })

                    // if (vscode.workspace.workspaceFolders) {
                    //     vscode.workspace.workspaceFolders.forEach(async folder => {
                    // } else {
                    //     console.log('No folders are open.');
                    // }
                
                    // vscode.window.showInformationMessage('applyAll');
                    // const git = vscode.extensions.getExtension('vscode.git')?.exports.getAPI(1);
                    // if (!git) {
                    //     vscode.window.showErrorMessage('Git extension not found');
                    //     return;
                    // }
                    // const repo = git.repositories[0];
                    // if (!repo) {
                    //     vscode.window.showErrorMessage('No repository found');
                    //     return;
                    // }
                    // const status = await repo.getStatus();
                    // if (status.length > 0) {
                    //     vscode.window.showErrorMessage('Working copy is not clean');
                    //     return;
                    // }
                    // await vscode.commands.executeCommand('workbench.action.files.saveAll');
                    // await vscode.commands.executeCommand('workbench.action.files.revert');
                    // await vscode.commands.executeCommand('workbench.action.files.saveAll');
                    // vscode.window.showInformationMessage('All changes applied successfully');
        
                    // break;
                }
            }
        });
    }
    


    public async resetConversation() {
        console.log(this, this._conversation);
        if (this._conversation) {
            this._conversation = null;
        }
        this._prompt = '';
        this._response = '';
        this._fullPrompt = '';
        this._view?.webview.postMessage({type: 'setPrompt', value: ''});
        this._view?.webview.postMessage({type: 'addResponse', value: ''});
    }


    public async search(prompt?: string) {
        this._prompt = prompt;
        if (!prompt) {
            prompt = '';
        }
    
        // Check if the ChatGPTAPI instance is defined
        if (!this._chatGPTAPI) {
            this._newAPI();
        }
    
        // focus gpt activity from activity bar
        if (!this._view) {
            await vscode.commands.executeCommand('chatgpt.chatView.focus');
        } else {
            this._view?.show?.(true);
        }
    
        let response = '';
        this._response = '';
        // Get the selected text of the active editor
        const selection = vscode.window.activeTextEditor?.selection;
        const selectedText = vscode.window.activeTextEditor?.document.getText(selection);
        // Get the language id of the selected text of the active editor
        // If a user does not want to append this information to their prompt, leave it as an empty string
        const languageId = (this._settings.codeblockWithLanguageId ? vscode.window.activeTextEditor?.document?.languageId : undefined) || "";
        let searchPrompt = '';
    
        console.log('search(prompt: selection, selectedText', selection, selectedText)
        if (selection && selectedText) {
            // If there is a selection, add the prompt and the selected text to the search prompt
            if (this._settings.selectedInsideCodeblock) {
                searchPrompt = `${prompt}\n\`\`\`${languageId}\n${selectedText}\n\`\`\``;
            } else {
                searchPrompt = `${prompt}\n${selectedText}\n`;
            }
        } else {
            // Otherwise, just use the prompt if user typed it
            searchPrompt = prompt;
        }
    
        // Add the required text to the prompt
        // searchPrompt += "\nAlways print me full file. Always print full file paths before every file.";
    
        console.log('this._fullPrompt, _fullPrompt', this._fullPrompt)

        this._fullPrompt = searchPrompt;
    
        // Increment the message number
        this._currentMessageNumber++;
        let currentMessageNumber = this._currentMessageNumber;
    
        if (!this._chatGPTAPI) {
            response = '[ERROR] "API key not set or wrong, please go to extension settings to set it (read README.md for more info)"';
        } else {
            // If successfully signed in
            console.log("sendMessage");
    
            // Make sure the prompt is shown
            this._view?.webview.postMessage({type: 'setPrompt', value: this._prompt});
            this._view?.webview.postMessage({type: 'addResponse', value: '...'});
    
            const agent = this._chatGPTAPI;
    
            try {
                // Send the search prompt to the ChatGPTAPI instance and store the response
                const res = await agent.sendMessage(searchPrompt, {
                    onProgress: (partialResponse) => {
                        // If the message number has changed, don't show the partial response
                        if (this._currentMessageNumber !== currentMessageNumber) {
                            return;
                        }
                        console.log("onProgress");
                        if (this._view && this._view.visible) {
                            response = partialResponse.text;
                            this._response = response;
                            this._view.webview.postMessage({type: 'addResponse', value: response});
                        }
                    },
                    timeoutMs: (this._settings.timeoutLength || 60) * 1000,
                    ...this._conversation
                });
    
                if (this._currentMessageNumber !== currentMessageNumber) {
                    return;
                }
    
                console.log(res);
    
                response = res.text;
                if (res.detail?.usage?.total_tokens) {
                    response += `\n\n---\n*<sub>Tokens used: ${res.detail.usage.total_tokens} (${res.detail.usage.prompt_tokens}+${res.detail.usage.completion_tokens})</sub>*`;
                }
    
                if (this._settings.keepConversation) {
                    this._conversation = {
                        parentMessageId: res.id
                    };
                }
    
            } catch (e: any) {
                console.error(e);
                if (this._currentMessageNumber === currentMessageNumber) {
                    response = this._response;
                    response += `\n\n---\n[ERROR] ${e}`;
                }
            }
        }
    
        if (this._currentMessageNumber !== currentMessageNumber) {
            return;
        }
    
        // Saves the response
        this._response = response;
    
        // Show the view and send a message to the webview with the response
        if (this._view) {
            this._view.show?.(true);
            this._view.webview.postMessage({type: 'addResponse', value: response});
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const microlightUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'microlight.min.js'));
        const tailwindUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'showdown.min.js'));
        const showdownUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'tailwind.min.js'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport"
                    content="width=device-width,
                    initial-scale=1.0"
                >
                <script src="${tailwindUri}"></script>
                <script src="${showdownUri}"></script>
                <script src="${microlightUri}"></script>
                <style>
                .code {
                    white-space: pre;
                }
                p {
                    padding-top: 0.3rem;
                    padding-bottom: 0.3rem;
                }
                /* overrides vscodes style reset, displays as if inside web browser */
                ul, ol {
                    list-style: initial !important;
                    margin-left: 10px !important;
                }
                h1, h2, h3, h4, h5, h6 {
                    font-weight: bold !important;
                }
                .flex-container {
                    display: flex;
                    flex-direction: column-reverse;
                    height: 100%;
                }
                #response {
                    flex-grow: 1;
                    overflow-y: auto;
                }
                .vscode-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    padding: 5px 10px;
                    border: none;
                    border-radius: 3px;
                    margin-right: 10px;
                    cursor: pointer;
                }
                .vscode-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .vscode-button:active {
                    background-color: var(--vscode-button-activeBackground);
                }
                </style>
            </head>
            <body class="flex-container">
                <div id="response" class="pt-4 text-sm"></div> 
                <textarea rows="4"
                    class="h-10 w-full text-white bg-stone-700 p-4 text-sm"
                    placeholder="Ask ChatGPT (MetaPrompting edition) something"
                    id="prompt-input"
                    oninput="autoGrow(this)"
                    onkeydown="handleEnter(event)"
                ></textarea>
                <script src="${scriptUri}"></script>
                <script>
                    function autoGrow(element) {
                        element.style.height = "5px";
                        element.style.height = (element.scrollHeight)+"px";
                    }

                    function handleEnter(event) {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                        }
                    }
                </script>
                </body>
            </html>`;
    }

    private _addButtonsToCodeBlocks(html: string): string {
        const codeBlockRegex = /<pre>\s*<code.*?>\s*([\s\S]*?)\s*<\/code>\s*<\/pre>/g;
        let match;
        let newHtml = html;
        while ((match = codeBlockRegex.exec(html)) !== null) {
            console.log('_addButtonsToCodeBlocks match', match)
            const codeBlock = match[1];
            const fullFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
            const printFullFileButton = `<button class="vscode-button" onclick="printFullFile('${fullFilePath}')">Print Full File</button>`;
            const printFileButton = `<button class="vscode-button" onclick="printFile('${fullFilePath}', '${codeBlock}')">Print File</button>`;
            const newCodeBlock = `<pre><code class="microlight">${codeBlock}</code></pre><div>${printFullFileButton}${printFileButton}</div>`;
            newHtml = newHtml.replace(match[0], newCodeBlock);
        }
        return newHtml;
    }


    public async printFullFile(filePath: string) {
        const document = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        await vscode.commands.executeCommand('workbench.action.files.saveAs');
    }

    public async printFile(filePath: string, code: string) {
        const document = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(document);
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), code);
        });
        await vscode.commands.executeCommand('editor.action.selectAll');
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        await vscode.commands.executeCommand('workbench.action.files.saveAs');
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    }
}