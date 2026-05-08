import * as vscode from 'vscode';
import { getNonce } from './utils/nonce';
import { MarkdownParser } from './utils/markdownParser';

export class PreviewPanel implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'promptagentPreview';

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'media'),
                vscode.Uri.joinPath(document.uri, '..')
            ]
        };

        const updateWebview = () => {
            webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview, document);
        };

        const updateContent = () => {
            webviewPanel.webview.postMessage({
                command: 'update',
                html: MarkdownParser.parse(document.getText(), webviewPanel.webview, document.uri)
            });
        };

        // Event listeners
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateContent();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage(async e => {
            switch (e.command) {
                case 'submitComments':
                    const filePath = document.uri.fsPath;
                    const comments = e.comments;
                    if (comments && comments.length > 0) {
                        const appName = vscode.env.appName.toLowerCase();
                        
                        // 1. Build Query (Professional structure for best Agent understanding)
                        let query = `📂 File: ${filePath}\n`;
                        query += `\nHere are the feedback comments to process:\n`;
                        
                        comments.forEach((c: any, index: number) => {
                            query += `\n--- REQUEST #${index + 1} ---\n`;
                            query += `📍 Location: Lines ${c.lineStart} to ${c.lineEnd}\n`;
                            query += `💬 Content: ${c.text}\n`;
                        });
                        
                        query += `\n------------------------------------------\n`;
                        query += `👉 Please review and implement the changes above. Thank you!`;
                        
                        // 2. Clipboard Fallback (Critical for UI Paste fallback)
                        await vscode.env.clipboard.writeText(query);
                        
                        console.log('PromptAgent: Antigravity-Specific Submitting...');

                        try {
                            if (appName.includes('antigravity') || appName.includes('vscode')) {
                                // CHIẾN THUẬT SIÊU ĐƠN GIẢN (Tránh Toggle)
                                console.log('🔄 Executing Safe UI Injection...');
                                
                                // 1. Mở UI & Focus: Tránh dùng 'startNewConversation' vì nó tạo chat mới làm mất context.
                                // Dùng các lệnh focus thay thế. Vì Webview đang có focus, gọi lệnh mở view sẽ không gây toggle off.
                                const focusCommands = [
                                    'antigravity.toggleChatFocus',
                                    'antigravity.openAgent',
                                    'workbench.action.chat.focus'
                                ];
                                
                                for (const cmd of focusCommands) {
                                    try {
                                        await vscode.commands.executeCommand(cmd);
                                        console.log(`✅ ${cmd} triggered`);
                                        break;
                                    } catch (err) {
                                        console.log(`⚠️ ${cmd} failed`);
                                    }
                                }

                                // 2. Đợi UI ổn định hoàn toàn (1 giây)
                                await new Promise(resolve => setTimeout(resolve, 1000));

                                // 3. Dán nội dung (Paste)
                                // Vì startNewConversation đã focus sẵn, chúng ta dán luôn.
                                try {
                                    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
                                    console.log('✅ Paste triggered');
                                    vscode.window.showInformationMessage('🚀 Feedback pasted to Agent!');
                                } catch (err) {
                                    console.error('❌ Paste failed:', err);
                                }
                            } else if (appName.includes('cursor')) {
                                const cursorFocusCommands = [
                                    'workbench.panel.aichat.view.focus',
                                    'aichat.chatView.focus',
                                    'cursor.chat.focus'
                                ];
                                for (const cmd of cursorFocusCommands) {
                                    try {
                                        await vscode.commands.executeCommand(cmd);
                                        break;
                                    } catch (e) {}
                                }
                                vscode.window.showInformationMessage('📋 Copied! Please paste into Cursor Chat.');
                            }
                        } catch (err: any) {
                            console.error('Submit failed:', err);
                            vscode.window.showWarningMessage('Auto-submit failed. Content copied to clipboard, please paste (Ctrl+V) into the Agent.');
                        } finally {
                            webviewPanel.webview.postMessage({ command: 'submissionComplete' });
                        }
                    }
                    return;
                case 'openEditor':
                    vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
                    return;
                case 'copyDocument':
                    vscode.env.clipboard.writeText(document.getText());
                    vscode.window.showInformationMessage('Entire file content copied!');
                    return;
                case 'alert':
                    vscode.window.showErrorMessage(e.text);
                    return;
            }
        });

        // Initial setup - Deferred rendering to prevent UI hang
        webviewPanel.webview.html = `<!DOCTYPE html><html><body style="background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 20px; font-family: sans-serif;">Loading PromptAgent Preview...</body></html>`;
        
        setTimeout(() => {
            updateWebview();
        }, 100);
    }

    private _getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

        const nonce = getNonce();
        const content = MarkdownParser.parse(document.getText(), webview, document.uri);
        const fileName = document.uri.path.split('/').pop() || 'Preview Mode';

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src ${webview.cspSource} 'unsafe-inline';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleMainUri}" rel="stylesheet">
                <script defer nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
                <title>PromptAgent Preview</title>
            </head>
            <body class="antigravity-theme">
                <div id="app">
                    <header class="preview-header">
                        <div class="header-content">
                            <h1 class="file-title">${fileName}</h1>
                            <div class="header-actions">
                                <button id="copy-doc-btn" class="header-btn secondary-btn">
                                    <svg class="icon" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                                    Copy Raw
                                </button>
                                <button id="edit-code-btn" class="header-btn secondary-btn">
                                    <svg class="icon" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    Edit Code
                                </button>
                                <button id="submit-comments-btn" class="submit-comments-btn">
                                    <svg class="icon" viewBox="0 0 24 24" style="fill: white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                    Submit Comments (<span id="comment-count">0</span>)
                                </button>
                            </div>
                        </div>
                    </header>
                    <main id="content-area">
                        ${content}
                    </main>
                    <div id="comment-modal-overlay" class="comment-modal-overlay">
                        <div class="comment-modal">
                            <h3>Enter Comment for Agent</h3>
                            <textarea id="comment-textarea" placeholder="Example: Rewrite with a more professional tone..."></textarea>
                            <div class="modal-actions">
                                <button id="modal-cancel-btn" class="modal-btn cancel">Cancel</button>
                                <button id="modal-save-btn" class="modal-btn save">Save Comment</button>
                            </div>
                        </div>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
