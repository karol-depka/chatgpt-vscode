import * as vscode from 'vscode';
import { BASE_URL, ChatGPTViewProvider } from "./chatGPTViewProvider";
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	console.log('activating extension "chatgpt"');
	const provider = initializeProvider(context);
	registerCommands(context, provider);
	handleConfigurationChanges(provider);
}

function initializeProvider(context: vscode.ExtensionContext): ChatGPTViewProvider {
	const config = vscode.workspace.getConfiguration('chatgpt');
	const provider = new ChatGPTViewProvider(context.extensionUri);

	provider.setAuthenticationInfo({
		apiKey: config.get<string>('apiKey')
	});
	provider.setSettings({
		selectedInsideCodeblock: config.get<boolean>('selectedInsideCodeblock') || false,
		codeblockWithLanguageId: config.get<boolean>('codeblockWithLanguageId') || false,
		pasteOnClick: config.get<boolean>('pasteOnClick') || false,
		keepConversation: config.get<boolean>('keepConversation') || false,
		timeoutLength: config.get<number>('timeoutLength') || 60,
		apiUrl: config.get<string>('apiUrl') || BASE_URL,
		model: config.get<string>('model') || 'gpt-3.5-turbo'
	});

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatGPTViewProvider.viewType, provider, {
			webviewOptions: { retainContextWhenHidden: true }
		})
	);

	return provider;
}

function registerCommands(context: vscode.ExtensionContext, provider: ChatGPTViewProvider): void {
	const commandHandler = (command: string) => {
		const config = vscode.workspace.getConfiguration('chatgpt');
		const prompt = config.get<string>(command);
		if (prompt) {
			provider.search(prompt);
		}
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('chatgpt.ask', () =>
			vscode.window.showInputBox({ prompt: 'What do you want to do?' })
				.then((value) => {
					if (value) {
						provider.search(value);
					}
				})
		),
		vscode.commands.registerCommand('chatgpt.explain', () => commandHandler('promptPrefix.explain')),
		vscode.commands.registerCommand('chatgpt.refactor', () => commandHandler('promptPrefix.refactor')),
		vscode.commands.registerCommand('chatgpt.optimize', () => commandHandler('promptPrefix.optimize')),
		vscode.commands.registerCommand('chatgpt.findProblems', () => commandHandler('promptPrefix.findProblems')),
		vscode.commands.registerCommand('chatgpt.documentation', () => commandHandler('promptPrefix.documentation')),
		vscode.commands.registerCommand('chatgpt.resetConversation', () => provider.resetConversation()),
		// vscode.commands.registerCommand('chatgpt.applyAll', async () => {
		// })
	);
}

function handleConfigurationChanges(provider: ChatGPTViewProvider): void {
	vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
		const config = vscode.workspace.getConfiguration('chatgpt');
		// added2
		if (event.affectsConfiguration('chatgpt.apiKey')) {
			provider.setAuthenticationInfo({ apiKey: config.get<string>('apiKey') });
		} else if (event.affectsConfiguration('chatgpt.apiUrl')) {
			let url = config.get<string>('apiUrl') || BASE_URL;
			provider.setSettings({ apiUrl: url });
		} else if (event.affectsConfiguration('chatgpt.model')) {
			provider.setSettings({ model: config.get<string>('model') || 'gpt-3.5-turbo' });
		} else if (event.affectsConfiguration('chatgpt.selectedInsideCodeblock')) {
			provider.setSettings({ selectedInsideCodeblock: config.get<boolean>('selectedInsideCodeblock') || false });
		} else if (event.affectsConfiguration('chatgpt.codeblockWithLanguageId')) {
			provider.setSettings({ codeblockWithLanguageId: config.get<boolean>('codeblockWithLanguageId') || false });
		} else if (event.affectsConfiguration('chatgpt.pasteOnClick')) {
			provider.setSettings({ pasteOnClick: config.get<boolean>('pasteOnClick') || false });
		} else if (event.affectsConfiguration('chatgpt.keepConversation')) {
			provider.setSettings({ keepConversation: config.get<boolean>('keepConversation') || false });
		} else if (event.affectsConfiguration('chatgpt.timeoutLength')) {
			provider.setSettings({ timeoutLength: config.get<number>('timeoutLength') || 60 });
		}
	});
}

export function deactivate() {}
