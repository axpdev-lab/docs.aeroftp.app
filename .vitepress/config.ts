import { defineConfig } from 'vitepress'

export default defineConfig({
  ignoreDeadLinks: true,
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
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Linux', link: '/getting-started/linux' },
          { text: 'Windows', link: '/getting-started/windows' },
          { text: 'macOS', link: '/getting-started/macos' },
          { text: 'Quick Start', link: '/getting-started/quick-start' },
          { text: 'Interface', link: '/getting-started/interface' }
        ]
      },
      {
        text: 'Protocols',
        items: [
          { text: 'Overview', link: '/protocols/overview' },
          { text: 'FTP', link: '/protocols/ftp' },
          { text: 'SFTP', link: '/protocols/sftp' },
          { text: 'GitHub', link: '/protocols/github' }
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'AeroSync', link: '/features/aerosync' },
          { text: 'AeroVault', link: '/features/aerovault' },
          { text: 'AeroAgent', link: '/features/aeroagent' },
          { text: 'AeroAgent Tests', link: '/features/aeroagent-tests' },
          { text: 'Terminal', link: '/features/terminal' }
        ]
      },
      {
        text: 'CLI',
        items: [
          { text: 'Installation', link: '/cli/installation' },
          { text: 'Commands', link: '/cli/commands' },
          { text: 'Batch Scripting', link: '/cli/batch-scripting' },
          { text: 'Examples', link: '/cli/examples' }
        ]
      },
      {
        text: 'Security',
        items: [
          { text: 'Encryption', link: '/security/encryption' },
          { text: 'Credentials', link: '/security/credentials' },
          { text: 'TOTP', link: '/security/totp' }
        ]
      },
      {
        text: 'Contributing',
        items: [
          { text: 'Build', link: '/contributing/build' },
          { text: 'Architecture', link: '/contributing/architecture' }
        ]
      }
    ],
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
})
