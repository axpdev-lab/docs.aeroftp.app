<template>
  <figure class="dag-fig">
    <div class="dag-fig__frame">
      <svg viewBox="0 0 760 330" role="img" aria-label="Dispatch: a ready node starts only when the operation's resource budget and the AIMD target for its class both allow it. The channels behind them are fixed by the provider's session ceiling. With AIMD enabled (the default), congestion signals from the endpoint halve the width and each quiet window adds the regrowth step back (one by default), never above the ceiling.">
        <defs>
          <marker id="ddp-ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head" /></marker>
          <marker id="ddp-ah-io" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-io" /></marker>
          <marker id="ddp-ah-warn" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-warn" /></marker>
          <marker id="ddp-ah-ok" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-ok" /></marker>
        </defs>

        <!-- Column headers -->
        <text x="20" y="24" class="t-cap">1 · READY</text>
        <text x="170" y="24" class="t-cap">2 · BUDGET</text>
        <text x="340" y="24" class="t-cap">3 · ADAPTIVE</text>
        <text x="510" y="24" class="t-cap">CHANNELS</text>
        <text x="672" y="24" class="t-cap">ENDPOINT</text>

        <!-- 1. Ready frontier -->
        <rect x="20" y="40" width="132" height="170" rx="10" class="node" />
        <rect x="30" y="54" width="112" height="20" rx="5" class="node-io" />
        <text x="86" y="68" text-anchor="middle" class="t-xs t-io">UploadPart 4</text>
        <rect x="30" y="80" width="112" height="20" rx="5" class="node-io" />
        <text x="86" y="94" text-anchor="middle" class="t-xs t-io">UploadPart 5</text>
        <rect x="30" y="106" width="112" height="20" rx="5" class="node-io" />
        <text x="86" y="120" text-anchor="middle" class="t-xs t-io">DownloadFile</text>
        <rect x="30" y="132" width="112" height="20" rx="5" class="node-io" />
        <text x="86" y="146" text-anchor="middle" class="t-xs t-io">DownloadRange 2</text>
        <rect x="30" y="158" width="112" height="20" rx="5" class="ghost" />
        <text x="86" y="172" text-anchor="middle" class="t-xs">…</text>
        <text x="86" y="200" text-anchor="middle" class="t-xs">≤ 256 tasks resident</text>
        <text x="86" y="228" text-anchor="middle" class="t-xs">predecessors finished</text>

        <line x1="152" y1="125" x2="169" y2="125" class="edge" marker-end="url(#ddp-ah)" />

        <!-- 2. Resource manager -->
        <rect x="170" y="40" width="152" height="170" rx="10" class="node" />
        <text x="246" y="62" text-anchor="middle" class="t-b">Resources</text>
        <text x="246" y="84" text-anchor="middle" class="t-xs">file · chunk · http</text>
        <text x="246" y="99" text-anchor="middle" class="t-xs">api · checker · hash</text>
        <text x="246" y="114" text-anchor="middle" class="t-xs">disk read · disk write</text>
        <text x="246" y="129" text-anchor="middle" class="t-xs">buffer-byte credits</text>
        <line x1="188" y1="142" x2="304" y2="142" class="edge" stroke-opacity="0.5" />
        <text x="246" y="160" text-anchor="middle" class="t-xs">a node waits until</text>
        <text x="246" y="175" text-anchor="middle" class="t-xs">its request fits</text>
        <text x="246" y="200" text-anchor="middle" class="t-xs">per operation</text>

        <line x1="322" y1="125" x2="339" y2="125" class="edge" marker-end="url(#ddp-ah)" />

        <!-- 3. AIMD -->
        <rect x="340" y="40" width="152" height="170" rx="10" class="node" />
        <text x="416" y="62" text-anchor="middle" class="t-b">AIMD target</text>
        <text x="416" y="84" text-anchor="middle" class="t-xs">one per class:</text>
        <text x="416" y="99" text-anchor="middle" class="t-xs">file · chunk</text>
        <text x="416" y="114" text-anchor="middle" class="t-xs">http · api</text>
        <line x1="358" y1="127" x2="474" y2="127" class="edge" stroke-opacity="0.5" />
        <text x="416" y="145" text-anchor="middle" class="t-xs">starts at the ceiling,</text>
        <text x="416" y="160" text-anchor="middle" class="t-xs">lower if this endpoint</text>
        <text x="416" y="175" text-anchor="middle" class="t-xs">congested recently</text>
        <text x="416" y="200" text-anchor="middle" class="t-xs">capped at the ceiling</text>

        <line x1="492" y1="125" x2="509" y2="125" class="edge-io" marker-end="url(#ddp-ah-io)" />

        <!-- Channels -->
        <rect x="510" y="64" width="120" height="118" rx="12" class="ghost" />
        <line x1="520" y1="86" x2="671" y2="86" class="edge" marker-end="url(#ddp-ah)" />
        <line x1="520" y1="110" x2="671" y2="110" class="edge" marker-end="url(#ddp-ah)" />
        <line x1="520" y1="134" x2="671" y2="134" class="edge" marker-end="url(#ddp-ah)" />
        <line x1="520" y1="158" x2="671" y2="158" class="edge" marker-end="url(#ddp-ah)" />
        <rect x="532" y="82" width="16" height="8" rx="2" class="fill-io" />
        <rect x="592" y="82" width="16" height="8" rx="2" class="fill-io" />
        <rect x="558" y="106" width="16" height="8" rx="2" class="fill-io" />
        <rect x="526" y="130" width="16" height="8" rx="2" class="fill-io" />
        <rect x="604" y="130" width="16" height="8" rx="2" class="fill-io" />
        <rect x="574" y="154" width="16" height="8" rx="2" class="fill-io" />
        <text x="570" y="200" text-anchor="middle" class="t-xs">session pool,</text>
        <text x="570" y="214" text-anchor="middle" class="t-xs">fixed width</text>

        <!-- Endpoint -->
        <rect x="672" y="64" width="68" height="118" rx="10" class="node" />
        <rect x="688" y="82" width="36" height="9" rx="2" class="fill-mute" />
        <rect x="688" y="96" width="36" height="9" rx="2" class="fill-mute" />
        <rect x="688" y="110" width="36" height="9" rx="2" class="fill-mute" />
        <text x="706" y="143" text-anchor="middle" class="t-b">server</text>
        <text x="706" y="159" text-anchor="middle" class="t-xs">and link</text>

        <!-- Feedback: congestion (amber) and recovery (green) -->
        <path d="M690,182 V240 H416 V212" class="edge-warn" marker-end="url(#ddp-ah-warn)" />
        <text x="560" y="233" text-anchor="middle" class="t-s t-warn">429 · 503 · 421 · timeout · reset</text>
        <text x="556" y="258" text-anchor="middle" class="t-xs t-warn">width ÷ 2; a Retry-After also pauses regrowth</text>
        <path d="M722,182 V292 H386 V212" class="edge-ok" marker-end="url(#ddp-ah-ok)" />
        <text x="560" y="285" text-anchor="middle" class="t-s t-ok">quiet window: +1, up to the ceiling</text>

        <!-- Notes -->
        <text x="20" y="262" class="t-xs">Not a load signal (wrong path, permission,</text>
        <text x="20" y="276" class="t-xs">authentication): the width stays as it is.</text>
        <text x="20" y="302" class="t-xs">ceiling = min(provider sessions, --parallel)</text>
        <text x="20" y="318" class="t-mono">SFTP 16 · WebDAV 8 · FTP 5 · HTTP clouds 4</text>
      </svg>
    </div>
    <figcaption>
      <slot><strong>Dispatch.</strong> A ready node starts only when the operation's resource budget and the AIMD target for its class both have room. The channels behind them are fixed by the provider's session ceiling. With AIMD enabled (the default), a congestion signal halves the width and each quiet stretch adds the regrowth step back (one by default); nothing raises it past the ceiling.</slot>
    </figcaption>
  </figure>
</template>
