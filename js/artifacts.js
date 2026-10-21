/**
 * AntiAgent Artifacts Engine
 * Manages sidecars, interactive HTML widgets, markdown reports, and code blocks
 * Provides sidecar drawer and live sandbox iframe preview for mobile.
 */

class ArtifactManager {
    constructor() {
        this.storageKey = 'antiagent_artifacts_v1';
        this.currentArtifactId = null;
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            // Seed sample welcome artifact
            const seed = [
                {
                    id: 'art_welcome_01',
                    title: 'System Architecture & Capabilities',
                    type: 'markdown',
                    summary: 'Complete technical breakdown of the AntiAgent mobile engine, tool execution runtime, and autonomy loop.',
                    content: `# AntiAgent Architecture Matrix 🚀\n\nAntiAgent brings **Google Antigravity autonomous pairing** directly to mobile screens.\n\n### Core System Specifications\n\n| Subsystem | Mobile Implementation | Status |\n| :--- | :--- | :--- |\n| **Engine** | Gemini 2.5 Flash / Pro + Multi-turn Function Calling | 🟢 Active |\n| **Reasoning** | Collapsible Chain-of-Thought (CoT) Accordion | 🟢 Active |\n| **Tools** | Web Search, VFS Read/Write/Edit, Bash Simulator | 🟢 Active |\n| **Artifacts** | Sidecar Markdown, Code Diffs & Live HTML Iframe | 🟢 Active |\n| **Audio** | Web Speech API Voice-to-Text & Transcription | 🟢 Active |\n| **Platform** | PWA Standalone (iOS & Android) with Offline SW | 🟢 Ready |\n\n> [!TIP]\n> Tap the **Slash (/)** button in the chat input or type \`/plan\`, \`/goal\`, \`/code\` or \`/search\` to instantly trigger specialized agent behaviors!`,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'art_calculator_interactive',
                    title: 'Interactive Mobile Matrix Visualizer',
                    type: 'html_app',
                    summary: 'Self-contained interactive Canvas widget demonstrating Antigravity interactive Generative UI on mobile.',
                    content: `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; background: #070a12; color: #a5f3fc; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  canvas { border-radius: 16px; box-shadow: 0 0 30px rgba(56, 189, 248, 0.2); }
  .controls { margin-top: 14px; display: flex; gap: 8px; }
  button { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }
  button:active { transform: scale(0.96); }
</style>
</head>
<body>
  <canvas id="c" width="320" height="260"></canvas>
  <div class="controls">
    <button onclick="speed = speed === 1 ? 3 : 1">Toggle Velocity</button>
    <button onclick="toggleColor()">Cosmic Color</button>
  </div>
  <script>
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    let speed = 1;
    let hue = 190;
    const particles = Array.from({length: 45}, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: Math.random() * 2.5 + 1.5
    }));
    function toggleColor() { hue = (hue + 75) % 360; }
    function loop() {
      ctx.fillStyle = 'rgba(7, 10, 18, 0.25)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = 'hsla(' + hue + ', 85%, 65%, 0.25)';
      ctx.fillStyle = 'hsl(' + hue + ', 95%, 75%)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveAll(seed);
        }
    }

    getAll() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (e) {
            return [];
        }
    }

    saveAll(arr) {
        localStorage.setItem(this.storageKey, JSON.stringify(arr));
        this.updateBadge();
        window.dispatchEvent(new CustomEvent('artifacts-updated', { detail: { count: arr.length } }));
    }

    create(title, type, content, summary) {
        const artifacts = this.getAll();
        const id = 'art_' + Date.now();
        const newArt = {
            id,
            title: title || 'Untitled Artifact',
            type: type || 'markdown',
            summary: summary || 'Autonomous system generated artifact',
            content: content || '',
            createdAt: new Date().toISOString()
        };
        artifacts.unshift(newArt);
        this.saveAll(artifacts);
        
        // Notify UI
        this.notifyUserNewArtifact(newArt);
        return {
            status: "SUCCESS",
            id: newArt.id,
            title: newArt.title,
            type: newArt.type,
            summary: newArt.summary,
            pillLink: `artifact://${newArt.id}`
        };
    }

    getById(id) {
        const all = this.getAll();
        return all.find(a => a.id === id) || null;
    }

    delete(id) {
        let all = this.getAll();
        all = all.filter(a => a.id !== id);
        this.saveAll(all);
        if (this.currentArtifactId === id) {
            this.currentArtifactId = null;
            this.closeViewer();
        }
    }

    updateBadge() {
        const badge = document.getElementById('artifactCountBadge');
        if (badge) {
            const count = this.getAll().length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    }

    notifyUserNewArtifact(art) {
        // Trigger subtle toast notification
        if (window.showToast) {
            window.showToast(`✨ Artifact Created: "${art.title}"`, () => {
                this.openViewer(art.id);
            });
        }
    }

    openViewer(artifactId) {
        const art = this.getById(artifactId);
        if (!art) return;

        this.currentArtifactId = artifactId;
        const modal = document.getElementById('artifactModal');
        const titleEl = document.getElementById('artifactModalTitle');
        const typeEl = document.getElementById('artifactModalType');
        const summaryEl = document.getElementById('artifactModalSummary');
        const bodyEl = document.getElementById('artifactModalBody');
        const rawEl = document.getElementById('artifactModalRaw');

        if (!modal) return;

        titleEl.textContent = art.title;
        typeEl.textContent = art.type.toUpperCase();
        summaryEl.textContent = art.summary;

        // Render preview content
        if (art.type === 'html_app') {
            bodyEl.innerHTML = `<iframe class="w-full h-[65vh] md:h-[500px] border-0 rounded-xl bg-[#070a12]" sandbox="allow-scripts allow-modals" srcdoc="${this.escapeHtmlAttr(art.content)}"></iframe>`;
        } else if (art.type === 'markdown') {
            const parsed = window.marked ? window.marked.parse(art.content) : `<pre>${art.content}</pre>`;
            bodyEl.innerHTML = `<div class="prose prose-invert max-w-none text-sm leading-relaxed">${parsed}</div>`;
        } else {
            // Code
            bodyEl.innerHTML = `<pre class="rounded-xl overflow-x-auto p-4 bg-[#0a0f1d] border border-cyan-500/20 text-xs font-mono text-cyan-200"><code>${this.escapeHtml(art.content)}</code></pre>`;
        }

        if (rawEl) {
            rawEl.value = art.content;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    closeViewer() {
        const modal = document.getElementById('artifactModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return (text || '').replace(/[&<>"']/g, m => map[m]);
    }

    escapeHtmlAttr(text) {
        return (text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }
}

window.artifactManager = new ArtifactManager();
