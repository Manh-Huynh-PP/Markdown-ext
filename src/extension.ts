import * as vscode from 'vscode';
import { PreviewPanel } from './PreviewPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('PromptAgent Preview is now active!');
    
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
