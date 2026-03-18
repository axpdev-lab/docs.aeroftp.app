# Migration Plan: mdbook → VitePress

## Why VitePress

- Full theme control (CSS/Vue components, no fighting mdbook built-in styles)
- Dark/light toggle that actually works across all elements
- Built-in search (local or Algolia)
- Sidebar auto-generation from file structure
- Code block features (line highlighting, groups, copy button)
- Vue components in markdown (interactive examples, tabs, badges)
- SEO: meta tags, sitemap, Open Graph
- Same static output, same GitHub Pages deploy

## Architecture

```
docs.aeroftp.app/
├── .vitepress/
│   ├── config.ts          # Site config, nav, sidebar
│   ├── theme/
│   │   ├── index.ts       # Theme entry
│   │   ├── custom.css     # AeroFTP brand colors
│   │   └── components/    # Custom Vue components (ProtocolBadge, FeatureCard)
│   └── cache/
├── public/
│   ├── favicon.svg
│   ├── logo.svg
│   └── images/            # Screenshots (moved from src/images/)
├── index.md               # Home page (hero + features grid)
├── getting-started/
│   ├── installation.md
│   ├── linux.md
│   ├── windows.md
│   ├── macos.md
│   ├── quick-start.md
│   └── interface.md
├── protocols/
│   ├── overview.md
│   ├── ftp.md
│   ├── sftp.md
│   ├── ...
│   └── github.md
├── features/
│   ├── aerosync.md
│   ├── aerovault.md
│   ├── aeroagent.md
│   ├── aeroagent-tests.md
│   ├── ...
│   └── terminal.md
├── cli/
│   ├── installation.md
│   ├── commands.md
│   ├── batch-scripting.md
│   └── examples.md
├── security/
│   ├── encryption.md
│   ├── credentials.md
│   └── totp.md
├── contributing/
│   ├── build.md
│   └── architecture.md
├── about.md
├── package.json
└── .gitignore
```

## Migration Steps

### Phase 1: Setup (30 min)

1. Install VitePress in the repo:
   ```bash
   npm init -y
   npm install -D vitepress
   ```

2. Create `.vitepress/config.ts`:
   ```ts
   export default {
     title: 'AeroFTP Documentation',
     description: 'Documentation for AeroFTP - Multi-protocol file manager',
     base: '/',
     head: [
       ['link', { rel: 'icon', href: '/favicon.svg' }],
       ['meta', { property: 'og:title', content: 'AeroFTP Docs' }],
       ['meta', { property: 'og:description', content: 'Documentation for AeroFTP' }],
       ['meta', { property: 'og:image', content: '/logo.svg' }],
     ],
     themeConfig: {
       logo: '/logo.svg',
       siteTitle: 'AeroFTP',
       nav: [
         { text: 'Guide', link: '/getting-started/installation' },
         { text: 'Protocols', link: '/protocols/overview' },
         { text: 'Features', link: '/features/aerosync' },
         { text: 'CLI', link: '/cli/installation' },
         { text: 'GitHub', link: 'https://github.com/axpnet/aeroftp' },
       ],
       sidebar: { /* auto-generated from file structure */ },
       socialLinks: [
         { icon: 'github', link: 'https://github.com/axpnet/aeroftp' },
       ],
       editLink: {
         pattern: 'https://github.com/axpnet/docs.aeroftp.app/edit/main/:path',
         text: 'Suggest changes',
       },
       search: { provider: 'local' },
       footer: {
         message: 'Released under the GPL-3.0 License.',
         copyright: 'Copyright 2024-2026 AxpDev',
       },
     },
   }
   ```

3. Create custom theme with AeroFTP brand:
   ```css
   /* .vitepress/theme/custom.css */
   :root {
     --vp-c-brand-1: #3b82f6;
     --vp-c-brand-2: #60a5fa;
     --vp-c-brand-3: #93c5fd;
     --vp-home-hero-name-color: transparent;
     --vp-home-hero-name-background: linear-gradient(135deg, #3b82f6, #8b5cf6);
   }

   .dark {
     --vp-c-bg: #0d1117;
     --vp-c-bg-soft: #161b22;
     --vp-sidebar-bg-color: #0f1629;
   }
   ```

### Phase 2: Content Migration (1-2 hours)

1. Move all `.md` files from `src/` to root (VitePress uses root, not src/)
2. Remove mdbook-specific syntax:
   - `<!-- SCREENSHOT: ... -->` comments → keep as-is (harmless)
   - SUMMARY.md → delete (VitePress uses config.ts sidebar)
3. Move `src/images/` → `public/images/`
4. Update image paths in all .md files: `/images/` → `/images/`
5. Move `src/favicon.svg`, `src/logo.svg` → `public/`
6. Add frontmatter to index.md for hero section:
   ```yaml
   ---
   layout: home
   hero:
     name: AeroFTP
     text: Multi-Protocol File Manager
     tagline: 22 protocols, AI assistant, encrypted vaults, cloud sync
     image:
       src: /logo.svg
       alt: AeroFTP
     actions:
       - theme: brand
         text: Get Started
         link: /getting-started/installation
       - theme: alt
         text: View on GitHub
         link: https://github.com/axpnet/aeroftp
   features:
     - icon: 🔌
       title: 22 Protocols
       details: FTP, SFTP, WebDAV, S3, Google Drive, and 17 more
     - icon: 🤖
       title: AeroAgent
       details: AI assistant with 47 tools for file management
     - icon: 🔒
       title: AeroVault
       details: AES-256-GCM-SIV encrypted containers
     - icon: 🔄
       title: AeroSync
       details: Smart sync with conflict resolution
   ---
   ```

### Phase 3: Build & Deploy (15 min)

1. Add scripts to package.json:
   ```json
   {
     "scripts": {
       "docs:dev": "vitepress dev",
       "docs:build": "vitepress build",
       "docs:preview": "vitepress preview"
     }
   }
   ```

2. Build output goes to `.vitepress/dist/`

3. Update GitHub Pages workflow or deploy config:
   - Output dir: `.vitepress/dist/` instead of `book/`
   - Or symlink: `ln -s .vitepress/dist book`

4. Update `.gitignore`:
   ```
   node_modules/
   .vitepress/cache/
   .vitepress/dist/
   ```

### Phase 4: Enhancements (optional, post-migration)

1. **Protocol badges component**: Vue component showing protocol status
   ```vue
   <ProtocolBadge name="FTP" status="stable" auth="password" />
   ```

2. **Feature comparison tables**: Interactive with sorting/filtering

3. **Version selector**: Show docs for different AeroFTP versions

4. **API reference**: Auto-generated from Rust doc comments

5. **Algolia search**: Replace local search with Algolia DocSearch (free for OSS)

6. **i18n**: VitePress supports multi-language docs natively

## File Mapping

| mdbook (current) | VitePress (new) |
|-------------------|-----------------|
| `src/SUMMARY.md` | `.vitepress/config.ts` sidebar |
| `src/README.md` | `index.md` (with hero frontmatter) |
| `src/custom.css` | `.vitepress/theme/custom.css` |
| `src/custom.js` | `.vitepress/theme/index.ts` |
| `src/images/` | `public/images/` |
| `src/**/*.md` | `**/*.md` (same structure, root level) |
| `book.toml` | `.vitepress/config.ts` |
| `book/` (output) | `.vitepress/dist/` (output) |

## Cleanup After Migration

1. Delete: `book.toml`, `src/SUMMARY.md`, `src/custom.css`, `src/custom.js`
2. Delete: `book/` output directory
3. Keep: all `.md` content files (moved to root)
4. Update: GitHub Pages deploy to use `.vitepress/dist/`

## Estimated Time

| Phase | Time |
|-------|------|
| Setup + config | 30 min |
| Content migration | 1-2 hours |
| Theme customization | 30 min |
| Build + deploy | 15 min |
| **Total** | **~3 hours** |

## Reference Sites (VitePress)

- Vite: https://vitejs.dev
- Vue: https://vuejs.org
- Tauri: https://tauri.app (uses Docusaurus but similar concept)
- Vitest: https://vitest.dev
