---
layout: page
sidebar: false
aside: false
outline: false
title: Community Benchmark
description: Performance benchmarks of AeroFTP across cloud providers, contributed by the community
---

<div class="test-reports">

<ul class="breadcrumb">
  <li class="breadcrumb-item"><a href="/test-reports/">Test Reports</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><span class="current">Community Benchmark</span></li>
</ul>

# Community Benchmark

Performance numbers, not capability checks. Each round measures real upload, download, list, stat and delete throughput across cloud providers, with statistical aggregates (p50, p95, stddev, min, max) over multiple runs.

The community benchmark is a separate workflow from the integration tests in this section: those check whether a feature works at all on a given backend, the benchmark measures how fast it works once it does. The two answer different questions and live side by side.

## Open issue and submission flow

[axpdev-lab/aeroftp#177](https://github.com/axpdev-lab/aeroftp/issues/177) is the live submission point. The CLI ships `aeroftp-cli benchmark` since v3.7.3 (stabilized in v3.7.4) with strict sanitization: no hostnames, paths, credentials, bucket names, or account ids ever enter the JSON report.

Anyone can contribute their own region and connection type by running:

```bash
aeroftp-cli --profile "Your Profile" benchmark standard \
  --consent-publish --report bench.json
```

Then pasting the JSON between the BEGIN / END markers into a comment on the issue.

## Rounds

| Round | CLI version | Profiles covered | Status |
|-------|------------|------------------|--------|
| [2026-05-07 (maintainer baseline)](./2026-05-07) | v3.7.3 / v3.7.4 | 35 sanitized reports (27 full matrix + 5 partial + 3 verify) | published |

## Why the page exists

When AeroFTP claims that one protocol is faster than another on a given provider, that claim should be defensible. A single residential fiber line in a single timezone is not a credible base for a public protocol comparison page. Selection bias in the maintainer baseline is explicit and called out in each round's disclosure section. Real conclusions only come from aggregating across at least three regions and two connection types.

</div>
