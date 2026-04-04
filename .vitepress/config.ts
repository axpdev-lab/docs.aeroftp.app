import { defineConfig } from 'vitepress'

// Inline SVG icons — Lucide-style, 24×24 viewBox
const icons = {
  plug: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m8 12 3 3 5-5"/></svg>',
  bot: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  sync: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
}

export default defineConfig({
  ignoreDeadLinks: true,
  title: 'AeroFTP Documentation',
  description: 'Documentation for AeroFTP - Multi-protocol file manager',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { property: 'og:title', content: 'AeroFTP Docs' }],
    ['meta', { property: 'og:description', content: 'Multi-protocol file manager — FTP, SFTP, S3, Google Drive & 19 more' }],
    ['meta', { property: 'og:image', content: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    // Inter font for a modern look
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'AeroFTP',
    nav: [
      { text: 'Guide', link: '/getting-started/installation' },
      { text: 'Reference', link: '/protocols/overview' },
      { text: 'Setup Guides', link: '/providers/' },
      { text: 'Features', link: '/features/aerocloud' },
      { text: 'CLI', link: '/cli/installation' },
      {
        text: 'GitHub',
        link: 'https://github.com/axpnet/aeroftp',
        target: '_blank',
        rel: 'noopener',
      },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Linux', link: '/getting-started/linux' },
            { text: 'Windows', link: '/getting-started/windows' },
            { text: 'macOS', link: '/getting-started/macos' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Interface', link: '/getting-started/interface' },
          ],
        },
        {
          text: 'Technical Reference',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/protocols/overview' },
            { text: 'FTP / FTPS', link: '/protocols/ftp' },
            { text: 'SFTP', link: '/protocols/sftp' },
            { text: 'WebDAV', link: '/protocols/webdav' },
            { text: 'S3-Compatible', link: '/protocols/s3' },
            { text: 'Azure Blob', link: '/protocols/azure' },
          ],
        },
        {
          text: 'Setup Guides',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/providers/' },
            // OAuth & Cloud
            { text: 'Google Drive', link: '/providers/google-drive' },
            { text: 'OneDrive', link: '/providers/onedrive' },
            { text: 'Dropbox', link: '/providers/dropbox' },
            { text: 'MEGA', link: '/providers/mega' },
            { text: 'Box', link: '/providers/box' },
            { text: 'pCloud', link: '/providers/pcloud' },
            { text: 'Filen', link: '/providers/filen' },
            { text: 'Internxt', link: '/providers/internxt' },
            { text: 'Zoho WorkDrive', link: '/providers/zoho' },
            { text: 'kDrive', link: '/providers/kdrive' },
            { text: 'Jottacloud', link: '/providers/jottacloud' },
            { text: 'Drime Cloud', link: '/providers/drime' },
            { text: 'Koofr', link: '/providers/koofr' },
            { text: 'OpenDrive', link: '/providers/opendrive' },
            { text: 'Yandex Disk', link: '/providers/yandex' },
            { text: '4shared', link: '/providers/4shared' },
            // S3 Providers
            { text: 'Backblaze B2', link: '/providers/backblaze-b2' },
            { text: 'Cloudflare R2', link: '/providers/cloudflare-r2' },
            { text: 'Storj', link: '/providers/storj' },
            { text: 'IDrive e2', link: '/providers/idrive-e2' },
            { text: 'Wasabi', link: '/providers/wasabi' },
            { text: 'DigitalOcean Spaces', link: '/providers/digitalocean-spaces' },
            { text: 'Oracle Cloud', link: '/providers/oracle-cloud' },
            { text: 'MinIO', link: '/providers/minio' },
            { text: 'Alibaba Cloud OSS', link: '/providers/alibaba-cloud-oss' },
            { text: 'Tencent Cloud COS', link: '/providers/tencent-cloud-cos' },
            // WebDAV
            { text: 'Nextcloud', link: '/providers/nextcloud' },
            { text: 'Felicloud', link: '/providers/felicloud' },
            { text: 'Quotaless', link: '/providers/quotaless' },
            { text: 'FileLu', link: '/providers/filelu' },
            // SFTP Presets
            { text: 'Hetzner Storage Box', link: '/providers/hetzner-storage-box' },
            { text: 'SourceForge', link: '/providers/sourceforge' },
            // Developer
            { text: 'GitHub', link: '/providers/github' },
          ],
        },
        {
          text: 'Features',
          collapsed: false,
          items: [
            { text: 'AeroCloud', link: '/features/aerocloud' },
            { text: 'AeroFile', link: '/features/aerofile' },
            { text: 'AeroSync', link: '/features/aerosync' },
            { text: 'AeroVault', link: '/features/aerovault' },
            { text: 'AeroAgent', link: '/features/aeroagent' },
            { text: 'Agent Orchestration', link: '/features/agent-orchestration' },
            { text: 'Agent-Ready Architecture', link: '/features/agent-ready' },
            { text: 'AeroAgent Tests', link: '/features/aeroagent-tests' },
            { text: 'AeroPlayer', link: '/features/aeroplayer' },
            { text: 'AeroTools', link: '/features/aerotools' },
            { text: 'Archives', link: '/features/archives' },
            { text: 'Batch Rename', link: '/features/batch-rename' },
            { text: 'Code Editor', link: '/features/code-editor' },
            { text: 'File Tags', link: '/features/file-tags' },
            { text: 'Terminal', link: '/features/terminal' },
          ],
        },
        {
          text: 'CLI',
          collapsed: false,
          items: [
            { text: 'Installation', link: '/cli/installation' },
            { text: 'Commands', link: '/cli/commands' },
            { text: 'Batch Scripting', link: '/cli/batch-scripting' },
            { text: 'Examples', link: '/cli/examples' },
          ],
        },
        {
          text: 'Advanced',
          collapsed: false,
          items: [
            { text: 'AeroVault Crate', link: '/advanced/aerovault-crate' },
            { text: 'Provider Reference', link: '/advanced/provider-reference' },
            { text: 'AI Provider Reference', link: '/advanced/ai-providers' },
            { text: 'Plugin Development', link: '/advanced/plugin-development' },
          ],
        },
        {
          text: 'Security',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/security/overview' },
            { text: 'Encryption', link: '/security/encryption' },
            { text: 'Credentials', link: '/security/credentials' },
            { text: 'Credential Isolation', link: '/credential-isolation' },
            { text: 'TOTP 2FA', link: '/security/totp' },
            { text: 'AI Security', link: '/security/ai-security' },
            { text: 'Supply Chain', link: '/security/supply-chain' },
            { text: 'Privacy', link: '/security/privacy' },
            { text: 'Audits', link: '/security/audits' },
            { text: 'Vulnerability Disclosure', link: '/security/reporting' },
          ],
        },
        {
          text: 'Contributing',
          collapsed: true,
          items: [
            { text: 'Build', link: '/contributing/build' },
            { text: 'Architecture', link: '/contributing/architecture' },
          ],
        },
        {
          text: 'Screenshots',
          link: '/screenshots',
        },
        {
          text: 'About',
          link: '/about',
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/axpnet/aeroftp' },
    ],
    editLink: {
      pattern: 'https://github.com/axpnet/docs.aeroftp.app/edit/main/:path',
      text: 'Suggest changes',
    },
    search: { provider: 'local' },
    footer: {
      message: 'Released under the GPL-3.0 License. <a href="https://sourceforge.net/software/product/AeroFTP/" target="_blank" rel="noopener"><img alt="AeroFTP Reviews" src="https://b.sf-syn.com/badge_img/4075717/light-default" style="height:28px;vertical-align:middle;margin-left:8px" /></a>',
      copyright: 'Copyright 2024-2026 AxpDev',
    },
  },
})
