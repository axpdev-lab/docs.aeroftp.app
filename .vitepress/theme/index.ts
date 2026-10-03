import DefaultTheme from 'vitepress/theme'
import ProviderPlanCard from './components/ProviderPlanCard.vue'
import ProviderPlanTable from './components/ProviderPlanTable.vue'
import ArchiveFormatCard from './components/ArchiveFormatCard.vue'
import DagShapes from './components/DagShapes.vue'
import DagDispatch from './components/DagDispatch.vue'
import DagAimd from './components/DagAimd.vue'
import DagFrontier from './components/DagFrontier.vue'
import DagCompletion from './components/DagCompletion.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    DefaultTheme.enhanceApp?.({ app })
    app.component('ProviderPlanCard', ProviderPlanCard)
    app.component('ProviderPlanTable', ProviderPlanTable)
    app.component('ArchiveFormatCard', ArchiveFormatCard)
    app.component('DagShapes', DagShapes)
    app.component('DagDispatch', DagDispatch)
    app.component('DagAimd', DagAimd)
    app.component('DagFrontier', DagFrontier)
    app.component('DagCompletion', DagCompletion)
  }
}
