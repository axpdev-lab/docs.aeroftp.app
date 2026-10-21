---
title: Proton Drive CLI Bulk Benchmark, October 2026
description: "Measured Proton CLI bulk transfers: AeroFTP's shared transfer engine against the official CLI, with per-file verification and raw timing samples."
---

# Proton Drive CLI Bulk Benchmark

On 20 October 2026, AeroFTP's bulk adapter for the official Proton Drive CLI transferred 200 small files in substantially less time than the previous per-file mechanism. The download median was close to the direct official CLI; the upload median remained higher.

These measurements cover **AeroFTP's CLI compatibility mode**, whose bulk support shipped in v4.2.4. They do not measure AeroFTP's native API client or Proton's desktop GUI. rclone was not part of this run.

## Setup and Method

| Item | Recorded value |
| ---- | -------------- |
| Date | 2026-10-20 |
| Platform | Linux x86_64 |
| AeroFTP wrapper | Debug build, source commit `b9e449558a83d87253896f79fba9767ed11cd334` |
| Official Proton CLI | `cli-drive@0.9.0+75612299` |
| Proton JavaScript SDK | `js@0.22.2+75612299` |
| Payload | 200 distinct files of 4 KiB, 819,200 bytes total |
| Repeated runs | Three alternating official-CLI / AeroFTP bulk pairs, executed sequentially on the same account |
| Previous mechanism | One run through the existing single-file adapter with four workers |
| Integrity | All seven downloads compared byte for byte with the source |

The previous-mechanism baseline exercises the old per-file wrapper path directly. It is not a timed checkout of an older release. The three bulk runs measure the shared transfer engine and adapter, rather than the complete `aeroftp-cli` command startup.

The official upload passes all 200 explicit source files in one invocation. Its download passes the complete fixture folder. AeroFTP's bulk download passes only the 200 selected node UIDs. The fixture contains no unselected siblings, so both download the same files. Production bulk downloads retain the user's selection.

Other gateway measurements ran concurrently on an independent Filen account. No second Proton contender ran concurrently. The generated Proton fixture was permanently removed after the completed runs.

## Results

Seconds, lower is better. Brackets show the minimum and maximum of the three repeated runs.

| Direction | Previous per-file mechanism, one run | AeroFTP bulk, median [range] | Official CLI, median [range] |
| --------- | ----------------------------------: | --------------------------: | --------------------------: |
| Upload | 123.61 | 24.36 [16.03–28.05] | 18.97 [17.78–20.14] |
| Download | 135.03 | 22.13 [21.00–23.69] | 22.89 [22.59–31.86] |

Relative to the single baseline run, bulk took about one fifth of the upload time and one sixth of the download time. Three pairs on one account do not establish a general speedup or exact parity. The bulk upload median was about 28% higher than the official CLI median; cloud variability and this small sample do not establish a stable residual overhead.

Every measured upload was followed by a byte-identical download. That readback confirms the tested content; upload acknowledgement alone is not an independent durability measurement.

### Separate Whole-command Smoke Test

A later end-to-end CLI check transferred the same count and size of files in **25.36 s uploading** and **21.93 s downloading**, with no transfer errors, zero reported transfer retries, byte-identical readback and scoped cleanup. This is one whole-command sample, including setup, and is separate from the repeated adapter measurements above. See the [published validation note](https://github.com/axpdev-lab/aeroftp/pull/1317#issuecomment-6290420823).

## Reproduce

The opt-in live test requires an authenticated official CLI and a quiet window on the test account. It creates a UUID-named fixture, verifies its downloads and permanently removes its own fixture. Let it finish so its cleanup can run.

```bash
AEROFTP_BULK_LIVE=1 AEROFTP_BULK_BENCH_OUTPUT=/tmp/proton-bulk.json \
  cargo test --lib providers::proton::cli_sequence_tests::bulk_live_benchmark \
  -- --exact --ignored --nocapture
```

Run from AeroFTP's `src-tauri` directory. This reproduces the adapter comparison; it is separate from a comparison of installed release binaries or native API mode.

## Evidence and Related Guides

- [Raw timing samples and environment](/benchmarks/2026-10-20-proton-bulk.json)
- [Bulk transfer contract and original report](https://github.com/axpdev-lab/aeroftp/blob/v4.2.4/docs/PROVIDER-BULK-TRANSFERS.md)
- [Implementation and validation, PR #1317](https://github.com/axpdev-lab/aeroftp/pull/1317)
- [Proton Drive setup: native API and official CLI](/providers/proton-drive)
- [Comparative benchmark methodology](/test-reports/methodology#comparative-benchmarks)
