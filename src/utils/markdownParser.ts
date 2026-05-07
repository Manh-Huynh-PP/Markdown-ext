import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

export class MarkdownParser {
    private static md: any = null;
    private static isConfigured = false;

    private static getParser(): any {
        if (!this.md) {
            console.log('[PromptAgent] Initializing MarkdownIt...');
            this.md = new MarkdownIt({
                html: true,
                linkify: true,
                typographer: true
            });
        }
        return this.md;
    }

    public static parse(content: string, webview?: vscode.Webview, documentUri?: vscode.Uri): string {
        try {
            const md = this.getParser();
            
            if (!this.isConfigured) {
                console.log('[PromptAgent] Loading Markdown plugins...');
                
                // Helper to load and use plugins lazily
                const loadAndUse = (name: string, pluginPath: string, options?: any) => {
                    try {
                        console.log(`[PromptAgent]  -> Loading ${name}...`);
                        const plugin = require(pluginPath);
                        md.use(plugin, options);
                        console.log(`[PromptAgent]  -> ${name} loaded.`);
                    } catch (e) {
                        console.error(`[PromptAgent] Failed to load plugin ${name}:`, e);
                    }
                };

                // Load plugins sequentially with logging
                loadAndUse('TaskLists', 'markdown-it-task-lists', { label: true, labelAfter: true });
                loadAndUse('Footnote', 'markdown-it-footnote');
                loadAndUse('Emoji', 'markdown-it-emoji');
                loadAndUse('Sub', 'markdown-it-sub');
                loadAndUse('Sup', 'markdown-it-sup');
                loadAndUse('Mark', 'markdown-it-mark');
                loadAndUse('Ins', 'markdown-it-ins');
                loadAndUse('Abbr', 'markdown-it-abbr');
                loadAndUse('Container', 'markdown-it-container');
                
                // Load MathJax last as it is the heaviest
                loadAndUse('MathJax', 'markdown-it-mathjax3');

                console.log('[PromptAgent] Configuring Custom Renderers...');

                // Configure Callout containers
                try {
                    const container = require('markdown-it-container');
                    const callouts = ['note', 'tip', 'warning', 'important'];
                    callouts.forEach(type => {
                        md.use(container, type, {
                            render: (tokens: Token[], idx: number) => {
                                const token = tokens[idx];
                                if (token.nesting === 1) {
                                    const icon = this._getCalloutIcon(type);
                                    const title = type.charAt(0).toUpperCase() + type.slice(1);
                                    let lineAttr = token.map ? ` data-line-start="${token.map[0] + 1}" data-line-end="${token.map[1]}"` : '';
                                    return `<div class="callout callout-${type} commentable-block"${lineAttr}><div class="callout-header"><span class="callout-icon">${icon}</span><span class="callout-title">${title}</span></div><div class="callout-content">`;
                                } else {
                                    return '</div></div>\n';
                                }
                            }
                        });
                    });
                } catch (e) {}

                // Custom renderer for block rules to add line mapping
                const blockRules = ['paragraph', 'heading', 'blockquote', 'table', 'bullet_list', 'ordered_list', 'list_item'];
                blockRules.forEach(rule => {
                    const defaultOpen = md.renderer.rules[`${rule}_open`] || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                        return self.renderToken(tokens, idx, options);
                    };
                    
                    md.renderer.rules[`${rule}_open`] = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                        const token = tokens[idx];
                        if (token.map) {
                            token.attrJoin('class', 'commentable-block');
                            token.attrPush(['data-line-start', String(token.map[0] + 1)]);
                            token.attrPush(['data-line-end', String(token.map[1])]);
                        }
                        return defaultOpen(tokens, idx, options, env, self);
                    };
                });

                // Custom image resolver
                const defaultImageRender = md.renderer.rules.image || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                    return self.renderToken(tokens, idx, options);
                };
                md.renderer.rules.image = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                    const token = tokens[idx];
                    const srcIndex = token.attrIndex('src');
                    if (srcIndex >= 0 && env && env.webview && env.documentUri) {
                        let src = token.attrs![srcIndex][1];
                        if (!/^https?:\/\//.test(src) && !/^data:/.test(src) && !src.startsWith('vscode-webview-resource:')) {
                            try {
                                const imageUri = vscode.Uri.joinPath(vscode.Uri.joinPath(env.documentUri, '..'), src);
                                token.attrs![srcIndex][1] = env.webview.asWebviewUri(imageUri).toString();
                            } catch (err) {}
                        }
                    }
                    return defaultImageRender(tokens, idx, options, env, self);
                };

                // Custom fence (Code blocks + Mermaid)
                const defaultFence = md.renderer.rules.fence || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                    return self.renderToken(tokens, idx, options);
                };
                md.renderer.rules.fence = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                    const token = tokens[idx];
                    const lang = token.info.trim().toLowerCase() || 'text';
                    let lineStart = token.map ? token.map[0] + 1 : 0;
                    let lineEnd = token.map ? token.map[1] : 0;
                    
                    if (lang === 'mermaid') {
                        return `<div class="mermaid-wrapper commentable-block" data-line-start="${lineStart}" data-line-end="${lineEnd}"><div class="mermaid">${token.content}</div></div>`;
                    }
                    
                    if (lang === 'carousel') {
                        const slides = token.content.split(/<!--\s*slide\s*-->/);
                        const renderedSlides = slides.map((slide, i) => {
                            const slideHtml = this.md.render(slide.trim(), env);
                            return `<div class="carousel-slide ${i === 0 ? 'active' : ''}">${slideHtml}</div>`;
                        }).join('');
                        
                        return `
                        <div class="carousel-container commentable-block" data-line-start="${lineStart}" data-line-end="${lineEnd}">
                            <div class="carousel-track">
                                ${renderedSlides}
                            </div>
                            ${slides.length > 1 ? `
                            <button class="carousel-nav prev" title="Previous Slide">
                                <svg class="icon" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                            </button>
                            <button class="carousel-nav next" title="Next Slide">
                                <svg class="icon" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                            </button>
                            <div class="carousel-dots">
                                ${slides.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                            </div>
                            ` : ''}
                        </div>`;
                    }
                    
                    const renderedCode = defaultFence(tokens, idx, options, env, self);
                    const highlightedCode = renderedCode.replace(/\[([^\]]+)\]/g, '<span class="bracket-text">[$1]</span>');
                    return `<div class="premium-code-wrapper commentable-block" data-line-start="${lineStart}" data-line-end="${lineEnd}"><div class="code-header"><span class="code-lang">${lang.toUpperCase()}</span><button class="copy-btn"><svg class="icon" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>Copy</button></div><div class="code-body">${highlightedCode}</div></div>`;
                };

                // Bracket text wrapper
                const defaultText = md.renderer.rules.text || function(tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
                    return self.renderToken(tokens, idx, options);
                };
                md.renderer.rules.text = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => {
                    return defaultText(tokens, idx, options, env, self).replace(/\[([^\]]+)\]/g, '<span class="bracket-text">[$1]</span>');
                };

                this.isConfigured = true;
                console.log('[PromptAgent] Markdown configuration complete.');
            }

            return md.render(content, { webview, documentUri });
        } catch (err) {
            console.error('[PromptAgent] Render error:', err);
            return `<div class="error">Render Error: ${err}</div><pre>${content}</pre>`;
        }
    }

    private static _getCalloutIcon(type: string): string {
        switch (type) {
            case 'note': return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
            case 'tip': return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
            case 'warning': return '<svg class="icon" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
            case 'important': return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
            default: return '';
        }
    }
}
