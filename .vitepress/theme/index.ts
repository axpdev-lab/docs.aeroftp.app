import DefaultTheme from 'vitepress/theme'
import ProviderPlanCard from './components/ProviderPlanCard.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    DefaultTheme.enhanceApp?.({ app })
    app.component('ProviderPlanCard', ProviderPlanCard)
  }
}
