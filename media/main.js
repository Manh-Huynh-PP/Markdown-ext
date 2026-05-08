(function () {
    const vscode = acquireVsCodeApi();
    
    // State to hold comments
    let commentsMap = new Map(); // key: blockId, value: { lineStart, lineEnd, text }
    let currentBlock = null;
    
    // UI Elements
    const modalOverlay = document.getElementById('comment-modal-overlay');
    const commentTextarea = document.getElementById('comment-textarea');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const submitBtn = document.getElementById('submit-comments-btn');
    const commentCountSpan = document.getElementById('comment-count');

    function updateSubmitButton() {
        const count = commentsMap.size;
        commentCountSpan.textContent = count;
        if (count > 0) {
            submitBtn.classList.add('active');
        } else {
            submitBtn.classList.remove('active');
        }
    }

    function openModal(blockElement, btnElement) {
        currentBlock = { element: blockElement, btn: btnElement };
        const lineStart = blockElement.getAttribute('data-line-start');
        const lineEnd = blockElement.getAttribute('data-line-end');
        const blockId = `${lineStart}-${lineEnd}`;
        
        // Position modal relative to button
        const rect = btnElement.getBoundingClientRect();
        const modal = modalOverlay.querySelector('.comment-modal');
        
        // Use viewport coordinates (since overlay is fixed)
        let top = rect.top;
        let left = rect.left - 290; // 280px width + 10px gap
        
        // Ensure it doesn't go off-screen
        if (left < 10) left = rect.right + 10;
        if (top + 200 > window.innerHeight) top = window.innerHeight - 210; // Simple overflow check
        
        modal.style.top = `${top}px`;
        modal.style.left = `${left}px`;
        
        // Populate existing comment if any
        if (commentsMap.has(blockId)) {
            commentTextarea.value = commentsMap.get(blockId).text;
        } else {
            commentTextarea.value = '';
        }
        
        modalOverlay.classList.add('active');
        commentTextarea.focus();
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        currentBlock = null;
        commentTextarea.value = '';
    }

    function saveComment() {
        if (!currentBlock) return;
        
        const text = commentTextarea.value.trim();
        const lineStart = currentBlock.element.getAttribute('data-line-start');
        const lineEnd = currentBlock.element.getAttribute('data-line-end');
        const blockId = `${lineStart}-${lineEnd}`;
        
        if (text) {
            commentsMap.set(blockId, { lineStart, lineEnd, text });
            currentBlock.btn.classList.add('has-comment');
        } else {
            commentsMap.delete(blockId);
            currentBlock.btn.classList.remove('has-comment');
        }
        
        updateSubmitButton();
        closeModal();
    }

    // Modal Actions
    modalCancelBtn.addEventListener('click', closeModal);
    modalSaveBtn.addEventListener('click', saveComment);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Submit Action
    submitBtn.addEventListener('click', () => {
        if (commentsMap.size === 0) return;
        
        submitBtn.classList.add('submitting');
        const commentsArray = Array.from(commentsMap.values());
        vscode.postMessage({
            command: 'submitComments',
            comments: commentsArray
        });
        
        // Auto-fallback timeout
        setTimeout(() => {
            submitBtn.classList.remove('submitting');
        }, 5000);
    });

    // Event delegation for dynamically added elements
    document.addEventListener('click', function(event) {
        // Edit Code Logic
        const editBtn = event.target.closest('#edit-code-btn');
        if (editBtn) {
            vscode.postMessage({ command: 'openEditor' });
            return;
        }

        // Copy Raw Logic
        const copyDocBtn = event.target.closest('#copy-doc-btn');
        if (copyDocBtn) {
            vscode.postMessage({ command: 'copyDocument' });
            const originalText = copyDocBtn.innerHTML;
            copyDocBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Copied!
            `;
            setTimeout(() => {
                copyDocBtn.innerHTML = originalText;
            }, 2000);
            return;
        }

        // Copy Button Logic (for code blocks)
        const copyBtn = event.target.closest('.copy-btn');
        if (copyBtn) {
            const wrapper = copyBtn.closest('.premium-code-wrapper');
            const codeElement = wrapper.querySelector('.code-body code') || wrapper.querySelector('code');
            const code = codeElement ? codeElement.innerText : '';
            
            navigator.clipboard.writeText(code).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    Copied!
                `;
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                vscode.postMessage({ command: 'alert', text: 'Copy failed: ' + err.toString() });
            });
            return;
        }

        // Comment Button Logic
        const commentBtn = event.target.closest('.global-comment-btn');
        if (commentBtn) {
            const blockElement = commentBtn.closest('.commentable-block');
            if (blockElement) {
                openModal(blockElement, commentBtn);
            }
            return;
        }

        // Carousel Logic
        const carouselContainer = event.target.closest('.carousel-container');
        if (carouselContainer) {
            const navBtn = event.target.closest('.carousel-nav');
            const dot = event.target.closest('.dot');
            
            if (navBtn || dot) {
                const slides = Array.from(carouselContainer.querySelectorAll('.carousel-slide'));
                const dots = Array.from(carouselContainer.querySelectorAll('.dot'));
                let currentIndex = slides.findIndex(s => s.classList.contains('active'));
                
                if (navBtn) {
                    if (navBtn.classList.contains('prev')) {
                        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    } else {
                        currentIndex = (currentIndex + 1) % slides.length;
                    }
                } else if (dot) {
                    currentIndex = parseInt(dot.getAttribute('data-index'));
                }
                
                // Update UI
                slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
                dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
            }
        }
    });

    function injectAndRestoreComments() {
        document.querySelectorAll('.commentable-block').forEach(block => {
            // Unified outside positioning for all blocks (including code blocks)
            if (!block.querySelector(':scope > .global-comment-btn')) {
                const btn = document.createElement('button');
                btn.className = 'global-comment-btn';
                btn.title = 'Add Comment';
                btn.innerHTML = '<svg class="icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>';
                
                block.appendChild(btn);
            }

            // Restore state
            const targetParent = block;
            const lineStart = block.getAttribute('data-line-start');
            const lineEnd = block.getAttribute('data-line-end');
            const blockId = `${lineStart}-${lineEnd}`;
            if (commentsMap.has(blockId)) {
                const btn = targetParent.querySelector(':scope > .global-comment-btn');
                if (btn) btn.classList.add('has-comment');
            }
        });
    }

    function triggerRenderers() {
        // Trigger Mermaid
        if (window.mermaid) {
            try {
                const isLight = document.body.classList.contains('vscode-light');
                window.mermaid.initialize({ 
                    startOnLoad: false, 
                    theme: isLight ? 'default' : 'dark',
                    securityLevel: 'loose',
                    themeVariables: {
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        primaryColor: '#58a6ff',
                        primaryTextColor: isLight ? '#24292f' : '#c9d1d9',
                        primaryBorderColor: '#30363d',
                        lineColor: '#8b949e',
                        secondaryColor: '#161b22',
                        tertiaryColor: '#0d1117'
                    }
                });
                window.mermaid.run({
                    querySelector: '.mermaid'
                });
            } catch (e) {
                console.error('Mermaid run failed:', e);
            }
        }
        
        // Trigger MathJax if needed (usually automatic but can be forced)
        if (window.MathJax && window.MathJax.typeset) {
            try {
                window.MathJax.typeset();
            } catch (e) {
                console.error('MathJax typeset failed:', e);
            }
        }
    }

    // Run on initial load
    injectAndRestoreComments();
    triggerRenderers();

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'update':
                const contentArea = document.getElementById('content-area');
                if (contentArea) {
                    contentArea.innerHTML = message.html;
                    // Re-apply 'has-comment' classes based on commentsMap and inject comment buttons
                    injectAndRestoreComments();
                    triggerRenderers();
                }
                break;
            case 'submissionComplete':
                submitBtn.classList.remove('submitting');
                // Clear state after successful submit
                commentsMap.clear();
                updateSubmitButton();
                document.querySelectorAll('.global-comment-btn').forEach(btn => {
                    btn.classList.remove('has-comment');
                });
                break;
        }
    });
}());
