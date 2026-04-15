<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const COUNTRY_NAMES: Record<string, string> = {
  AE:'United Arab Emirates',AF:'Afghanistan',AL:'Albania',AM:'Armenia',AO:'Angola',AR:'Argentina',
  AT:'Austria',AU:'Australia',AZ:'Azerbaijan',BA:'Bosnia and Herzegovina',BD:'Bangladesh',BE:'Belgium',
  BF:'Burkina Faso',BG:'Bulgaria',BI:'Burundi',BJ:'Benin',BN:'Brunei',BO:'Bolivia',BR:'Brazil',
  BS:'Bahamas',BT:'Bhutan',BW:'Botswana',BY:'Belarus',BZ:'Belize',CA:'Canada',CD:'DR Congo',
  CF:'Central African Republic',CG:'Congo',CH:'Switzerland',CI:"Cote d'Ivoire",CL:'Chile',CM:'Cameroon',
  CN:'China',CO:'Colombia',CR:'Costa Rica',CU:'Cuba',CY:'Cyprus',CZ:'Czechia',DE:'Germany',
  DJ:'Djibouti',DK:'Denmark',DO:'Dominican Republic',DZ:'Algeria',EC:'Ecuador',EE:'Estonia',EG:'Egypt',
  ER:'Eritrea',ES:'Spain',ET:'Ethiopia',FI:'Finland',FJ:'Fiji',FR:'France',GA:'Gabon',GB:'United Kingdom',
  GE:'Georgia',GH:'Ghana',GL:'Greenland',GR:'Greece',GT:'Guatemala',GY:'Guyana',HN:'Honduras',
  HR:'Croatia',HT:'Haiti',HU:'Hungary',ID:'Indonesia',IE:'Ireland',IL:'Israel',IN:'India',IQ:'Iraq',
  IR:'Iran',IS:'Iceland',IT:'Italy',JP:'Japan',KE:'Kenya',KG:'Kyrgyzstan',KH:'Cambodia',KR:'South Korea',
  KW:'Kuwait',KZ:'Kazakhstan',LA:'Laos',LB:'Lebanon',LK:'Sri Lanka',LR:'Liberia',LS:'Lesotho',
  LT:'Lithuania',LU:'Luxembourg',LV:'Latvia',LY:'Libya',MA:'Morocco',MD:'Moldova',ME:'Montenegro',
  MG:'Madagascar',MK:'North Macedonia',ML:'Mali',MM:'Myanmar',MN:'Mongolia',MR:'Mauritania',MW:'Malawi',
  MX:'Mexico',MY:'Malaysia',MZ:'Mozambique',NA:'Namibia',NE:'Niger',NG:'Nigeria',NI:'Nicaragua',
  NL:'Netherlands',NO:'Norway',NP:'Nepal',NZ:'New Zealand',OM:'Oman',PA:'Panama',PE:'Peru',
  PG:'Papua New Guinea',PH:'Philippines',PK:'Pakistan',PL:'Poland',PT:'Portugal',PY:'Paraguay',
  QA:'Qatar',RO:'Romania',RS:'Serbia',RU:'Russia',RW:'Rwanda',SA:'Saudi Arabia',SD:'Sudan',SE:'Sweden',
  SI:'Slovenia',SK:'Slovakia',SN:'Senegal',SO:'Somalia',SR:'Suriname',SS:'South Sudan',SV:'El Salvador',
  SY:'Syria',SZ:'Eswatini',TD:'Chad',TG:'Togo',TH:'Thailand',TJ:'Tajikistan',TM:'Turkmenistan',
  TN:'Tunisia',TR:'Turkey',TW:'Taiwan',TZ:'Tanzania',UA:'Ukraine',UG:'Uganda',US:'United States',
  UY:'Uruguay',UZ:'Uzbekistan',VE:'Venezuela',VN:'Vietnam',YE:'Yemen',ZA:'South Africa',ZM:'Zambia',ZW:'Zimbabwe',
}

interface Territory { code: string; percent: number }

const territories = ref<Territory[]>([])
const countryPaths = ref<Record<string, string>>({})
const loading = ref(true)
const hovered = ref<string | null>(null)

const territoryMap = computed(() => new Map(territories.value.map(t => [t.code, t.percent])))
const top10 = computed(() => territories.value.slice(0, 10))

function getColor(percent: number): string {
  const intensity = Math.min(percent / 0.15, 1)
  const r = Math.round(56 + intensity * 3)
  const g = Math.round(189 - intensity * 59)
  const b = Math.round(248 - intensity * 2)
  const a = 0.35 + intensity * 0.65
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function getFill(code: string): string {
  if (hovered.value === code) {
    return territoryMap.value.has(code) ? '#38bdf8' : 'var(--vp-c-text-3)'
  }
  const p = territoryMap.value.get(code)
  return p !== undefined ? getColor(p) : 'var(--vp-c-bg-soft)'
}

onMounted(async () => {
  try {
    const [pathsRes, dataRes] = await Promise.all([
      fetch('/data/country-paths.json'),
      fetch('https://www.aeroftp.app/api/v1/snap/territories'),
    ])
    if (pathsRes.ok) countryPaths.value = await pathsRes.json()
    if (dataRes.ok) {
      const json = await dataRes.json()
      territories.value = json?.data?.territories ?? []
    }
  } catch { /* graceful */ }
  loading.value = false
})
</script>

<template>
  <section class="snap-territories">
    <h2 class="snap-title">AeroFTP Around the World</h2>
    <p class="snap-subtitle" v-if="!loading && territories.length > 0">
      Active installations across <strong>{{ territories.length }} territories</strong>
    </p>
    <p class="snap-subtitle" v-else-if="!loading">
      Weekly installation data from the Snap Store
    </p>

    <div class="snap-map-container">
      <div v-if="loading" class="snap-skeleton" />
      <template v-else>
        <svg viewBox="0 0 960 500" class="snap-map">
          <path
            v-for="(path, code) in countryPaths"
            :key="code"
            :d="path"
            :fill="getFill(code)"
            stroke="var(--vp-c-bg)"
            :stroke-width="hovered === code ? 1.5 : 0.5"
            :style="{ cursor: territoryMap.has(code) ? 'pointer' : 'default', transition: 'fill 0.2s' }"
            @mouseenter="hovered = code"
            @mouseleave="hovered = null"
          />
        </svg>

        <!-- Tooltip -->
        <div v-if="hovered" class="snap-tooltip">
          <span class="snap-tooltip-name">{{ COUNTRY_NAMES[hovered] || hovered }}</span>
          <span v-if="territoryMap.has(hovered)" class="snap-tooltip-pct">
            {{ ((territoryMap.get(hovered) ?? 0) * 100).toFixed(1) }}%
          </span>
        </div>

        <!-- Legend -->
        <div class="snap-legend">
          <div class="snap-legend-items">
            <div class="snap-legend-item">
              <div class="snap-legend-swatch" :style="{ backgroundColor: getColor(0.01) }" />
              <span>&lt; 1%</span>
            </div>
            <div class="snap-legend-item">
              <div class="snap-legend-swatch" :style="{ backgroundColor: getColor(0.05) }" />
              <span>~5%</span>
            </div>
            <div class="snap-legend-item">
              <div class="snap-legend-swatch" :style="{ backgroundColor: getColor(0.15) }" />
              <span>15%+</span>
            </div>
          </div>
          <a href="https://snapcraft.io/aeroftp" target="_blank" rel="noopener" class="snap-powered">
            Powered by Snapcraft
          </a>
        </div>
      </template>
    </div>

    <!-- Top countries -->
    <div v-if="!loading && top10.length > 0" class="snap-top">
      <div v-for="t in top10" :key="t.code" class="snap-badge">
        <span class="snap-badge-name">{{ COUNTRY_NAMES[t.code] || t.code }}</span>
        <span class="snap-badge-pct">{{ (t.percent * 100).toFixed(1) }}%</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.snap-territories {
  max-width: 900px;
  margin: 3rem auto;
  padding: 0 1.5rem;
}
.snap-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}
.snap-subtitle {
  text-align: center;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}
.snap-map-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.snap-skeleton {
  width: 100%;
  aspect-ratio: 960/500;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--vp-c-bg-soft) 25%, var(--vp-c-bg-elv) 50%, var(--vp-c-bg-soft) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
.snap-map {
  width: 100%;
  height: auto;
  display: block;
}
.snap-tooltip {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  pointer-events: none;
}
.snap-tooltip-name { font-weight: 600; }
.snap-tooltip-pct { margin-left: 0.5rem; color: #38bdf8; }
.snap-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.snap-legend-items { display: flex; gap: 1rem; }
.snap-legend-item { display: flex; align-items: center; gap: 0.375rem; }
.snap-legend-swatch { width: 12px; height: 12px; border-radius: 3px; }
.snap-powered {
  text-decoration: none;
  color: var(--vp-c-text-3);
  transition: opacity 0.2s;
}
.snap-powered:hover { opacity: 0.7; }
.snap-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.snap-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.snap-badge-name { font-weight: 600; color: var(--vp-c-text-1); }
.snap-badge-pct { color: #38bdf8; }
</style>
