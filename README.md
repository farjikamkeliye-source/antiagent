# 🪐 AntiAgent — Open Source Autonomous AI Mobile Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Platform: Mobile & PWA](https://img.shields.io/badge/Platform-Mobile%20%2F%20PWA-0284c7.svg)](#features)
[![Engine: Google Antigravity](https://img.shields.io/badge/Architecture-Google%20Antigravity-6366f1.svg)](#architecture)
[![Model: Gemini 2.5 Flash / Pro](https://img.shields.io/badge/Model-Gemini%202.5-38bdf8.svg)](#models)

**AntiAgent** is a complete, open-source mobile client that replicates **Google Deepmind's Antigravity** autonomous AI pair programming interface on mobile smartphones and tablets.

Experience autonomous multi-turn tool calling, step-by-step Chain-of-Thought (CoT) reasoning, interactive sidecar artifacts, and terminal command execution right from your mobile browser or as an installed native-like PWA.

---

## ✨ Key Features

- 🧠 **Chain-of-Thought (CoT) Deep Reasoning**: Real-time collapsible reasoning accordion letting you inspect the agent's internal monologue and logic before actions are performed.
- 🛠️ **Autonomous Multi-Turn Tool Calling**:
  - `search_web`: Live internet queries via DuckDuckGo Instant Answer API.
  - `read_file`, `write_file`, `edit_file`: Full workspace manipulation on persistent Virtual File System (`LocalStorage`).
  - `run_command`: Sandbox terminal executor for `ls`, `cat`, `python`, `node`, `git`, and shell utilities.
  - `create_artifact`: Generates sidecars, documentation, and live web apps.
- 📦 **Interactive Artifacts & Generative UI**:
  - Sidecar drawer with real-time badge counters.
  - Live interactive HTML/Canvas widgets previewed in an isolated sandbox `iframe`.
  - Full-featured Markdown and syntax-highlighted code viewer.
- 🎙️ **Voice-to-Text Recognition**: Built-in Web Speech API microphone integration with bilingual (Hindi & English) speech recognition.
- ⚡ **Slash Commands Hub**:
  - `/plan`: Step-by-step architecture blueprinting.
  - `/code`: Code generation, file writing, and sandbox test execution.
  - `/search`: Real-time web knowledge retrieval.
  - `/goal`: Persistent autonomous perseverance loop.
  - `/compact`: Free up context window memory.
- 📲 **Installable Progressive Web App (PWA)**:
  - Add to Home Screen on Android and iOS.
  - Standalone fullscreen display (`display: standalone`).
  - Offline asset caching with Service Worker (`sw.js`).
- 🔑 **Dual Execution Modes**:
  - **Zero-Config Simulator Mode**: Works immediately offline without any setup or API keys.
  - **Live Gemini API Mode**: Plug in your free Google AI Studio key to unlock real `gemini-2.5-flash`, `gemini-2.0-flash`, or `gemini-2.5-pro` multi-turn function calling.

---

## 📱 Mobile Architecture Preview

```
┌────────────────────────────────────────────────────────┐
│ [📁 Files]      🪐 AntiAgent [2.5 FLASH]   [📦 2] [⚙️]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  User: "/plan Create a mobile calculator"              │
│                                                        │
│  AntiAgent:                                            │
│  ▼ 🧠 Chain-of-Thought Reasoning (1.2s)                │
│    Examining mobile requirements...                    │
│    Setting responsive constraints in VFS...            │
│                                                        │
│  [🛠️ create_artifact: Execution Blueprint]    [DONE]   │
│                                                        │
│  Here is the architecture plan:                        │
│  📦 [Execution Blueprint](artifact://art_01)           │
│                                                        │
├────────────────────────────────────────────────────────┤
│ [/] [ Ask AntiAgent or type / commands... ] [🎙️] [🚀]  │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### 1. Run Locally (Fastest)

Clone or navigate to the directory and start any local HTTP server:

```bash
# Python 3
python -m http.server 8080

# Or with Node.js
npx serve .
```

Then open `http://localhost:8080` in your desktop or mobile browser.

### 2. Open on Mobile Device

Connect your phone to the same Wi-Fi network and browse to `http://<YOUR_PC_IP>:8080`, or deploy directly to **GitHub Pages** (free 1-click hosting).

### 3. Install as Native App (PWA)

1. Open the website on Chrome (Android) or Safari (iOS).
2. Tap the browser menu `⋮` and select **"Add to Home Screen"** or tap the **"Install AntiAgent"** button in Settings (⚙️).
3. The app is now installed on your home screen with a dedicated app icon and full offline support!

---

## ⚙️ Configuration & API Key

To activate live AI responses with real Google Gemini models:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Tap the **Settings (⚙️)** icon in the top right corner of AntiAgent.
3. Paste your key into **Gemini API Key** and select your model (`gemini-2.5-flash` recommended).
4. Tap **Save Configuration**.

---

## 📂 Project Structure

```
AntiAgent/
├── index.html              # Main mobile shell with drawer & dock layout
├── manifest.json           # PWA standalone manifest configuration
├── sw.js                   # Service Worker for offline asset caching
├── css/
│   └── style.css           # Cosmic glassmorphism & safe-area styles
├── js/
│   ├── tools.js            # Virtual File System (VFS) & Tool Execution Engine
│   ├── artifacts.js        # Artifacts Sidecar manager & Iframe sandbox
│   ├── agent.js            # Antigravity Brain (Gemini API & Autonomous loop)
│   └── app.js              # UI controller, speech mic & slash commands
├── assets/
│   └── icons/              # 192x192, 512x512 and Favicon PWA icons
├── push_to_github.py       # Automated GitHub uploader script
├── push_to_github.bat      # 1-click Windows batch pusher
├── LICENSE                 # MIT License
└── README.md               # Complete documentation
```

---

## 🤝 Contributing & License

Contributions, feature requests, and PRs are welcome!
Licensed under the open-source **MIT License** — feel free to fork, customize, and build on top of AntiAgent.
