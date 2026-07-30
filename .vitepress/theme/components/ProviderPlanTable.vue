<script setup lang="ts">
import { computed } from 'vue'
import { providerPlans, type ProviderBadge, type ProviderPlan } from '../data/providerPlans'

// The comparative table is GENERATED from providerPlans.ts, which is the single
// source of truth for plan data. It used to be a hand-written Markdown table in
// providers/index.md, which meant every price lived in two places and drifted.
// Add or correct a provider in providerPlans.ts and both its page card and this
// table follow automatically.

const badgeText: Record<ProviderBadge, string> = {
  FREE: 'FREE',
  PAY: 'PAY',
  TRIAL: 'TRIAL',
  CARD: 'CARD',
  BYO: 'BYO',
  'SELF-HOST': 'SELF-HOST',
  LOCAL: 'LOCAL',
}

// Category display order: the buckets a reader is most likely to be comparing
// within come first.
const categoryOrder = [
  'S3-compatible',
  'Cloud (OAuth/API)',
  'WebDAV',
  'SFTP preset',
  'Photo & media',
  'Developer forge',
  'Local bridge',
]

function rank(category: string): number {
  const i = categoryOrder.indexOf(category.split(' / ')[0])
  return i === -1 ? categoryOrder.length : i
}

const rows = computed<ProviderPlan[]>(() =>
  Object.values(providerPlans).sort(
    (a, b) => rank(a.category) - rank(b.category) || a.name.localeCompare(b.name),
  ),
)

// The newest `checked` value across all entries, so the reader can see at a
// glance how fresh the freshest row is without us hard-coding a date that then
// goes stale on its own.
const newestChecked = computed(() =>
  rows.value.map((r) => r.checked).sort().at(-1),
)
</script>

<template>
  <div class="plan-table-wrap">
    <p class="plan-table-note">
      Generated from the same data as the plan snapshot on each provider page, so
      the two can never disagree. Most recent verification in this table:
      <strong>{{ newestChecked }}</strong>. Each row carries its own check date —
      storage pricing moves, so confirm on the vendor page before committing
      production data.
    </p>

    <div class="plan-table-scroll">
      <table class="plan-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Category</th>
            <th>Tier snapshot</th>
            <th>Notes / main limits</th>
            <th>Checked</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <a :href="`/providers/${row.id}`">{{ row.name }}</a>
            </td>
            <td class="plan-table__cat">{{ row.category }}</td>
            <td>
              <span
                v-for="badge in row.badges"
                :key="badge"
                class="plan-table__badge"
                :class="`plan-table__badge--${badge.toLowerCase().replace('-', '')}`"
              >{{ badgeText[badge] }}</span>
              <span class="plan-table__storage">{{ row.storage }}</span>
            </td>
            <td>{{ row.limits }}</td>
            <td class="plan-table__checked">
              <a :href="row.sourceUrl" target="_blank" rel="noreferrer">{{ row.checked }}</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.plan-table-note {
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0 0 0.9rem;
}
.plan-table-scroll {
  overflow-x: auto;
}
.plan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  display: table;
}
.plan-table th,
.plan-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 0.5rem 0.65rem;
  text-align: left;
  vertical-align: top;
}
.plan-table th {
  background: var(--vp-c-bg-soft);
  white-space: nowrap;
}
.plan-table__cat,
.plan-table__checked {
  white-space: nowrap;
}
.plan-table__storage {
  display: block;
  margin-top: 0.3rem;
}
.plan-table__badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0.08rem 0.34rem;
  margin: 0 0.25rem 0.15rem 0;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.plan-table__badge--free {
  border-color: var(--vp-c-green-3);
  color: var(--vp-c-green-1);
}
.plan-table__badge--trial {
  border-color: var(--vp-c-yellow-3);
  color: var(--vp-c-yellow-1);
}
.plan-table__badge--card {
  border-color: var(--vp-c-red-3);
  color: var(--vp-c-red-1);
}
</style>
