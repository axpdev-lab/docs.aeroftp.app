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
  // Puter publishes a Free plan with 25 MB and no card: FREE, never
  // TRIAL, and the page describes the plan instead of ruling it out.
  assert.deepEqual(plan.badges, ['FREE'])
  const guide = readFileSync(new URL(`../providers/${id}.md`, import.meta.url), 'utf8')
  assert.match(guide, /<ProviderPlanCard id="puter" \/>/)
  assert.doesNotMatch(guide, /not a free plan|trial/i)
})

test('the LifetimeCloud plan row is a FREE plan with no time limit and resolves to the published guide', () => {
  const id = 'lifetimecloud'
  const plan = providerPlans[id]
  assert.ok(plan, 'the plan card finds its LifetimeCloud entry')
  assert.equal(plan.id, id)
  // 1 GB, no card, no time limit, only usage limits: a free plan, never a
  // trial, and no wording a reader could take for a temporary account.
  assert.deepEqual(plan.badges, ['FREE'])
  assert.match(plan.storage, /no time limit/i)
  for (const field of ['storage', 'limits', 'billing', 'costTip']) {
    assert.doesNotMatch(plan[field], /trial/i, `${field} must not describe a trial`)
    assert.doesNotMatch(
      plan[field],
      /\b\d+[- ](day|week|month|year)s?\b(?! of version| \(last)|expires?\b|expiration|temporary|until\b/i,
      `${field} must not suggest a time limit`
    )
  }
  assert.equal(`/providers/${plan.id}`, '/providers/lifetimecloud')
  const guide = readFileSync(new URL(`../providers/${id}.md`, import.meta.url), 'utf8')
  assert.match(guide, /<ProviderPlanCard id="lifetimecloud" \/>/)
})

test('TRIAL is only a time-limited trial', () => {
  // Project rule: a free plan the provider publishes as free is FREE,
  // however tight its usage limits; TRIAL marks a time-limited allowance, paid
  // afterwards (PAY) or an observed hosted trial next to self-hosting
  // (SELF-HOST). Zoho alone pairs FREE with TRIAL, for two different plans
  // (a free individual plan and a business-plan trial), pinned by name.
  for (const plan of Object.values(providerPlans)) {
    if (!plan.badges.includes('TRIAL')) continue
    if (plan.badges.includes('FREE')) {
      assert.equal(plan.id, 'zoho', `${plan.id}: a free plan is FREE, not TRIAL`)
    } else {
      assert.ok(
        plan.badges.includes('PAY') || plan.badges.includes('SELF-HOST'),
        `${plan.id}: a TRIAL is time-limited and paid afterwards`
      )
    }
  }
})
