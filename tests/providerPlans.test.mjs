import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { providerPlans } from '../.vitepress/theme/data/providerPlans.ts'

test('the Fastly plan row and card resolve to the published guide', () => {
  const id = 'fastly-object-storage'
  const plan = providerPlans[id]
  assert.ok(plan, 'the plan card finds its Fastly entry')
  assert.equal(plan.id, id)
  assert.equal(`/providers/${plan.id}`, '/providers/fastly-object-storage')
  const guide = readFileSync(new URL(`../providers/${id}.md`, import.meta.url), 'utf8')
  assert.match(guide, /<ProviderPlanCard id="fastly-object-storage" \/>/)
})

test('the Neon plan row and card resolve to the published guide', () => {
  const id = 'neon'
  const plan = providerPlans[id]
  assert.ok(plan, 'the plan card finds its Neon entry')
  assert.equal(plan.id, id)
  assert.equal(`/providers/${plan.id}`, '/providers/neon')
  const guide = readFileSync(new URL(`../providers/${id}.md`, import.meta.url), 'utf8')
  assert.match(guide, /<ProviderPlanCard id="neon" \/>/)
})

test('the Puter plan row and card resolve to the published guide', () => {
  const id = 'puter'
  const plan = providerPlans[id]
  assert.ok(plan, 'the plan card finds its Puter entry')
  assert.equal(plan.id, id)
  assert.equal(`/providers/${plan.id}`, '/providers/puter')
  const guide = readFileSync(new URL(`../providers/${id}.md`, import.meta.url), 'utf8')
  assert.match(guide, /<ProviderPlanCard id="puter" \/>/)
})
