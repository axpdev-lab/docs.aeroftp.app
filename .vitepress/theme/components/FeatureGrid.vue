<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as pages } from '../data/features.data'

// Groups and their order come from the "Features" sidebar section, the card
// text from each linked page's frontmatter `description`.
const { theme } = useData()

const normalize = (url: string) => url.replace(/\.html$/, '').replace(/\/$/, '')

const descriptions = new Map(
  pages.map((page) => [normalize(page.url), page.frontmatter.description as string | undefined]),
)

const BLURBS: Record<string, string> = {
  'Aero Family': 'The applications built into AeroFTP, each with its own window or panel.',
  'Sync & Delta': 'Keeping two trees in step, and moving only what changed.',
  'AI & Agents': 'An assistant inside the app, and a CLI that other AI agents can drive.',
  'File Operations': 'Everyday tools for working with the files themselves.',
  'Bridges & Interop': 'Moving profiles and encrypted data between AeroFTP and the tools you already use.',
}

// 24x24 line icons, drawn for this page; stroke is currentColor.
const LINK = '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
const ICONS: Record<string, string> = {
  '/features/aerocloud': '<path d="M7 18h10.5a3.5 3.5 0 0 0 .4-7A6 6 0 0 0 6.3 9.6 4.2 4.2 0 0 0 7 18z"/>',
  '/features/aerofile': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  '/features/aerosync': '<path d="M20 11a8 8 0 0 0-14.6-4.5"/><path d="M4 13a8 8 0 0 0 14.6 4.5"/><path d="M5 3v4h4"/><path d="M19 21v-4h-4"/>',
  '/features/aerovault': '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V7M15.5 12H17M7 20v1M17 20v1"/>',
  '/features/aerocrypt': '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',
  '/features/aeroagent': '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
  '/features/aeroplayer': '<path d="M9 18V6l11-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="16" r="2"/>',
  '/features/aerotools': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 13h18"/><path d="M7 16.5h3M13 16.5h4"/>',
  '/features/delta-sync': '<path d="M12 4l8.5 15h-17z"/>',
  '/features/aerorsync': '<path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/>',
  '/features/mount-manager': '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M6 13l2-8h8l2 8"/><circle cx="17" cy="16.5" r="1"/>',
  '/features/agent-orchestration': '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.5 6h7M7.3 8.2l3.4 7.6M16.7 8.2l-3.4 7.6"/>',
  '/features/agent-ready': '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4"/><circle cx="12" cy="3.5" r="1"/><path d="M9.5 13v1M14.5 13v1"/>',
  '/test-reports/aeroagent/capability-matrix': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 13l2 2 4-4"/>',
  '/features/archives': '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M10 13h4"/>',
  '/features/batch-rename': '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  '/features/code-editor': '<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/><path d="M13.5 5l-3 14"/>',
  '/features/file-tags': '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  '/features/terminal': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3"/><path d="M12 15h5"/>',
  '/features/rclone': LINK,
  '/features/rclone-crypt': '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9"/><path d="M17 6l3 3"/>',
  '/features/winscp': LINK,
  '/features/filezilla': LINK,
}
const FALLBACK = '<circle cx="12" cy="12" r="8"/>'

type Item = { text: string; link: string; items?: Item[] }

const groups = computed(() => {
  const root = (theme.value.sidebar as Record<string, Item[]>)['/'] ?? []
  const features = root.find((group) => group.text === 'Features')
  return (features?.items ?? [])
    .filter((group) => Array.isArray(group.items))
    .map((group) => ({
      text: group.text,
      id: group.text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      blurb: BLURBS[group.text],
      items: (group.items ?? []).map((item) => ({
        text: item.text,
        href: withBase(item.link),
        description: descriptions.get(normalize(item.link)),
        icon: ICONS[normalize(item.link)] ?? FALLBACK,
      })),
    }))
})
</script>

<template>
  <div class="feature-overview">
    <section v-for="group in groups" :key="group.id" class="feature-group" :aria-labelledby="`group-${group.id}`">
      <h2 :id="`group-${group.id}`" class="feature-group__title">{{ group.text }}</h2>
      <p v-if="group.blurb" class="feature-group__blurb">{{ group.blurb }}</p>
      <div class="feature-grid">
        <a v-for="item in group.items" :key="item.href" class="feature-card" :href="item.href">
          <span class="feature-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" v-html="item.icon" />
          </span>
          <span class="feature-card__title">{{ item.text }}</span>
          <span v-if="item.description" class="feature-card__desc">{{ item.description }}</span>
          <span class="feature-card__more" aria-hidden="true">Read more →</span>
        </a>
      </div>
    </section>
  </div>
</template>
