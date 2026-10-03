<template>
  <figure class="dag-fig">
    <div class="dag-fig__frame">
      <svg viewBox="0 0 760 286" role="img" aria-label="AIMD over time, schematic: the width starts at the effective ceiling, halves on a congestion signal, grows by one per quiet window, stays one below the level that failed until the recovery window has passed, and does not regrow during a Retry-After cooldown.">
        <defs>
          <marker id="dam-ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head" /></marker>
        </defs>

        <!-- Axes -->
        <line x1="64" y1="228" x2="740" y2="228" class="edge" marker-end="url(#dam-ah)" />
        <line x1="64" y1="228" x2="64" y2="40" class="edge" marker-end="url(#dam-ah)" />
        <text x="72" y="40" class="t-xs">files or parts in flight</text>
        <text x="740" y="246" text-anchor="end" class="t-xs">time</text>
        <text x="56" y="72" text-anchor="end" class="t-xs">8</text>
        <text x="56" y="152" text-anchor="end" class="t-xs">4</text>
        <line x1="60" y1="148" x2="64" y2="148" class="edge" />

        <!-- Guard band: regrowth capped one below the level that failed -->
        <rect x="170" y="68" width="290" height="20" class="node-warn" style="stroke: none" />
        <text x="315" y="82" text-anchor="middle" class="t-xs t-warn">guard: one below the level that failed</text>

        <!-- Retry-After cooldown -->
        <rect x="540" y="148" width="80" height="80" class="node-warn" style="stroke: none" />
        <text x="580" y="184" text-anchor="middle" class="t-xs t-warn">Retry-After</text>
        <text x="580" y="198" text-anchor="middle" class="t-xs t-warn">no regrowth</text>

        <!-- Ceiling -->
        <line x1="64" y1="68" x2="736" y2="68" class="edge dashed" />
        <text x="736" y="62" text-anchor="end" class="t-xs">effective ceiling</text>

        <!-- Width over time -->
        <path d="M64,68 H170 V148 H230 V128 H290 V108 H350 V88 H460 V68 H540 V148 H620 V128 H680 V108 H736" class="edge-io" stroke-width="2.5" stroke-linejoin="round" />

        <!-- Events -->
        <circle cx="170" cy="68" r="5" class="fill-warn" />
        <text x="170" y="56" text-anchor="middle" class="t-xs t-warn">429</text>
        <text x="178" y="116" class="t-s t-warn">÷ 2</text>
        <circle cx="540" cy="68" r="5" class="fill-warn" />
        <text x="540" y="56" text-anchor="middle" class="t-xs t-warn">503 + Retry-After</text>
        <text x="548" y="116" class="t-s t-warn">÷ 2</text>

        <!-- Labels on the curve -->
        <text x="72" y="100" class="t-xs">start: ceiling</text>
        <text x="236" y="172" class="t-xs t-io">+1 per quiet window</text>
        <text x="470" y="100" class="t-xs">recovered</text>

        <!-- Recovery window bracket -->
        <path d="M170,240 V246 H460 V240" class="edge" />
        <text x="315" y="262" text-anchor="middle" class="t-xs">recovery window</text>

        <text x="740" y="280" text-anchor="end" class="t-xs">schematic, not a measurement</text>
      </svg>
    </div>
    <figcaption>
      <slot><strong>Adapting, schematic.</strong> The controller starts at the effective ceiling and only moves below it. A congestion signal halves the width and each quiet window adds one back. Regrowth stops one below the level that failed until the recovery window has passed, and a server's Retry-After holds regrowth for its cooldown.</slot>
    </figcaption>
  </figure>
</template>
