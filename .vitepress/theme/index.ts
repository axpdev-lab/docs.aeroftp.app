import DefaultTheme from 'vitepress/theme'
import ProviderPlanCard from './components/ProviderPlanCard.vue'
import ProviderPlanTable from './components/ProviderPlanTable.vue'
import ArchiveFormatCard from './components/ArchiveFormatCard.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    DefaultTheme.enhanceApp?.({ app })
    app.component('ProviderPlanCard', ProviderPlanCard)
    app.component('ProviderPlanTable', ProviderPlanTable)
    app.component('ArchiveFormatCard', ArchiveFormatCard)
  }
}
