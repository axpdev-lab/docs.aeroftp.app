<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

/**
 * SourceForge publishes full country names; the map is keyed by ISO code.
 * Names that its feed spells differently from the ISO list are aliased here.
 * Anything left unmapped is counted into `offMap` and disclosed, never dropped
 * silently.
 */
const CODE_BY_NAME: Record<string, string> = {
  'United States':'US','Denmark':'DK','Finland':'FI','Russia':'RU','Italy':'IT','Germany':'DE',
  'Poland':'PL','Canada':'CA','Spain':'ES','China':'CN','France':'FR','United Kingdom':'GB',
  'Brazil':'BR','Mexico':'MX','Romania':'RO','India':'IN','Netherlands':'NL','Iran':'IR',
  'Singapore':'SG','Australia':'AU','Turkey':'TR','Ireland':'IE','Indonesia':'ID','Japan':'JP',
  'Viet Nam':'VN','Malaysia':'MY','Bangladesh':'BD','Ukraine':'UA','Hong Kong':'HK','Egypt':'EG',
  'Czech Republic':'CZ','Israel':'IL','Pakistan':'PK','Sweden':'SE','Belgium':'BE','Algeria':'DZ',
  'Korea':'KR','Switzerland':'CH','Serbia':'RS','Croatia':'HR','Uzbekistan':'UZ','Hungary':'HU',
  'Bulgaria':'BG','Belarus':'BY','Slovakia':'SK','Philippines':'PH','Taiwan':'TW','Argentina':'AR',
  'Norfolk Island':'NF','Chile':'CL','Peru':'PE','Thailand':'TH','Albania':'AL','Ecuador':'EC',
  'Slovenia':'SI','Portugal':'PT','Ivory Coast':'CI','Austria':'AT','Iceland':'IS','Cyprus':'CY',
  'Nigeria':'NG','Morocco':'MA','Greece':'GR','Bosnia and Herzegovina':'BA','Latvia':'LV',
  'Zambia':'ZM','Estonia':'EE','Oman':'OM','Dominican Republic':'DO','Lithuania':'LT',
  'Trinidad and Tobago':'TT','Honduras':'HN','Cameroon':'CM','Jamaica':'JM','Myanmar':'MM',
  'Saudi Arabia':'SA','New Zealand':'NZ','Venezuela':'VE','Uruguay':'UY','El Salvador':'SV',
  'South Africa':'ZA','Kyrgyzstan':'KG','Cambodia':'KH','Tanzania':'TZ','Norway':'NO',
  'Luxembourg':'LU','Kazakhstan':'KZ','Tunisia':'TN','Kenya':'KE','Yemen':'YE',
  'Palestinian Territory':'PS','Reunion':'RE',
}

/** Bin edges, low to high. Five buckets, each populated by the real distribution. */
const BINS = [
  { max: 2,        label: '1-2' },
  { max: 9,        label: '3-9' },
  { max: 29,       label: '10-29' },
  { max: 99,       label: '30-99' },
  { max: Infinity, label: '100+' },
]

interface Row { name: string; code: string | null; downloads: number }

const rows = ref<Row[]>([])
const oses = ref<[string, number][]>([])
const weekly = ref<[string, number][]>([])
const countryPaths = ref<Record<string, string>>({})
const loading = ref(true)
const failed = ref(false)
const hovered = ref<string | null>(null)

const nameByCode = computed(() => {
  const m = new Map<string, string>()
  for (const r of rows.value) if (r.code) m.set(r.code, r.name)
  return m
})
const dlByCode = computed(() => {
  const m = new Map<string, number>()
  for (const r of rows.value) if (r.code) m.set(r.code, r.downloads)
  return m
})
/** Countries the world map has no shape for: disclosed under the map. */
const offMap = computed(() =>
  rows.value.filter(r => !r.code || !(r.code in countryPaths.value))
)
const total = computed(() => rows.value.reduce((s, r) => s + r.downloads, 0))
const sorted = computed(() => [...rows.value].sort((a, b) => b.downloads - a.downloads))
const osMax = computed(() => Math.max(1, ...oses.value.map(o => o[1])))

function binOf(downloads: number): number {
  return BINS.findIndex(b => downloads <= b.max) + 1
}
function binClass(code: string): string {
  const d = dlByCode.value.get(code)
  return d === undefined ? 'sf-empty' : `sf-b${binOf(d)}`
}

/** The trailing week is still accumulating; it is drawn dashed and excluded from the peak. */
const trend = computed(() => {
  const pts = weekly.value
  if (pts.length < 2) return null
  const vals = pts.map(p => p[1])
  const max = Math.max(...vals, 1)
  const W = 640, H = 90
  const xy = pts.map((p, i) => [ (i / (pts.length - 1)) * W, H - (p[1] / max) * H ] as const)
  const line = (a: readonly (readonly [number, number])[]) =>
    a.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return {
    solid: line(xy.slice(0, -1)),
    tail: line(xy.slice(-2)),
    peak: Math.max(...vals.slice(0, -1)),
    weeks: pts.length,
  }
})

onMounted(async () => {
  const end = new Date().toISOString().slice(0, 10)
  try {
    const [pathsRes, dataRes] = await Promise.all([
      fetch('/data/country-paths.json'),
      // SourceForge serves this with `access-control-allow-origin: *`, so it is
      // read straight from the browser. It clamps start_date to the project's
      // registration date on its own.
      fetch(`https://sourceforge.net/projects/aeroftp/files/stats/json?start_date=2020-01-01&end_date=${end}`),
    ])
    if (pathsRes.ok) countryPaths.value = await pathsRes.json()
    if (!dataRes.ok) throw new Error(String(dataRes.status))
    const json = await dataRes.json()
    rows.value = (json?.countries ?? [])
      .filter((c: [string, number]) => c[0] !== 'Unknown')
      .map((c: [string, number]) => ({ name: c[0], code: CODE_BY_NAME[c[0]] ?? null, downloads: c[1] }))
    oses.value = (json?.oses ?? []).slice().sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    weekly.value = json?.downloads ?? []
  } catch {
    failed.value = true
  }
  loading.value = false
})
</script>

<template>
  <section v-if="!failed" class="sf-reach">
    <h2 class="sf-title">Downloads by Country</h2>
    <p class="sf-subtitle" v-if="!loading && rows.length">
      <strong>{{ total.toLocaleString() }} downloads</strong> across
      <strong>{{ rows.length }} countries</strong>
    </p>
    <p class="sf-subtitle" v-else-if="!loading">Download data from SourceForge</p>

    <div class="sf-map-container">
      <div v-if="loading" class="sf-skeleton" />
      <template v-else>
        <svg viewBox="0 0 960 500" class="sf-map" role="img"
             aria-label="World map shading each country by how many times AeroFTP was downloaded from SourceForge">
          <path
            v-for="(path, code) in countryPaths"
            :key="code"
            :d="path"
            :class="[binClass(String(code)), { 'sf-hover': hovered === code }]"
            stroke="var(--vp-c-bg)"
            :stroke-width="hovered === code ? 1.5 : 0.5"
            @mouseenter="hovered = String(code)"
            @mouseleave="hovered = null"
          />
        </svg>

        <div v-if="hovered" class="sf-tooltip">
          <span class="sf-tooltip-name">{{ nameByCode.get(hovered) || hovered }}</span>
          <span v-if="dlByCode.has(hovered)" class="sf-tooltip-n">
            {{ dlByCode.get(hovered)?.toLocaleString() }}
          </span>
          <span v-else class="sf-tooltip-none">no downloads</span>
        </div>

        <div class="sf-legend">
          <div class="sf-legend-items">
            <span class="sf-legend-label">downloads</span>
            <div v-for="(b, i) in BINS" :key="b.label" class="sf-legend-item">
              <div class="sf-legend-swatch" :class="`sf-b${i + 1}`" />
              <span>{{ b.label }}</span>
            </div>
          </div>
          <a href="https://sourceforge.net/projects/aeroftp/files/" target="_blank" rel="noopener" class="sf-powered">
            Powered by SourceForge
          </a>
        </div>
      </template>
    </div>

    <div v-if="!loading && trend" class="sf-panels">
      <figure class="sf-panel">
        <figcaption class="sf-panel-title">Downloads per week</figcaption>
        <svg :viewBox="`0 -6 640 102`" class="sf-spark" role="img"
             :aria-label="`Weekly downloads over ${trend.weeks} weeks, peaking at ${trend.peak}`">
          <path :d="trend.solid" class="sf-spark-line" />
          <path :d="trend.tail" class="sf-spark-line sf-spark-tail" />
        </svg>
        <p class="sf-panel-note">Peak {{ trend.peak.toLocaleString() }} in one week. The dashed segment is the current week, still accumulating.</p>
      </figure>

      <figure class="sf-panel" v-if="oses.length">
        <figcaption class="sf-panel-title">By operating system</figcaption>
        <div class="sf-bars">
          <div v-for="[os, n] in oses" :key="os" class="sf-bar-row">
            <span class="sf-bar-name">{{ os }}</span>
            <div class="sf-bar-track">
              <div class="sf-bar-fill" :style="{ width: `${(n / osMax) * 100}%` }" />
            </div>
            <span class="sf-bar-value">{{ n.toLocaleString() }}</span>
          </div>
        </div>
        <p class="sf-panel-note">Reported by the downloader's user agent. "Unknown" is what SourceForge could not classify.</p>
      </figure>
    </div>

    <div v-if="!loading && sorted.length" class="sf-list">
      <div v-for="r in sorted" :key="r.name" class="sf-badge">
        <span class="sf-badge-name">{{ r.name }}</span>
        <span class="sf-badge-n">{{ r.downloads.toLocaleString() }}</span>
      </div>
    </div>

    <p v-if="!loading && rows.length" class="sf-disclaimer">
      This map is real, and it is partial. The data comes exclusively from SourceForge, which is one of several channels AeroFTP is distributed through (GitHub Releases, the Snap Store, AUR and Flathub are not counted here), so it shows where the project reaches, not how many people run it.
      <template v-if="offMap.length">
        {{ offMap.length }} territories ({{ offMap.map(r => r.name).join(', ') }}) are listed above but have no shape on this world map, so their {{ offMap.reduce((s, r) => s + r.downloads, 0) }} downloads are not shaded.
      </template>
    </p>
  </section>
</template>

<style scoped>
/*
 * Sequential ramp, one hue, light to dark, validated with the dataviz palette
 * checker (ordinal mode): monotone lightness, adjacent dL >= 0.06, light end
 * clears the surface at 2:1. Dark mode is a separately selected ramp, not a
 * flip: its anchor moves so the low bin still clears the dark surface (4.19:1).
 */
.sf-reach {
  --sf-b1: #38bdf8; --sf-b2: #0ea5e9; --sf-b3: #0284c7; --sf-b4: #0369a1; --sf-b5: #0c4a6e;
  --sf-accent: #0284c7;
  max-width: 900px;
  margin: 3rem auto;
  padding: 0 1.5rem;
}
.dark .sf-reach {
  --sf-b1: #0284c7; --sf-b2: #0ea5e9; --sf-b3: #38bdf8; --sf-b4: #7dd3fc; --sf-b5: #bae6fd;
  --sf-accent: #38bdf8;
}

.sf-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}
.sf-subtitle { text-align: center; color: var(--vp-c-text-2); margin-bottom: 1.5rem; }

.sf-map-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.sf-skeleton {
  width: 100%;
  aspect-ratio: 960/500;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--vp-c-bg-soft) 25%, var(--vp-c-bg-elv) 50%, var(--vp-c-bg-soft) 75%);
  background-size: 200% 100%;
  animation: sf-shimmer 1.5s infinite;
}
@keyframes sf-shimmer { to { background-position: -200% 0; } }
.sf-map { width: 100%; height: auto; display: block; }
.sf-map path { transition: fill 0.2s; cursor: default; }
.sf-map path.sf-b1, .sf-map path.sf-b2, .sf-map path.sf-b3,
.sf-map path.sf-b4, .sf-map path.sf-b5 { cursor: pointer; }

.sf-empty { fill: var(--vp-c-bg-soft); }
.sf-b1 { fill: var(--sf-b1); }
.sf-b2 { fill: var(--sf-b2); }
.sf-b3 { fill: var(--sf-b3); }
.sf-b4 { fill: var(--sf-b4); }
.sf-b5 { fill: var(--sf-b5); }
.sf-map path.sf-hover { fill: var(--sf-accent); }
.sf-map path.sf-empty.sf-hover { fill: var(--vp-c-text-3); }

.sf-tooltip {
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
.sf-tooltip-name { font-weight: 600; }
.sf-tooltip-n { margin-left: 0.5rem; color: var(--sf-accent); font-variant-numeric: tabular-nums; }
.sf-tooltip-none { margin-left: 0.5rem; color: var(--vp-c-text-3); }

.sf-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.sf-legend-items { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.sf-legend-label { color: var(--vp-c-text-3); }
.sf-legend-item { display: flex; align-items: center; gap: 0.375rem; }
.sf-legend-swatch { width: 12px; height: 12px; border-radius: 3px; }
.sf-legend-swatch.sf-b1 { background: var(--sf-b1); }
.sf-legend-swatch.sf-b2 { background: var(--sf-b2); }
.sf-legend-swatch.sf-b3 { background: var(--sf-b3); }
.sf-legend-swatch.sf-b4 { background: var(--sf-b4); }
.sf-legend-swatch.sf-b5 { background: var(--sf-b5); }
.sf-powered { text-decoration: none; color: var(--vp-c-text-3); transition: opacity 0.2s; }
.sf-powered:hover { opacity: 0.7; }

.sf-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}
@media (max-width: 720px) { .sf-panels { grid-template-columns: 1fr; } }
.sf-panel {
  margin: 0;
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.sf-panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.75rem;
}
.sf-panel-note {
  margin-top: 0.75rem;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--vp-c-text-3);
}
.sf-spark { width: 100%; height: auto; display: block; overflow: visible; }
.sf-spark-line { fill: none; stroke: var(--sf-accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.sf-spark-tail { stroke-dasharray: 4 3; }

.sf-bars { display: flex; flex-direction: column; gap: 0.5rem; }
.sf-bar-row { display: grid; grid-template-columns: 5.5rem 1fr 3rem; align-items: center; gap: 0.5rem; }
.sf-bar-name { font-size: 0.78rem; color: var(--vp-c-text-2); }
.sf-bar-track { height: 10px; border-radius: 4px; background: var(--vp-c-bg-soft); overflow: hidden; }
.sf-bar-fill { height: 100%; border-radius: 4px; background: var(--sf-accent); }
.sf-bar-value {
  font-size: 0.75rem;
  text-align: right;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}

.sf-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 1rem; }
.sf-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.sf-badge-name { font-weight: 600; color: var(--vp-c-text-1); }
.sf-badge-n { color: var(--sf-accent); font-variant-numeric: tabular-nums; }

.sf-disclaimer {
  max-width: 720px;
  margin: 1.25rem auto 0;
  text-align: center;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}
</style>
