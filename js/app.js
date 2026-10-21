/**
 * AntiAgent Main Application Orchestrator
 * Wires mobile touch interface, voice recognition, slash commands,
 * virtual file viewer, artifacts drawer, and settings.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Core Engine
    const agent = new window.AntiAgentEngine();
    window.antiAgent = agent;

    // DOM Elements
    const chatContainer = document.getElementById('chatContainer');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const slashBtn = document.getElementById('slashBtn');
    const slashMenu = document.getElementById('slashMenu');

    // Drawers & Modals
    const artifactsDrawer = document.getElementById('artifactsDrawer');
    const artifactsBtn = document.getElementById('artifactsBtn');
    const closeArtifactsDrawer = document.getElementById('closeArtifactsDrawer');
    const artifactsList = document.getElementById('artifactsList');

    const filesDrawer = document.getElementById('filesDrawer');
    const filesBtn = document.getElementById('filesBtn');
    const closeFilesDrawer = document.getElementById('closeFilesDrawer');
    const filesList = document.getElementById('filesList');

    const settingsDrawer = document.getElementById('settingsDrawer');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsDrawer = document.getElementById('closeSettingsDrawer');

    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const modelSelect = document.getElementById('modelSelect');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const installAppBtn = document.getElementById('installAppBtn');

    // Artifact Viewer Modal
    const artifactModal = document.getElementById('artifactModal');
    const closeArtifactModal = document.getElementById('closeArtifactModal');
    const copyArtifactBtn = document.getElementById('copyArtifactBtn');
    const artifactTabPreview = document.getElementById('artifactTabPreview');
    const artifactTabRaw = document.getElementById('artifactTabRaw');
    const artifactModalBody = document.getElementById('artifactModalBody');
    const artifactModalRaw = document.getElementById('artifactModalRaw');

    // Toast Container
    const toastContainer = document.getElementById('toastContainer');

    // Global Toast Function
    window.showToast = (msg, actionCallback = null) => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'glass-card border border-cyan-500/30 text-white px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-lg shadow-cyan-950/40 animate-slide-up pointer-events-auto';
        
        const textSpan = document.createElement('span');
        textSpan.innerHTML = msg;
        toast.appendChild(textSpan);

        if (actionCallback) {
            const btn = document.createElement('button');
            btn.className = 'text-cyan-400 font-bold hover:underline ml-2';
            btn.textContent = 'View';
            btn.onclick = () => {
                actionCallback();
                toast.remove();
            };
            toast.appendChild(btn);
        }

        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    // PWA Install Prompt Handler
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installAppBtn) installAppBtn.classList.remove('hidden');
    });

    if (installAppBtn) {
        installAppBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                if (choice.outcome === 'accepted') {
                    window.showToast("🚀 AntiAgent installed successfully!");
                }
                deferredPrompt = null;
                installAppBtn.classList.add('hidden');
            } else {
                window.showToast("📱 Use your browser's 'Add to Home Screen' option.");
            }
        });
    }

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        toggleSendState();
    });

    function toggleSendState() {
        const val = chatInput.value.trim();
        if (val.length > 0) {
            sendBtn.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            sendBtn.classList.add('opacity-50', 'pointer-events-none');
        }
    }

    // Voice recognition (Speech to Text)
    let recognition = null;
    let isRecording = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN, en-US'; // Supports Hindi & English

        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add('bg-red-500/20', 'text-red-400', 'border-red-500/50', 'animate-pulse');
            window.showToast("🎙️ Listening... Speak now");
        };

        recognition.onresult = (e) => {
            let transcript = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                transcript += e.results[i][0].transcript;
            }
            chatInput.value = transcript;
            chatInput.dispatchEvent(new Event('input'));
        };

        recognition.onerror = (e) => {
            console.warn('Voice error:', e);
            stopRecording();
        };

        recognition.onend = () => {
            stopRecording();
        };
    } else {
        micBtn.style.display = 'none';
    }

    function stopRecording() {
        isRecording = false;
        micBtn.classList.remove('bg-red-500/20', 'text-red-400', 'border-red-500/50', 'animate-pulse');
    }

    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (isRecording) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (err) {
                console.error(err);
            }
        }
    });

    // Slash Commands Handling
    slashBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        slashMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!slashMenu.contains(e.target) && e.target !== slashBtn) {
            slashMenu.classList.add('hidden');
        }
    });

    document.querySelectorAll('.slash-cmd-item').forEach(item => {
        item.addEventListener('click', () => {
            const cmd = item.getAttribute('data-cmd');
            chatInput.value = cmd + ' ';
            chatInput.focus();
            slashMenu.classList.add('hidden');
            toggleSendState();
        });
    });

    // Send Message Trigger
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text || agent.isProcessing) return;

        chatInput.value = '';
        chatInput.style.height = 'auto';
        toggleSendState();

        // Append User Message to UI
        appendUserMessage(text);

        // Prepare Agent Message Container
        const agentContainer = createAgentMessageContainer();
        const thoughtBox = agentContainer.querySelector('.thought-box');
        const thoughtContent = agentContainer.querySelector('.thought-content');
        const toolsContainer = agentContainer.querySelector('.tools-container');
        const textResponse = agentContainer.querySelector('.text-response');

        scrollToBottom();

        // Process message through Antigravity agent engine
        await agent.processUserMessage(text, {
            onThought: (thoughtText) => {
                thoughtBox.classList.remove('hidden');
                thoughtContent.textContent = thoughtText;
                scrollToBottom();
            },
            onToolStart: (toolName, toolArgs) => {
                const card = createToolCard(toolName, toolArgs);
                toolsContainer.appendChild(card);
                scrollToBottom();
            },
            onToolEnd: (toolName, toolResult) => {
                const card = toolsContainer.lastElementChild;
                if (card) {
                    const badge = card.querySelector('.tool-status-badge');
                    if (badge) {
                        badge.className = 'tool-status-badge text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30';
                        badge.textContent = 'DONE';
                    }
                    const outputArea = card.querySelector('.tool-output');
                    if (outputArea) {
                        outputArea.textContent = typeof toolResult === 'object' ? JSON.stringify(toolResult, null, 2) : toolResult;
                    }
                }
                scrollToBottom();
            },
            onTextChunk: (accumulatedText) => {
                const parsed = window.marked ? window.marked.parse(accumulatedText) : accumulatedText;
                textResponse.innerHTML = parsed;
                // Re-bind file/artifact links inside markdown
                bindContentLinks(textResponse);
                scrollToBottom();
            },
            onComplete: () => {
                const spinner = agentContainer.querySelector('.agent-spinner');
                if (spinner) spinner.remove();
                scrollToBottom();
            },
            onError: (errMsg) => {
                textResponse.innerHTML = `<div class="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">⚠️ Error: ${errMsg}</div>`;
                scrollToBottom();
            }
        });
    }

    function appendUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'flex justify-end mb-4 animate-fade-in';
        div.innerHTML = `
            <div class="max-w-[85%] bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 text-cyan-50 rounded-2xl rounded-tr-sm px-4 py-3 shadow-md backdrop-blur-md text-sm leading-relaxed">
                <div class="whitespace-pre-wrap">${escapeHtml(text)}</div>
            </div>
        `;
        chatContainer.appendChild(div);
    }

    function createAgentMessageContainer() {
        const div = document.createElement('div');
        div.className = 'flex flex-col gap-2.5 mb-6 animate-fade-in';
        div.innerHTML = `
            <div class="flex items-center gap-2 mb-1 text-xs text-cyan-400 font-medium">
                <div class="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-[10px]">
                    🪐
                </div>
                <span>AntiAgent</span>
                <div class="agent-spinner w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Chain-of-Thought Accordion -->
            <details class="thought-box hidden group bg-[#060a14]/80 border border-cyan-500/20 rounded-xl overflow-hidden transition-all text-xs">
                <summary class="flex items-center justify-between px-3.5 py-2.5 cursor-pointer bg-cyan-950/30 hover:bg-cyan-900/30 text-cyan-300 font-medium select-none">
                    <span class="flex items-center gap-2">
                        <span>🧠</span>
                        <span>Chain-of-Thought Reasoning</span>
                    </span>
                    <span class="text-[10px] text-cyan-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div class="p-3 text-cyan-200/80 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border-t border-cyan-500/10 thought-content"></div>
            </details>

            <!-- Tools Execution Container -->
            <div class="tools-container flex flex-col gap-2"></div>

            <!-- Text Response Body -->
            <div class="text-response prose prose-invert max-w-none text-sm text-slate-100 bg-[#0d1424]/60 border border-white/5 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm leading-relaxed"></div>
        `;
        chatContainer.appendChild(div);
        return div;
    }

    function createToolCard(toolName, args) {
        const card = document.createElement('div');
        card.className = 'tool-card bg-[#080d1a] border border-cyan-500/30 rounded-xl p-3 text-xs shadow-md animate-slide-up';
        
        let toolIcon = '🛠️';
        if (toolName === 'search_web') toolIcon = '🔍';
        if (toolName === 'read_file') toolIcon = '📖';
        if (toolName === 'write_file') toolIcon = '✍️';
        if (toolName === 'edit_file') toolIcon = '✂️';
        if (toolName === 'run_command') toolIcon = '⚡';
        if (toolName === 'create_artifact') toolIcon = '📦';

        card.innerHTML = `
            <div class="flex items-center justify-between gap-2 mb-1.5">
                <div class="flex items-center gap-2 font-mono font-semibold text-cyan-300">
                    <span>${toolIcon}</span>
                    <span>${toolName}</span>
                </div>
                <div class="tool-status-badge text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> RUNNING
                </div>
            </div>
            <div class="text-[11px] text-slate-400 font-mono mb-2 truncate bg-black/30 px-2 py-1 rounded">
                ${escapeHtml(JSON.stringify(args))}
            </div>
            <details class="text-[11px] text-slate-400">
                <summary class="cursor-pointer text-cyan-400/80 hover:text-cyan-300">View Execution Payload</summary>
                <pre class="tool-output mt-2 p-2 bg-black/60 rounded text-[10px] text-cyan-200 overflow-x-auto font-mono whitespace-pre-wrap max-h-40">Running...</pre>
            </details>
        `;
        return card;
    }

    function bindContentLinks(container) {
        // Artifact links: artifact://art_id
        container.querySelectorAll('a[href^="artifact://"]').forEach(link => {
            const artId = link.getAttribute('href').replace('artifact://', '');
            link.className = 'inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md text-xs no-underline hover:bg-cyan-500/30 cursor-pointer font-medium';
            link.innerHTML = `📦 ${link.textContent}`;
            link.onclick = (e) => {
                e.preventDefault();
                window.artifactManager.openViewer(artId);
            };
        });

        // File links: file:///workspace/...
        container.querySelectorAll('a[href^="file://"]').forEach(link => {
            const filePath = link.getAttribute('href').replace('file://', '');
            link.className = 'inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md text-xs no-underline hover:bg-blue-500/30 cursor-pointer font-mono';
            link.innerHTML = `📄 ${link.textContent}`;
            link.onclick = (e) => {
                e.preventDefault();
                try {
                    const content = window.vfs.readFile(filePath);
                    window.artifactManager.openViewer(window.artifactManager.create(
                        filePath.split('/').pop(),
                        'code',
                        content,
                        `Workspace file: ${filePath}`
                    ).id);
                } catch (err) {
                    window.showToast(`File not found: ${filePath}`);
                }
            };
        });
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Artifacts Drawer Controls
    function renderArtifactsList() {
        const list = window.artifactManager.getAll();
        artifactsList.innerHTML = '';
        if (list.length === 0) {
            artifactsList.innerHTML = `<div class="text-xs text-slate-500 text-center py-8">No artifacts yet. Ask AntiAgent to create a plan, widget or code file!</div>`;
            return;
        }

        list.forEach(art => {
            const item = document.createElement('div');
            item.className = 'glass-card p-3 rounded-xl border border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col gap-1';
            item.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-cyan-200 truncate">${escapeHtml(art.title)}</span>
                    <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">${art.type}</span>
                </div>
                <div class="text-[11px] text-slate-400 line-clamp-2">${escapeHtml(art.summary)}</div>
                <div class="text-[9px] text-slate-500 mt-1">${new Date(art.createdAt).toLocaleTimeString()}</div>
            `;
            item.onclick = () => {
                artifactsDrawer.classList.add('translate-x-full');
                window.artifactManager.openViewer(art.id);
            };
            artifactsList.appendChild(item);
        });
    }

    artifactsBtn.addEventListener('click', () => {
        renderArtifactsList();
        artifactsDrawer.classList.remove('translate-x-full');
    });
    closeArtifactsDrawer.addEventListener('click', () => {
        artifactsDrawer.classList.add('translate-x-full');
    });

    // Files Drawer Controls
    function renderFilesList() {
        const files = window.vfs.listFiles();
        filesList.innerHTML = '';
        if (files.length === 0) {
            filesList.innerHTML = `<div class="text-xs text-slate-500 text-center py-8">Workspace empty.</div>`;
            return;
        }

        files.forEach(f => {
            const content = window.vfs.getAll()[f] || '';
            const item = document.createElement('div');
            item.className = 'glass-card p-3 rounded-xl border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer flex items-center justify-between';
            item.innerHTML = `
                <div class="flex items-center gap-2 overflow-hidden">
                    <span class="text-blue-400">📄</span>
                    <span class="text-xs font-mono text-slate-200 truncate">${f}</span>
                </div>
                <span class="text-[10px] text-slate-500 font-mono">${content.length} B</span>
            `;
            item.onclick = () => {
                filesDrawer.classList.add('-translate-x-full');
                window.artifactManager.openViewer(window.artifactManager.create(
                    f.split('/').pop(),
                    'code',
                    content,
                    `Workspace file: ${f}`
                ).id);
            };
            filesList.appendChild(item);
        });
    }

    filesBtn.addEventListener('click', () => {
        renderFilesList();
        filesDrawer.classList.remove('-translate-x-full');
    });
    closeFilesDrawer.addEventListener('click', () => {
        filesDrawer.classList.add('-translate-x-full');
    });

    // Settings Drawer Controls
    settingsBtn.addEventListener('click', () => {
        apiKeyInput.value = agent.apiKey;
        modelSelect.value = agent.selectedModel;
        settingsDrawer.classList.remove('translate-y-full');
    });
    closeSettingsDrawer.addEventListener('click', () => {
        settingsDrawer.classList.add('translate-y-full');
    });

    saveApiKeyBtn.addEventListener('click', () => {
        agent.setApiKey(apiKeyInput.value.trim());
        agent.setModel(modelSelect.value);
        settingsDrawer.classList.add('translate-y-full');
        window.showToast("✅ Settings updated successfully!");
    });

    clearHistoryBtn.addEventListener('click', () => {
        agent.clearHistory();
        chatContainer.innerHTML = '';
        settingsDrawer.classList.add('translate-y-full');
        window.showToast("🧹 Chat history cleared!");
    });

    // Artifact Modal Tab Switching & Copy
    artifactTabPreview.addEventListener('click', () => {
        artifactTabPreview.className = 'px-3 py-1 text-xs rounded-lg bg-cyan-600 text-white font-medium';
        artifactTabRaw.className = 'px-3 py-1 text-xs rounded-lg text-slate-400 hover:text-white font-medium';
        artifactModalBody.classList.remove('hidden');
        artifactModalRaw.classList.add('hidden');
    });

    artifactTabRaw.addEventListener('click', () => {
        artifactTabRaw.className = 'px-3 py-1 text-xs rounded-lg bg-cyan-600 text-white font-medium';
        artifactTabPreview.className = 'px-3 py-1 text-xs rounded-lg text-slate-400 hover:text-white font-medium';
        artifactModalBody.classList.add('hidden');
        artifactModalRaw.classList.remove('hidden');
    });

    closeArtifactModal.addEventListener('click', () => {
        window.artifactManager.closeViewer();
    });

    copyArtifactBtn.addEventListener('click', async () => {
        const text = artifactModalRaw.value;
        try {
            await navigator.clipboard.writeText(text);
            window.showToast("📋 Artifact copied to clipboard!");
        } catch (e) {
            window.showToast("Failed to copy to clipboard.");
        }
    });

    // Initial Badge update
    window.artifactManager.updateBadge();

    // Helper HTML Escape
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return (text || '').replace(/[&<>"']/g, m => map[m]);
    }
});
