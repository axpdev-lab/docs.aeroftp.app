# Self-Hosted Continuous Audit

AeroFTP runs its own vulnerability audit pipeline that does not depend on any vendor SaaS. The pipeline aggregates three independent advisory databases and cross-references findings against a documented suppression list with written rationales for every accepted advisory.

The script and the suppression list are part of the repository, run identically on any developer machine and in CI, and produce a self-contained HTML report that any reviewer can verify by re-running the same command.

## Run It Yourself

```bash
git clone https://github.com/axpdev-lab/aeroftp.git
cd aeroftp
npm install
npm run security:report          # generates docs/security/security-report-latest.html
npm run security:report -- --json    # adds machine-readable JSON
npm run security:report -- --open    # opens the report in the default browser
```

The last HTML file committed on `main` is [`docs/security/security-report-latest.html`](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/docs/security/security-report-latest.html). It was generated on 21 June 2026 for version 4.0.7. It is not a scan of 4.2.6 or of current `main`.

## Sources

| Source | Database | Coverage |
| ------ | -------- | -------- |
| `cargo audit` | [RustSec advisory DB](https://rustsec.org/) | Rust crates in `src-tauri/Cargo.lock` |
| `npm audit` | npm registry | Production Node dependencies (`package-lock.json` `--omit=dev`) |
| `osv-scanner` | [Google OSV](https://osv.dev/) | Cross-ecosystem GHSA / CVE / RUSTSEC; catches GHSA-only advisories that do not yet land in RustSec |

The three sources do not fully overlap. `osv-scanner` is the broadest because it cross-references multiple advisory databases, but it does not respect Rust-specific suppression configuration. The script handles that by parsing `src-tauri/.cargo/audit.toml` directly and splitting `osv-scanner` findings into two buckets: **open** (require action) and **suppressed** (require written rationale already present in `audit.toml`).

## Suppression List

Every accepted advisory lives in [`src-tauri/.cargo/audit.toml`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/.cargo/audit.toml) with an inline rationale. That file on `main` is the list to read. A reviewer can accept an entry or object to that entry. An advisory is not ignored without a written justification in the file.

On `main` at `aa0e477` (5 November 2026) the ignore list has 33 IDs. The newest review note inside the file is 24 October 2026. This page does not copy those rationales. Groups the file still documents include the Marvin RSA advisory (RUSTSEC-2023-0071), the unmaintained GTK3 and WebKitGTK stack, build-only Tauri crates, the two remaining iroh unmaintained crates plus `n0-error`, the Tauri-transitive `quick-xml` copies, the unmaintained zbus 5 and zbus 4 lines, and the unpatched `crypto-bigint` 0.5.5 copy.

Two statements from the May 2026 copy of this page are not true of that file:

- The `tough` 0.21 advisories were removed on 26 June 2026, when `sigstore` moved to 0.14 and pulled `tough` 0.22. A failed update signature is not ignored. See [Supply chain](./supply-chain).
- **GHSA-7gmj-67g7-phm9 / CVE-2026-42184** is still ignored. `main` pins `tauri` 2.11.0. The file scopes that advisory to Windows and Android and records why 2.11.1 was not taken. The May note that the advisory was closed by moving to 2.11.1 describes a tree this repository is not on.

## What CI runs

`npm run security:report` is not a GitHub Actions step. The committed HTML file is not regenerated on every push.

[`.github/workflows/checks.yml`](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/.github/workflows/checks.yml) runs `cargo audit --deny warnings` from `src-tauri` on every pull request, every push to `main`, and every Monday at 06:00 UTC. On a pull request the step is non-blocking. On `main` and on the weekly run it fails the job. That command reads `audit.toml`. It does not publish a new HTML report.

## Recorded snapshots

These rows are the runs that were written down. They are not a measurement of 4.2.6 or of `aa0e477`. This edit did not re-run `cargo audit`, `npm audit`, or `osv-scanner`.

| When | Tree | Open | Suppressed | Where |
| ---- | ---- | ---- | ---------- | ----- |
| May 2026 | v3.7.5 | 0 | 25 | The pipeline note kept in the [audit archive](./audits) |
| 21 June 2026 | v4.0.7 | 0 | 28 | The [HTML file](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/docs/security/security-report-latest.html) still on `main` |

The June file still says 28 suppressed. The ignore list on `aa0e477` has 33 IDs. Use the file, not the HTML, for the current list. Do not read either open column as a November result.

## Archive

Past Aikido Security audit PDFs are kept in the repository for archival comparison:

- [March 2026 - Aikido Security](https://github.com/axpdev-lab/aeroftp/blob/main/docs/Security%20Audit%20Report%20axpdev-lab%20-%20March%202026.pdf) - Top 5% benchmark, 0 open issues, OWASP / ISO 27001 / CIS / NIS2 / GDPR
- [February 2026 - Aikido Security](https://github.com/axpdev-lab/aeroftp/blob/main/docs/Security%20Audit%20Report%20axpnet%20-%20February%202026.pdf) - Top 5% benchmark, 0 open issues

These reports remain useful as historical evidence. They are not produced on a recurring cadence. The self-hosted commands above are how someone reproduces a scan from the repository. `cargo-audit` and `osv-scanner` must already be installed. The script does not install them. If either is missing, that scan is marked skipped and the summary can still say "No open vulnerabilities". Read the skipped badges before treating the report as a complete scan. CI does not write a new HTML report, and the file on `main` is the June 2026 snapshot.

## Why Self-Hosted

The repository keeps the Aikido Security PDFs. See the [audit archive](./audits.md). Those results do not establish a current subscription. [CodeRabbit](https://coderabbit.ai), [Greptile](https://www.greptile.com), Snyk, and Socket post a status on each pull request. That status is described on the [supply chain page](./supply-chain). It is not a dated audit report, and a green review is not a substitute for `cargo audit`.

The self-hosted pipeline exists alongside them because:

- **No vendor lock-in.** The pipeline is GPL-3.0 like the rest of AeroFTP and runs against open advisory databases. If any vendor ends a free tier, gates a feature behind paid plans, or rate-limits API access, the audit results stay reproducible from the repository alone.
- **Reviewers can verify, not just trust.** Anyone can clone the repository, run `npm run security:report`, and produce the same numbers. There is no "trust me, the dashboard says zero" step.
- **Suppression rationale is auditable.** `audit.toml` is in the repository under version control; every accepted risk has a written justification reviewers can read inline. SaaS dashboards typically hide the threat-model context behind UI configuration.

## Tooling

- [`cargo audit`](https://github.com/rustsec/rustsec/tree/main/cargo-audit) by RustSec
- [`npm audit`](https://docs.npmjs.com/cli/v10/commands/npm-audit) by npm
- [`osv-scanner`](https://google.github.io/osv-scanner/) by Google
- [`scripts/security-report.cjs`](https://github.com/axpdev-lab/aeroftp/blob/main/scripts/security-report.cjs) - the aggregator script
- [`src-tauri/.cargo/audit.toml`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/.cargo/audit.toml) - the suppression list with written rationales
