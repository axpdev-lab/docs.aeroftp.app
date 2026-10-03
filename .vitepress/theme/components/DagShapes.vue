<template>
  <figure class="dag-fig">
    <div class="dag-fig__frame">
      <svg viewBox="0 0 760 500" role="img" aria-label="Shaping: the builder reads the provider capabilities and the object size once, and fills the transfer-core slot of a fixed seven-node envelope with one of six shapes. Only the core nodes move bytes.">
        <defs>
          <marker id="dsh-ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head" /></marker>
          <marker id="dsh-ah-io" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="head-io" /></marker>
        </defs>

        <!-- Builder input -->
        <text x="20" y="16" class="t-cap">EVERY SHAPE</text>
        <text x="289" y="14" text-anchor="middle" class="t-s">capabilities + object size, read once</text>
        <line x1="289" y1="19" x2="289" y2="33" class="edge-io" marker-end="url(#dsh-ah-io)" />

        <!-- Envelope -->
        <rect x="20" y="34" width="72" height="36" rx="8" class="node" />
        <text x="56" y="57" text-anchor="middle" class="t">Discover</text>
        <rect x="112" y="34" width="72" height="36" rx="8" class="node" />
        <text x="148" y="57" text-anchor="middle" class="t">Acquire</text>
        <rect x="204" y="34" width="170" height="36" rx="8" class="slot" />
        <text x="289" y="51" text-anchor="middle" class="t-b t-io">transfer core</text>
        <text x="289" y="64" text-anchor="middle" class="t-xs">filled by the builder</text>
        <rect x="394" y="34" width="72" height="36" rx="8" class="node" />
        <text x="430" y="57" text-anchor="middle" class="t">Verify</text>
        <rect x="486" y="34" width="72" height="36" rx="8" class="node" />
        <text x="522" y="57" text-anchor="middle" class="t">Preserve</text>
        <rect x="578" y="34" width="72" height="36" rx="8" class="node" />
        <text x="614" y="57" text-anchor="middle" class="t">Commit</text>
        <rect x="670" y="34" width="72" height="36" rx="8" class="node" />
        <text x="706" y="57" text-anchor="middle" class="t">Emit</text>

        <line x1="92" y1="52" x2="111" y2="52" class="edge" marker-end="url(#dsh-ah)" />
        <line x1="184" y1="52" x2="203" y2="52" class="edge" marker-end="url(#dsh-ah)" />
        <line x1="374" y1="52" x2="393" y2="52" class="edge" marker-end="url(#dsh-ah)" />
        <line x1="466" y1="52" x2="485" y2="52" class="edge" marker-end="url(#dsh-ah)" />
        <line x1="558" y1="52" x2="577" y2="52" class="edge" marker-end="url(#dsh-ah)" />
        <line x1="650" y1="52" x2="669" y2="52" class="edge" marker-end="url(#dsh-ah)" />

        <text x="56" y="88" text-anchor="middle" class="t-xs">structural</text>
        <text x="148" y="88" text-anchor="middle" class="t-xs">structural</text>
        <text x="430" y="88" text-anchor="middle" class="t-xs">real on</text>
        <text x="430" y="102" text-anchor="middle" class="t-xs">durable multipart</text>
        <text x="522" y="88" text-anchor="middle" class="t-xs">restores mtime</text>
        <text x="522" y="102" text-anchor="middle" class="t-xs">on download</text>
        <text x="614" y="88" text-anchor="middle" class="t-xs">completes</text>
        <text x="614" y="102" text-anchor="middle" class="t-xs">multipart</text>
        <text x="706" y="88" text-anchor="middle" class="t-xs">terminal event</text>

        <!-- Fan-out from the core slot to the six shapes -->
        <line x1="289" y1="70" x2="289" y2="130" class="edge-io dashed" />
        <line x1="136" y1="130" x2="624" y2="130" class="edge-io dashed" />
        <line x1="136" y1="130" x2="136" y2="141" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <line x1="380" y1="130" x2="380" y2="141" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <line x1="624" y1="130" x2="624" y2="141" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <text x="298" y="121" class="t-s">becomes one of six shapes, chosen before the first byte</text>

        <!-- Card 1: single core -->
        <rect x="20" y="142" width="232" height="150" rx="10" class="card" />
        <text x="34" y="166" class="t-b">Single core</text>
        <text x="34" y="184" class="t-mono">below multipart threshold</text>
        <circle cx="46" cy="232" r="5" class="dot" />
        <line x1="51" y1="232" x2="69" y2="232" class="edge" marker-end="url(#dsh-ah)" />
        <rect x="70" y="212" width="120" height="40" rx="7" class="node-io" />
        <text x="130" y="229" text-anchor="middle" class="t-s t-io">DownloadFile</text>
        <text x="130" y="244" text-anchor="middle" class="t-xs">or UploadFile</text>
        <line x1="190" y1="232" x2="208" y2="232" class="edge" marker-end="url(#dsh-ah)" />
        <circle cx="214" cy="232" r="5" class="dot" />
        <text x="34" y="280" class="t-xs">one file slot, one channel</text>

        <!-- Card 2: multipart fan-out -->
        <rect x="264" y="142" width="232" height="150" rx="10" class="card" />
        <text x="278" y="166" class="t-b">Multipart fan-out</text>
        <text x="278" y="184" class="t-mono">parts may run in parallel</text>
        <circle cx="290" cy="231" r="5" class="dot" />
        <path d="M295,231 C314,231 314,204 333,204" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <path d="M295,231 C314,231 314,222 333,222" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <path d="M295,231 C314,231 314,240 333,240" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <path d="M295,231 C314,231 314,258 333,258" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <rect x="334" y="197" width="90" height="14" rx="4" class="node-io" />
        <rect x="334" y="215" width="90" height="14" rx="4" class="node-io" />
        <rect x="334" y="233" width="90" height="14" rx="4" class="node-io" />
        <rect x="334" y="251" width="90" height="14" rx="4" class="node-io" />
        <text x="379" y="208" text-anchor="middle" class="t-xs t-io">part 1</text>
        <text x="379" y="226" text-anchor="middle" class="t-xs t-io">part 2</text>
        <text x="379" y="244" text-anchor="middle" class="t-xs t-io">part 3</text>
        <text x="379" y="262" text-anchor="middle" class="t-xs t-io">part N</text>
        <path d="M424,204 C445,204 445,231 464,231" class="edge" />
        <path d="M424,222 C445,222 445,231 464,231" class="edge" />
        <path d="M424,240 C445,240 445,231 464,231" class="edge" />
        <path d="M424,258 C445,258 445,231 464,231" class="edge" />
        <circle cx="470" cy="231" r="5" class="dot" />
        <text x="278" y="280" class="t-xs">parallel only on independent workers</text>

        <!-- Card 3: ordered parts -->
        <rect x="508" y="142" width="232" height="150" rx="10" class="card" />
        <text x="522" y="166" class="t-b">Ordered parts</text>
        <text x="522" y="184" class="t-mono">parts must arrive in order</text>
        <circle cx="534" cy="232" r="5" class="dot" />
        <line x1="539" y1="232" x2="555" y2="232" class="edge" marker-end="url(#dsh-ah)" />
        <rect x="556" y="219" width="40" height="26" rx="6" class="node-io" />
        <text x="576" y="236.5" text-anchor="middle" class="t-s t-io">1</text>
        <line x1="596" y1="232" x2="609" y2="232" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <rect x="610" y="219" width="40" height="26" rx="6" class="node-io" />
        <text x="630" y="236.5" text-anchor="middle" class="t-s t-io">2</text>
        <line x1="650" y1="232" x2="663" y2="232" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <rect x="664" y="219" width="40" height="26" rx="6" class="node-io" />
        <text x="684" y="236.5" text-anchor="middle" class="t-s t-io">N</text>
        <line x1="704" y1="232" x2="718" y2="232" class="edge" marker-end="url(#dsh-ah)" />
        <circle cx="724" cy="232" r="5" class="dot" />
        <text x="522" y="280" class="t-xs">Google Drive, OneDrive, Yandex</text>

        <!-- Card 4: segmented download -->
        <rect x="20" y="306" width="232" height="150" rx="10" class="card" />
        <text x="34" y="330" class="t-b">Segmented download</text>
        <text x="34" y="348" class="t-mono">strict range download</text>
        <rect x="40" y="360" width="68" height="13" rx="4" class="node-io" />
        <rect x="40" y="378" width="68" height="13" rx="4" class="node-io" />
        <rect x="40" y="396" width="68" height="13" rx="4" class="node-io" />
        <rect x="40" y="414" width="68" height="13" rx="4" class="node-io" />
        <text x="74" y="370.5" text-anchor="middle" class="t-xs t-io">range 0</text>
        <text x="74" y="388.5" text-anchor="middle" class="t-xs t-io">range 1</text>
        <text x="74" y="406.5" text-anchor="middle" class="t-xs t-io">range 2</text>
        <text x="74" y="424.5" text-anchor="middle" class="t-xs t-io">range N</text>
        <line x1="108" y1="366.5" x2="147" y2="368.4" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <line x1="108" y1="384.5" x2="147" y2="385.1" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <line x1="108" y1="402.5" x2="147" y2="401.9" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <line x1="108" y1="420.5" x2="147" y2="418.6" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <rect x="148" y="360" width="64" height="16.75" class="node-io" />
        <rect x="148" y="376.75" width="64" height="16.75" class="node-io" />
        <rect x="148" y="393.5" width="64" height="16.75" class="node-io" />
        <rect x="148" y="410.25" width="64" height="16.75" class="node-io" />
        <text x="228" y="393.5" class="t-mono" transform="rotate(90 228 393.5)" text-anchor="middle">.aerotmp</text>
        <text x="34" y="444" class="t-xs">offset writes, one temp file</text>

        <!-- Card 5: server-side copy -->
        <rect x="264" y="306" width="232" height="150" rx="10" class="card" />
        <text x="278" y="330" class="t-b">Server-side copy</text>
        <text x="278" y="348" class="t-mono">server_side_copy</text>
        <rect x="314" y="362" width="132" height="28" rx="7" class="node-io" />
        <text x="380" y="380.5" text-anchor="middle" class="t-s t-io">ServerSideCopy</text>
        <text x="380" y="407" text-anchor="middle" class="t-xs">the server moves the data</text>
        <line x1="296" y1="424" x2="464" y2="424" class="edge dashed" />
        <rect x="344" y="415" width="72" height="18" rx="9" class="mask" />
        <text x="380" y="428" text-anchor="middle" class="t-xs">0 bytes</text>
        <text x="278" y="444" class="t-xs">one api slot, nothing else</text>

        <!-- Card 6: copy fallback -->
        <rect x="508" y="306" width="232" height="150" rx="10" class="card" />
        <text x="522" y="330" class="t-b">Copy fallback</text>
        <text x="522" y="348" class="t-mono">native copy rejected</text>
        <rect x="524" y="382" width="72" height="28" rx="7" class="node-io" />
        <text x="560" y="400.5" text-anchor="middle" class="t-s t-io">Download</text>
        <line x1="596" y1="396" x2="609" y2="396" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <rect x="610" y="386" width="30" height="20" rx="4" class="node" />
        <text x="625" y="400" text-anchor="middle" class="t-xs">tmp</text>
        <line x1="640" y1="396" x2="653" y2="396" class="edge-io" marker-end="url(#dsh-ah-io)" />
        <rect x="654" y="382" width="72" height="28" rx="7" class="node-io" />
        <text x="690" y="400.5" text-anchor="middle" class="t-s t-io">Upload</text>
        <text x="522" y="444" class="t-xs">two legs on your link</text>

        <!-- Legend -->
        <rect x="20" y="474" width="22" height="13" rx="3" class="node-io" />
        <text x="50" y="485" class="t-xs">moves bytes</text>
        <rect x="140" y="474" width="22" height="13" rx="3" class="node" />
        <text x="170" y="485" class="t-xs">control node, no payload</text>
        <circle cx="345" cy="480.5" r="5" class="dot" />
        <text x="358" y="485" class="t-xs">envelope neighbours</text>
        <rect x="500" y="474" width="22" height="13" rx="3" class="slot" />
        <text x="530" y="485" class="t-xs">slot the builder fills</text>
      </svg>
    </div>
    <figcaption>
      <slot><strong>Shaping.</strong> Before the first byte moves, the builder reads the provider's capabilities and the object size and fills the transfer-core slot with one of six shapes. The envelope around it is the same for every shape, and only the blue nodes move payload. The grey dots stand for the envelope nodes on either side of the core (Acquire before it, Verify after it).</slot>
    </figcaption>
  </figure>
</template>
