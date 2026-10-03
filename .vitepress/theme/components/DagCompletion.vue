<template>
  <figure class="dag-fig">
    <div class="dag-fig__frame">
      <svg viewBox="0 0 760 356" role="img" aria-label="Completion on the durable single-file multipart path: the first part opens the session, each part's receipt is written to a checkpoint before the part completes, VerifyChecksum records Verified only when every receipt is present and the source is unchanged, and CommitTemp completes the upload only after Verified. A failure keeps the session and receipts so a restart sends only the missing parts.">
        <defs>
          <marker id="dco-ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head" /></marker>
          <marker id="dco-ah-io" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-io" /></marker>
          <marker id="dco-ah-warn" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-warn" /></marker>
          <marker id="dco-ah-ok" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-ok" /></marker>
        </defs>

        <!-- Durable state machine -->
        <text x="24" y="14" class="t-cap">DURABLE STATE</text>
        <rect x="24" y="22" width="92" height="26" rx="13" class="node" />
        <text x="70" y="39" text-anchor="middle" class="t-s">Prepared</text>
        <rect x="160" y="22" width="100" height="26" rx="13" class="node" />
        <text x="210" y="39" text-anchor="middle" class="t-s">Transferring</text>
        <rect x="288" y="22" width="120" height="26" rx="13" class="node" />
        <text x="348" y="39" text-anchor="middle" class="t-s">PayloadComplete</text>
        <rect x="431" y="22" width="88" height="26" rx="13" class="node-ok" />
        <text x="475" y="39" text-anchor="middle" class="t-s t-ok">Verified</text>
        <rect x="562" y="22" width="96" height="26" rx="13" class="node-ok" />
        <text x="610" y="39" text-anchor="middle" class="t-s t-ok">Committed</text>
        <line x1="116" y1="35" x2="159" y2="35" class="edge" marker-end="url(#dco-ah)" />
        <line x1="260" y1="35" x2="287" y2="35" class="edge" marker-end="url(#dco-ah)" />
        <line x1="408" y1="35" x2="430" y2="35" class="edge" marker-end="url(#dco-ah)" />
        <line x1="519" y1="35" x2="561" y2="35" class="edge-ok" marker-end="url(#dco-ah-ok)" />

        <!-- Guides from states to graph phases -->
        <line x1="70" y1="48" x2="70" y2="118" class="edge dashed" stroke-opacity="0.45" />
        <line x1="210" y1="48" x2="210" y2="102" class="edge dashed" stroke-opacity="0.45" />
        <line x1="348" y1="48" x2="348" y2="148" class="edge dashed" stroke-opacity="0.45" />
        <line x1="475" y1="48" x2="475" y2="122" class="edge dashed" stroke-opacity="0.45" />
        <line x1="610" y1="48" x2="610" y2="122" class="edge dashed" stroke-opacity="0.45" />

        <!-- Begin -->
        <rect x="24" y="124" width="92" height="52" rx="8" class="node" />
        <text x="70" y="144" text-anchor="middle" class="t-b">begin</text>
        <text x="70" y="160" text-anchor="middle" class="t-xs">opened by</text>
        <text x="70" y="172" text-anchor="middle" class="t-xs">the first part</text>

        <!-- Parts -->
        <path d="M116,150 C138,150 138,119 159,119" class="edge-io" marker-end="url(#dco-ah-io)" />
        <path d="M116,150 C138,150 138,144 159,144" class="edge-io" marker-end="url(#dco-ah-io)" />
        <path d="M116,150 C138,150 138,169 159,169" class="edge-io" marker-end="url(#dco-ah-io)" />
        <path d="M116,150 C138,150 138,194 159,194" class="edge-io" marker-end="url(#dco-ah-io)" />
        <rect x="160" y="110" width="100" height="18" rx="5" class="node-io" />
        <rect x="160" y="135" width="100" height="18" rx="5" class="node-io" />
        <rect x="160" y="160" width="100" height="18" rx="5" class="node-io" />
        <rect x="160" y="185" width="100" height="18" rx="5" class="node-io" />
        <text x="210" y="123" text-anchor="middle" class="t-xs t-io">part 1</text>
        <text x="210" y="148" text-anchor="middle" class="t-xs t-io">part 2</text>
        <text x="210" y="173" text-anchor="middle" class="t-xs t-io">part 3</text>
        <text x="210" y="198" text-anchor="middle" class="t-xs t-io">part N</text>

        <!-- Converge to PayloadComplete -->
        <path d="M260,119 C305,119 305,156 343,156" class="edge" />
        <path d="M260,144 C305,144 305,156 343,156" class="edge" />
        <path d="M260,169 C305,169 305,156 343,156" class="edge" />
        <path d="M260,194 C305,194 305,156 343,156" class="edge" />
        <circle cx="348" cy="156" r="5" class="dot" />
        <line x1="353" y1="156" x2="409" y2="156" class="edge" marker-end="url(#dco-ah)" />

        <!-- Verify -->
        <rect x="410" y="126" width="130" height="60" rx="8" class="node" />
        <text x="475" y="146" text-anchor="middle" class="t-b">VerifyChecksum</text>
        <text x="475" y="162" text-anchor="middle" class="t-xs">receipts complete</text>
        <text x="475" y="176" text-anchor="middle" class="t-xs">source unchanged</text>
        <line x1="540" y1="156" x2="559" y2="156" class="edge-ok" marker-end="url(#dco-ah-ok)" />

        <!-- Commit -->
        <rect x="560" y="126" width="100" height="60" rx="8" class="node" />
        <text x="610" y="146" text-anchor="middle" class="t-b">CommitTemp</text>
        <text x="610" y="162" text-anchor="middle" class="t-xs">completes,</text>
        <text x="610" y="176" text-anchor="middle" class="t-xs">only if Verified</text>
        <line x1="660" y1="156" x2="679" y2="156" class="edge-ok" marker-end="url(#dco-ah-ok)" />

        <!-- Live -->
        <rect x="680" y="136" width="60" height="40" rx="8" class="node-ok" />
        <text x="710" y="153" text-anchor="middle" class="t-xs t-ok">object</text>
        <text x="710" y="167" text-anchor="middle" class="t-xs t-ok">live</text>

        <!-- Checkpoint -->
        <path d="M300,240 V284 A48,8 0 0 0 396,284 V240" class="node" />
        <ellipse cx="348" cy="240" rx="48" ry="8" class="node" />
        <text x="348" y="266" text-anchor="middle" class="t-s" font-weight="600">checkpoint</text>
        <text x="348" y="281" text-anchor="middle" class="t-xs">on disk</text>
        <path d="M252,204 C262,224 280,236 302,242" class="edge-io" marker-end="url(#dco-ah-io)" />
        <text x="272" y="222" class="t-xs t-io">receipts</text>
        <path d="M394,244 C440,244 475,226 475,188" class="edge" marker-end="url(#dco-ah)" />
        <text x="484" y="230" class="t-xs">read by Verify</text>

        <!-- Failure -->
        <path d="M160,197 C126,204 112,246 112,288" class="edge-warn dashed" marker-end="url(#dco-ah-warn)" />
        <rect x="24" y="290" width="236" height="56" rx="8" class="node-warn" />
        <text x="36" y="309" class="t-s t-warn" font-weight="600">failure or cancel</text>
        <text x="36" y="324" class="t-xs">session and receipts are kept;</text>
        <text x="36" y="338" class="t-xs">a restart sends only missing parts</text>

        <text x="740" y="318" text-anchor="end" class="t-xs">An expired session is aborted by a TTL scavenger;</text>
        <text x="740" y="332" text-anchor="end" class="t-xs">its record goes only after the abort succeeds.</text>
      </svg>
    </div>
    <figcaption>
      <slot><strong>Completion, durable single-file multipart.</strong> Each part's receipt reaches the checkpoint before the part completes. VerifyChecksum records Verified only when every receipt is present and the local source is unchanged, and CommitTemp completes the upload only after that fact exists. A failure keeps the session and the receipts, so a restart sends only the missing parts. Multipart inside a batch follows its own begin, complete and abort lifecycle without this checkpoint.</slot>
    </figcaption>
  </figure>
</template>
