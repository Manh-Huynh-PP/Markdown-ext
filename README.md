# Markdown Preview

A premium VS Code / Antigravity extension designed for Prompt Engineers. It provides a stunning, theme-aware Markdown preview optimized for reviewing and commenting on prompts.

## ✨ Features

- **Premium UI**: Modern, flat design that blends seamlessly with your IDE theme.
- **Smart Feedback**: Add comments directly to blocks of text/code in the preview.
- **Direct Chat Injection**: Submit your feedback directly to the Antigravity/Cursor Agent chat.
- **Themed Mermaid Diagrams**: Native Mermaid support that automatically matches your IDE's dark/light theme.
- **Image Carousels**: Support for interactive image carousels using `carousel` code blocks.
- **Compact Header**: Streamlined navigation with quick-access buttons (Copy Raw, Edit, Submit).
- **Interactive Code Blocks**: One-click copy for all code snippets.
- **Visual Excellence**: Premium image styling with shadows, rounded corners, and hover effects.

## 📦 What's New (v1.1)

- **Mermaid Integration**: No more white backgrounds on diagrams! Fully theme-aware rendering.
- **Carousel Support**: Use `carousel` code blocks with `<!-- slide -->` to create interactive image galleries.
- **Optimized Layout**: Compact header and better handling of nested comment buttons.
- **Bug Fixes**: Resolved issue with comment buttons being clipped in nested containers.

## 🚀 Getting Started

1. Open any Markdown (`.md`) file.
2. The preview panel will automatically open (or right-click -> Open With -> PromptAgent Preview).
3. Hover over content blocks to see the "Add Comment" button.
4. Click "Submit Comments" to send your requests to the Agent.

## 🛠️ Development

### Scripts
- `npm run compile`: Compile TypeScript to JavaScript.
- `npm run watch`: Watch for changes and re-compile.
- `npx @vscode/vsce package`: Package the extension into a `.vsix` file.

## 📄 License
MIT
