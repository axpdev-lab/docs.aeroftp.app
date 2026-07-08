<script setup lang="ts">
import {
  archiveFormats,
  nativeFormatsNote,
  type ArchiveFormatBadge,
} from '../data/archiveFormats'

const badgeText: Record<ArchiveFormatBadge, string> = {
  OPEN: 'OPEN',
  PROPRIETARY: 'PROPRIETARY',
  'READ-ONLY': 'READ-ONLY',
  CREATE: 'CREATE',
  EXTRACT: 'EXTRACT',
  'AES-256': 'AES-256',
}

const badgeClass = (badge: ArchiveFormatBadge) =>
  `archive-format-card__badge--${badge.toLowerCase().replace('-', '')}`
</script>

<template>
  <section class="archive-format-card" aria-label="Archive format openness snapshot">
    <div class="archive-format-card__header">
      <div>
        <p class="archive-format-card__eyebrow">Format openness snapshot</p>
        <h2>Archive formats</h2>
      </div>
      <div class="archive-format-card__legend" aria-hidden="true">
        <span class="archive-format-card__badge archive-format-card__badge--open">OPEN</span>
        <span class="archive-format-card__badge archive-format-card__badge--proprietary">PROPRIETARY</span>
      </div>
    </div>

    <ul class="archive-format-card__list">
      <li
        v-for="fmt in archiveFormats"
        :key="fmt.id"
        class="archive-format-card__row"
      >
        <div class="archive-format-card__row-head">
          <span class="archive-format-card__name">{{ fmt.name }}</span>
          <span class="archive-format-card__badges" :aria-label="`${fmt.name} badges`">
            <span
              v-for="badge in fmt.badges"
              :key="badge"
              class="archive-format-card__badge"
              :class="badgeClass(badge)"
            >
              {{ badgeText[badge] }}
            </span>
          </span>
        </div>
        <p class="archive-format-card__note">{{ fmt.openness }}</p>
      </li>
    </ul>

    <div class="archive-format-card__tip">
      <strong>Why RAR is read-only:</strong>
      <span>
        The RAR compression algorithm is closed. RARLAB's UnRAR is source-available but
        extract-only, and its license forbids using it to build a compatible encoder, so
        only the proprietary WinRAR/<code>rar</code> tool can create .rar. Every tool that
        opens RAR, AeroFTP included, is limited to extraction.
      </span>
    </div>

    <p class="archive-format-card__source">{{ nativeFormatsNote }}</p>
  </section>
</template>
