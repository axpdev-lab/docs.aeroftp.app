<template>
  <figure class="dag-fig">
    <div class="dag-fig__frame">
      <svg viewBox="0 0 760 356" role="img" aria-label="Many files: work items stream from the source into a bounded backlog that pauses the source when full, then into a bounded active set where each admitted file gets its own subgraph, dropped when the file is done. Every job also draws from one process-wide governor that shares endpoint slots, the speed limit, part memory and disk slots.">
        <defs>
          <marker id="dfr-ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head" /></marker>
          <marker id="dfr-ah-io" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-io" /></marker>
          <marker id="dfr-ah-warn" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-warn" /></marker>
        </defs>

        <!-- Headers -->
        <text x="20" y="20" class="t-cap">SOURCE</text>
        <text x="168" y="20" class="t-cap">BACKLOG</text>
        <text x="330" y="20" class="t-cap">ACTIVE SET</text>
        <text x="604" y="20" class="t-cap">DONE</text>

        <!-- Backpressure: full backlog pauses the source -->
        <path d="M237,52 V40 H80 V51" class="edge-warn dashed" marker-end="url(#dfr-ah-warn)" />
        <text x="158" y="35" text-anchor="middle" class="t-xs t-warn">full: pauses the source</text>

        <!-- Source -->
        <rect x="20" y="52" width="120" height="110" rx="10" class="node" />
        <text x="80" y="76" text-anchor="middle" class="t-b">Work source</text>
        <text x="80" y="100" text-anchor="middle" class="t-xs">batch: entry list</text>
        <text x="80" y="115" text-anchor="middle" class="t-xs">sync: the plan</text>
        <text x="80" y="142" text-anchor="middle" class="t-xs">items stream out</text>
        <line x1="140" y1="107" x2="167" y2="107" class="edge" marker-end="url(#dfr-ah)" />

        <!-- Backlog -->
        <rect x="168" y="52" width="138" height="110" rx="10" class="node" />
        <rect x="184" y="64" width="106" height="12" rx="3" class="ghost" />
        <rect x="184" y="81" width="106" height="12" rx="3" class="ghost" />
        <rect x="184" y="98" width="106" height="12" rx="3" class="ghost" />
        <rect x="184" y="115" width="106" height="12" rx="3" class="ghost" />
        <rect x="184" y="132" width="106" height="12" rx="3" class="ghost" />
        <text x="237" y="180" text-anchor="middle" class="t-xs">≤ 10,000 items</text>
        <text x="237" y="195" text-anchor="middle" class="t-mono">--max-backlog</text>
        <line x1="306" y1="107" x2="329" y2="107" class="edge" marker-end="url(#dfr-ah)" />

        <!-- Active set -->
        <rect x="330" y="52" width="250" height="170" rx="10" class="node" />
        <text x="344" y="72" class="t-xs">file slots + small headroom</text>

        <text x="344" y="105" class="t-mono">a.txt</text>
        <circle cx="414" cy="101" r="4.5" class="dot" />
        <line x1="418.5" y1="101" x2="433" y2="101" class="edge" marker-end="url(#dfr-ah)" />
        <rect x="434" y="91" width="86" height="20" rx="5" class="node-io" />
        <text x="477" y="105" text-anchor="middle" class="t-xs t-io">UploadFile</text>
        <line x1="520" y1="101" x2="537" y2="101" class="edge" marker-end="url(#dfr-ah)" />
        <circle cx="542" cy="101" r="4.5" class="dot" />

        <text x="344" y="150" class="t-mono">b.iso</text>
        <circle cx="414" cy="146" r="4.5" class="dot" />
        <path d="M418.5,146 C430,146 430,133 445,133" class="edge-io" marker-end="url(#dfr-ah-io)" />
        <path d="M418.5,146 C430,146 430,146 445,146" class="edge-io" marker-end="url(#dfr-ah-io)" />
        <path d="M418.5,146 C430,146 430,159 445,159" class="edge-io" marker-end="url(#dfr-ah-io)" />
        <rect x="446" y="128" width="62" height="10" rx="3" class="node-io" />
        <rect x="446" y="141" width="62" height="10" rx="3" class="node-io" />
        <rect x="446" y="154" width="62" height="10" rx="3" class="node-io" />
        <path d="M508,133 C524,133 524,146 537.5,146" class="edge" />
        <path d="M508,146 C524,146 524,146 537.5,146" class="edge" />
        <path d="M508,159 C524,159 524,146 537.5,146" class="edge" />
        <circle cx="542" cy="146" r="4.5" class="dot" />

        <text x="344" y="195" class="t-mono">c.mp4</text>
        <circle cx="414" cy="191" r="4.5" class="dot" />
        <line x1="418.5" y1="191" x2="433" y2="191" class="edge" marker-end="url(#dfr-ah)" />
        <rect x="434" y="181" width="86" height="20" rx="5" class="node-io" />
        <text x="477" y="195" text-anchor="middle" class="t-xs t-io">DownloadFile</text>
        <line x1="520" y1="191" x2="537" y2="191" class="edge" marker-end="url(#dfr-ah)" />
        <circle cx="542" cy="191" r="4.5" class="dot" />

        <line x1="580" y1="137" x2="603" y2="137" class="edge" marker-end="url(#dfr-ah)" />

        <!-- Done -->
        <rect x="604" y="52" width="136" height="170" rx="10" class="ghost" />
        <circle cx="630" cy="92" r="4.5" class="dot" opacity="0.5" />
        <rect x="644" y="83" width="52" height="18" rx="5" class="ghost" />
        <circle cx="712" cy="92" r="4.5" class="dot" opacity="0.5" />
        <text x="672" y="124" text-anchor="middle" class="t-xs">subgraph dropped</text>
        <text x="672" y="152" text-anchor="middle" class="t-xs">sync deletions start</text>
        <text x="672" y="166" text-anchor="middle" class="t-xs">after the last transfer</text>
        <text x="672" y="194" text-anchor="middle" class="t-xs t-warn">a failure stays local:</text>
        <text x="672" y="208" text-anchor="middle" class="t-xs t-warn">the other files go on</text>

        <!-- Governor -->
        <line x1="455" y1="222" x2="455" y2="265" class="edge" marker-end="url(#dfr-ah)" marker-start="url(#dfr-ah)" />
        <text x="463" y="248" class="t-xs">each job draws from it</text>
        <rect x="20" y="266" width="720" height="80" rx="12" class="node" />
        <text x="34" y="286" class="t-cap">PROCESS-WIDE GOVERNOR, SHARED BY EVERY JOB</text>
        <text x="726" y="286" text-anchor="end" class="t-xs">foreground first; background after 8 bypasses</text>
        <rect x="32" y="296" width="166" height="40" rx="7" class="card" />
        <text x="44" y="313" class="t-s" font-weight="600">Endpoint lease</text>
        <text x="44" y="328" class="t-xs">256 jobs per endpoint</text>
        <rect x="210" y="296" width="166" height="40" rx="7" class="card" />
        <text x="222" y="313" class="t-s" font-weight="600">Bandwidth bucket</text>
        <text x="222" y="328" class="t-xs">one --limit-rate for all jobs</text>
        <rect x="388" y="296" width="166" height="40" rx="7" class="card" />
        <text x="400" y="313" class="t-s" font-weight="600">Part memory pool</text>
        <text x="400" y="328" class="t-xs">multipart buffers, shared</text>
        <rect x="566" y="296" width="162" height="40" rx="7" class="card" />
        <text x="578" y="313" class="t-s" font-weight="600">Disk slots</text>
        <text x="578" y="328" class="t-xs">per device, 8 each way</text>
      </svg>
    </div>
    <figcaption>
      <slot><strong>Many files.</strong> Only files admitted into the active set exist as graphs: each subgraph is built on admission and dropped when the file is done, so resident graph memory follows the active window, not the size of the job. Every job also draws from one process-wide governor, so concurrent jobs share endpoint slots, the speed limit, part memory and disk.</slot>
    </figcaption>
  </figure>
</template>
