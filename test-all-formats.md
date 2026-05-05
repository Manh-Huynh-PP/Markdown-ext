fsfsdf

ddfgdfg

---

## 1. Typography & Text Formatting

Here is a normal paragraph with some **bold text**, *italic text*, and ~~strikethrough text~~. We also have `inline code` to ensure the monospace font looks correct.

### Heading Level 3
<!-- [PROMPT_AGENT_COMMENT]: Cần kiểm tra lại font chữ của Heading 3 này xem đã premium chưa. -->
#### Heading Level 4
<!-- [PROMPT_AGENT_COMMENT]: Màu sắc của Heading 4 hơi nhạt, nên dùng Mars Orange. -->
##### Heading Level 5
###### Heading Level 6

---

## 2. Blockquotes & Emphasis

> **Design Philosophy**
> 
> "Measure twice, cut once. Avoid temporary hacks; build for the future."
> 
> — *The Elite Architect*

---

## 3. Lists & Checkboxes

### Unordered List
* Setup the development environment
* Install dependencies
* Configure `markdown-it`

### Ordered List
1. Parse the Markdown into tokens
2. Apply the custom `fence` renderer
3. Inject the Premium Wrapper
4. Sync to Webview Panel

### Task List
- [x] Implement Auto-Trigger for `.md` files
- [x] Fix the infinite focus loop bug
- [x] Style the Antigravity UI
- [ ] Implement persistent comment annotations

---

## 4. Tables

| Feature | Status | Description |
| :--- | :---: | :--- |
| **Auto-Open** | ✅ | Opens preview alongside editor |
| **Live Sync** | ✅ | Hot-reloads content instantly |
| **1-Click Copy** | ✅ | Copies prompt directly to clipboard |
| **Comments** | 🚧 | Floating action button (Mockup) |

---

## 5. Premium Prompt Blocks (The Core Feature)

Here are the custom code blocks that should trigger the Antigravity premium wrapper with the **Copy** and **Comment** buttons.

### Standard Text Prompt
```text
[Role]: You are an elite visual director.
[Task]: Generate a prompt for a cinematic product video.
[Style]: Dark, sleek, futuristic, glassmorphism.
```

### Unspecified Block
```
This is a raw block with no language specified.
It should default to "TEXT" in the header.
```

### JavaScript Block
```javascript
// Test event delegation logic
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    
    const wrapper = btn.closest('.premium-code-wrapper');
    const codeNode = wrapper.querySelector('code');
    
    navigator.clipboard.writeText(codeNode.textContent).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '✅ Copied!';
    });
});
```

---

## 6. Links & Images

[Link to PromptAgent Documentation](https://github.com)

![Antigravity UI System](https://raw.githubusercontent.com/microsoft/vscode/main/resources/linux/code.png)

---

**End of Test File.** Open this file in VS Code to trigger the `PromptAgent Preview`.
