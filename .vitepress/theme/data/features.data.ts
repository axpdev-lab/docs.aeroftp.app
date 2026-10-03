import { createContentLoader } from 'vitepress'

// Title and description of every page the Features overview can link to.
// The overview reads its groups and their order from the sidebar, and each
// card's text from the linked page's frontmatter, so a new feature page only
// needs a sidebar entry and a `description` to appear on the overview.
export default createContentLoader([
  'features/*.md',
  'test-reports/aeroagent/capability-matrix.md',
])
