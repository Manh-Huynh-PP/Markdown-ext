import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

export class MarkdownParser {
    private static md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    });

    private static isConfigured = false;

    public static parse(content: string, webview?: vscode.Webview, documentUri?: vscode.Uri): string {
        if (!this.isConfigured) {
            // Custom renderer for block rules to add line mapping
            const blockRules = ['paragraph', 'heading', 'blockquote', 'table', 'bullet_list', 'ordered_list'];
            blockRules.forEach(rule => {
                const defaultOpen = this.md.renderer.rules[`${rule}_open`] || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                    return self.renderToken(tokens, idx, options);
                };
                
                this.md.renderer.rules[`${rule}_open`] = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                    const token = tokens[idx];
                    if (token.map) {
                        const classIdx = token.attrIndex('class');
                        if (classIdx < 0) {
                            token.attrPush(['class', 'commentable-block']);
                        } else {
                            if (token.attrs) {
                                token.attrs[classIdx][1] += ' commentable-block';
                            }
                        }
                        token.attrPush(['data-line-start', String(token.map[0] + 1)]);
                        token.attrPush(['data-line-end', String(token.map[1])]);
                    }
                    return defaultOpen(tokens, idx, options, env, self);
                };
            });

            // Custom renderer for images to resolve local paths
            const defaultImageRender = this.md.renderer.rules.image || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                return self.renderToken(tokens, idx, options);
            };

            this.md.renderer.rules.image = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                const token = tokens[idx];
                const srcIndex = token.attrIndex('src');
                
                if (srcIndex >= 0 && env && env.webview && env.documentUri) {
                    let src = token.attrs![srcIndex][1];
                    
                    // Only process local paths (not http, https, or data URIs)
                    if (!/^https?:\/\//.test(src) && !/^data:/.test(src) && !src.startsWith('vscode-webview-resource:')) {
                        try {
                            const folderUri = vscode.Uri.joinPath(env.documentUri, '..');
                            const imageUri = vscode.Uri.joinPath(folderUri, src);
                            token.attrs![srcIndex][1] = env.webview.asWebviewUri(imageUri).toString();
                        } catch (err) {
                            console.error('Failed to resolve image URI:', src, err);
                        }
                    }
                }
                return defaultImageRender(tokens, idx, options, env, self);
            };

            // Custom renderer for code blocks to add Antigravity-style wrappers and copy buttons
            const defaultRender = this.md.renderer.rules.fence || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                return self.renderToken(tokens, idx, options);
            };

            this.md.renderer.rules.fence = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                const token = tokens[idx];
                const lang = token.info.trim() || 'text';
                
                let lineStart = 0;
                let lineEnd = 0;
                if (token.map) {
                    lineStart = token.map[0] + 1;
                    lineEnd = token.map[1];
                }
                
                const renderedCode = defaultRender(tokens, idx, options, env, self);
                const highlightedCode = renderedCode.replace(/\[([^\]]+)\]/g, '<span class="bracket-text">[$1]</span>');
                
                return `
                <div class="premium-code-wrapper commentable-block" data-line-start="${lineStart}" data-line-end="${lineEnd}">
                    <div class="code-header">
                        <span class="code-lang">${lang.toUpperCase()}</span>
                        <button class="copy-btn">
                            <svg class="icon" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                            Copy
                        </button>
                    </div>
                    <div class="code-body">
                        ${highlightedCode}
                    </div>
                </div>
            `;
            };

            // Custom renderer for text to wrap [...] in a span
            const defaultTextRender = this.md.renderer.rules.text || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                return self.renderToken(tokens, idx, options);
            };
            this.md.renderer.rules.text = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                const content = defaultTextRender(tokens, idx, options, env, self);
                return content.replace(/\[([^\]]+)\]/g, '<span class="bracket-text">[$1]</span>');
            };

            this.isConfigured = true;
        }

        return this.md.render(content, { webview, documentUri });
    }
}
