# AeroTools

AeroTools is AeroFTP's integrated development panel, combining a code editor, SSH terminal, and AI assistant in a tabbed interface at the bottom of the application window.

## Panel Layout

The AeroTools panel contains four tabs:

| Tab | Component | Description |
|-----|-----------|-------------|
| **AeroTools** | Security Toolkit | Hashing, encryption, and password generation (Cyber theme only) |
| **Editor** | Monaco Editor | VS Code engine with syntax highlighting for 50+ languages |
| **Terminal** | SSH Terminal | Remote shell with 8 terminal themes and multiple tabs |
| **AI Agent** | AeroAgent | AI assistant with 52 tools across local files and the 7 transport protocols + 20+ native provider integrations |

The panel is resizable by dragging the separator between the file browser and the tools area. Each tab maintains its own state independently.

## Code Editor

The code editor is powered by **Monaco** (the same engine used by VS Code), providing a professional editing experience for remote files.

- **Syntax highlighting** for 50+ languages (JavaScript, TypeScript, Python, Rust, Go, HTML, CSS, JSON, YAML, etc.)
- **4 editor themes** matching the app themes: Light, Dark, Tokyo Night, Cyber
- **Remote file editing**: right-click any file and choose "Edit" to open it in the editor. Changes are saved back to the remote server automatically.
- **Bidirectional sync** with AeroAgent: edits made by the AI agent are reflected in the editor in real time, and vice versa.

For full details, see the [Code Editor documentation](code-editor.md).

## Terminal

The integrated SSH terminal provides a remote shell directly within AeroFTP.

- **8 terminal themes** that auto-sync with the app theme
- **Multiple tabs** for concurrent sessions
- **xterm.js** based rendering with WebGL acceleration
- **Full terminal emulation** including colors, cursor positioning, and scrollback

For full details, see the [Terminal documentation](terminal.md).

## AeroAgent

The AI-powered assistant with **52 built-in tools** that work across local files and the AeroFTP provider backends (7 transports + 20+ native providers). Supports **24 AI providers** including OpenAI, Anthropic, Google Gemini, NVIDIA NIM, Z.AI (GLM), Yi, Hyperbolic, Novita, Cohere, Cerebras, SambaNova, Fireworks, and local models via Ollama.

For full details, see the [AeroAgent documentation](aeroagent.md) and [AeroAgent Test Results](aeroagent-tests.md).

## Security Toolkit (Cyber Theme)

The Security Toolkit tab is available exclusively when the **Cyber** theme is active. It provides three modules for hashing, encryption, and password generation -- all running locally via Rust commands with zero network access.

> **Note:** Switch themes via the theme toggle in the titlebar (cycle: Auto, Light, Dark, Tokyo Night, Cyber).

### Hash Forge

Compute and compare cryptographic hashes for files and text.

| Algorithm | Output Size | Speed | Use Case |
| --------- | ----------- | ----- | -------- |
| MD5 | 128-bit (32 hex) | Very fast | Legacy checksums, non-security verification |
| SHA-1 | 160-bit (40 hex) | Fast | Legacy checksums, Git object IDs |
| SHA-256 | 256-bit (64 hex) | Moderate | File integrity, digital signatures |
| SHA-512 | 512-bit (128 hex) | Moderate | High-security integrity |
| BLAKE3 | 256-bit (64 hex) | Very fast | Modern hashing, faster than SHA-256 |

Operations: hash text, hash file (streaming for large files), compare hashes (constant-time comparison).

### CryptoLab

Encrypt and decrypt text using authenticated encryption:

| Algorithm | Key | Nonce | Auth Tag | Notes |
| --------- | --- | ----- | -------- | ----- |
| AES-256-GCM | 256-bit | 96-bit | 128-bit | Hardware-accelerated (AES-NI) |
| ChaCha20-Poly1305 | 256-bit | 96-bit | 128-bit | Constant-time, no hardware dependency |

Enter a password, type plaintext, and click Encrypt. The ciphertext is Base64-encoded with an authentication tag that detects tampering.

> For file encryption, use [AeroVault](aerovault.md) which provides full encrypted containers with key wrapping and cascade encryption.

### Password Forge

Generate cryptographically secure passwords and passphrases using the OS CSPRNG (`OsRng` in Rust):

- **Random passwords**: 8-128 characters, configurable character sets, entropy display in bits
- **BIP-39 passphrases**: 4-24 words from the BIP-39 English word list (2048 words, ~11 bits per word)
- **Entropy calculator**: paste any string to calculate its Shannon entropy
