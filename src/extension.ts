import * as vscode from 'vscode';
import { PreviewPanel } from './PreviewPanel';
import { MarkdownParser } from './utils/markdownParser';

export function activate(context: vscode.ExtensionContext) {
    console.log('PromptAgent Preview is now active!');
    
    // Eagerly initialize parser in the background to prevent cold-start delay
    MarkdownParser.initialize();
    
    // Register the custom editor provider
    const providerRegistration = vscode.window.registerCustomEditorProvider(
        PreviewPanel.viewType,
        new PreviewPanel(context.extensionUri),
        {
            webviewOptions: {
                retainContextWhenHidden: true,
            }
        }
    );

    context.subscriptions.push(providerRegistration);
}

export function deactivate() {}
