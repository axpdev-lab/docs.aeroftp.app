<script setup lang="ts">
import { computed } from 'vue'
import { providerPlans, type ProviderBadge } from '../data/providerPlans'

const props = defineProps<{
  id: string
}>()

const plan = computed(() => providerPlans[props.id])

const badgeText: Record<ProviderBadge, string> = {
  FREE: 'FREE',
  PAY: 'PAY',
  TRIAL: 'TRIAL',
  CARD: 'CARD',
  BYO: 'BYO',
  'SELF-HOST': 'SELF-HOST',
  LOCAL: 'LOCAL',
}
</script>

<template>
  <section v-if="plan" class="provider-plan-card" aria-label="Provider plan snapshot">
    <div class="provider-plan-card__header">
      <div>
        <p class="provider-plan-card__eyebrow">Plan snapshot</p>
        <h2>{{ plan.name }}</h2>
      </div>
      <div class="provider-plan-card__badges" aria-label="Pricing badges">
        <span
          v-for="badge in plan.badges"
          :key="badge"
          class="provider-plan-card__badge"
          :class="`provider-plan-card__badge--${badge.toLowerCase().replace('-', '')}`"
        >
          {{ badgeText[badge] }}
        </span>
      </div>
    </div>

    <dl class="provider-plan-card__grid">
      <div>
        <dt>Free storage / trial</dt>
        <dd>{{ plan.storage }}</dd>
      </div>
      <div>
        <dt>Separate limits</dt>
        <dd>{{ plan.limits }}</dd>
      </div>
      <div>
        <dt>Billing trigger</dt>
        <dd>{{ plan.billing }}</dd>
      </div>
      <div>
        <dt>Best fit</dt>
        <dd>{{ plan.bestFor }}</dd>
      </div>
    </dl>

    <div class="provider-plan-card__tip">
      <strong>Cost hygiene:</strong>
      <span>{{ plan.costTip }}</span>
    </div>

    <p class="provider-plan-card__source">
      Checked {{ plan.checked }}:
      <a :href="plan.sourceUrl" target="_blank" rel="noreferrer">{{ plan.sourceLabel }}</a>
    </p>
  </section>
  <section v-else class="provider-plan-card provider-plan-card--missing" aria-label="Missing provider plan snapshot">
    Missing provider plan data for <code>{{ id }}</code>.
  </section>
</template>

