// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { formatTsql } from './formatter/engine';
import { loadActiveProfile, applyWorkspaceProfile, exportProfile, importProfile, saveProfile } from './profiles/profileManager';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const selector: vscode.DocumentSelector = [
		{ language: 'sql' }
	];

	const disposableFormatter = vscode.languages.registerDocumentFormattingEditProvider(selector, {
		provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
			const text = document.getText();
			const config = vscode.workspace.getConfiguration('tsqlformatter');
			const profile = loadActiveProfile(config, context);
			const formatted = formatTsql(text, { options, config, profile });

			if (token.isCancellationRequested) {
				return [];
			}

			const firstLine = document.lineAt(0);
			const lastLine = document.lineAt(document.lineCount - 1);
			const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
			return [vscode.TextEdit.replace(fullRange, formatted)];
		}
	});

	context.subscriptions.push(disposableFormatter);

	// Commands for profile management
	context.subscriptions.push(vscode.commands.registerCommand('tsqlformatter.saveProfile', async () => {
		await saveProfile(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tsqlformatter.loadProfile', async () => {
		await applyWorkspaceProfile(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tsqlformatter.exportProfile', async () => {
		await exportProfile(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tsqlformatter.importProfile', async () => {
		await importProfile(context);
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
