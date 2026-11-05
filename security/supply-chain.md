# Supply Chain Security

AeroFTP protects the software update pipeline with cryptographic verification at multiple points, ensuring that users only install artifacts built by the official CI/CD pipeline.

## Sigstore Signing

Every release artifact is signed using [Sigstore](https://sigstore.dev) Cosign with GitHub Actions OIDC keyless signing:

| Property | Detail |
| -------- | ------ |
| **Signing tool** | Cosign v3.0.6, the default of [`sigstore/cosign-installer`](https://github.com/sigstore/cosign-installer) pinned to `6f9f17788090df1f26f669e9d70d6ae9567deba6` (installer v4.1.2). `build.yml` does not override that default |
| **Identity** | GitHub Actions workflow (`build.yml`) bound to the release tag |
| **OIDC issuer** | `https://token.actions.githubusercontent.com` |
| **Bundle format** | `.sigstore.json` (Sigstore bundle v0.3) |
| **Signed artifacts** | `.deb`, `.rpm`, `.AppImage`, `.snap`, `.msi`, `.exe`, `.dmg` |

No private keys are stored as secrets. The signing identity is derived from the GitHub OIDC token issued to the CI workflow at build time.

## Client-Side Verification

The desktop app verifies Sigstore bundles before installing any update:

```text
1. check_update()         →  Query GitHub Releases API for new version
2. download_update()      →  Download artifact + .sigstore.json bundle
3. verify_sigstore_bundle →  Verify bundle against GitHub OIDC identity + workflow tag
4. On failure             →  Delete both files, show error
5. On success             →  Proceed to installation
```

Verification uses the `sigstore` Rust crate (0.14.0 on `main` at `aa0e477`, 5 November 2026) with the production trust root. A bundle that does not verify is `VerificationFailed`: the caller deletes the artifact and the bundle and does not install. The identity is pinned to the exact workflow file and release tag:

```
https://github.com/axpdev-lab/aeroftp/.github/workflows/build.yml@refs/tags/{VERSION}
```

This means an artifact signed by a different workflow, a different repository, or a fork will be rejected.

## Linux Privileged Install Hardening

On Linux, `.deb` and `.rpm` updates are installed via `pkexec` with a custom Polkit policy. The update helper (`/usr/lib/aeroftp/aeroftp-update-helper`) adds a second verification layer:

1. The backend computes SHA-256 of the Sigstore-verified artifact
2. The hash is passed as an argument to the helper alongside the file path
3. The helper copies the file to a stable location, recomputes SHA-256, and compares
4. Installation proceeds only if the hashes match

This eliminates TOCTOU (time-of-check-to-time-of-use) attacks where the file could be replaced between verification and privileged installation.

## Verification for Users

Users can independently verify any release artifact using Cosign:

```bash
cosign verify-blob \
  --bundle "AeroFTP_${VERSION}_amd64.deb.sigstore.json" \
  --certificate-identity "https://github.com/axpdev-lab/aeroftp/.github/workflows/build.yml@refs/tags/v${VERSION}" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  "AeroFTP_${VERSION}_amd64.deb"
```

`VERSION` is the release number, as in the repository README. The identity is the `build.yml` workflow at that tag. A signature from another workflow or another ref does not match.

## Plugin Registry

The remote plugin registry is currently disabled until client-side cryptographic verification of registry content is implemented. Locally installed plugins continue to function. This is a deliberate fail-closed decision: the previous registry model provided integrity (SHA-256) but not authenticity, since both the download URL and the hash came from the same unauthenticated source.

## CI/CD Security

| Control | Detail |
| ------- | ------ |
| **GitHub Actions SHA pinning** | Third-party actions in the workflows are pinned to commit SHAs |
| **`cargo audit`** | [`.github/workflows/checks.yml`](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/.github/workflows/checks.yml) runs `cargo audit --deny warnings` on every pull request, every push to `main`, and every Monday at 06:00 UTC. On a pull request the whole step is non-blocking, including a registry failure, a tool failure, and an audit warning. A push to `main` and the weekly run fail the job |
| **Dependabot** | Weekly pull requests, opened on Monday, for Cargo under `src-tauri`, for npm, and for GitHub Actions |
| **Security regression script** | [`.github/scripts/security-regression.cjs`](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/.github/scripts/security-regression.cjs) runs in the local pre-push gate. It is not a step in `checks.yml` or `build.yml` |
| **OIDC permissions** | `id-token: write` is set on the release jobs in `build.yml`. The Cosign steps that sign artifacts run on tag publication. `checks.yml` does not request that permission |
| **CodeRabbit** | Reviews the diff of pull requests on [axpdev-lab/aeroftp](https://github.com/axpdev-lab/aeroftp) and on [axpdev-lab/docs.aeroftp.app](https://github.com/axpdev-lab/docs.aeroftp.app). A passing check is a review of that change. It is not a scan of RustSec, OSV, or the npm advisory database |
| **Greptile** | Same role, on the same two repositories. A passing check is not a vulnerability scan and is not a dated audit report |
| **Snyk and Socket** | Pull-request checks on `axpdev-lab/aeroftp`. Snyk looks at dependency manifests. Socket posts pull-request alerts and a project report. Both were passing on the merge of [#1507](https://github.com/axpdev-lab/aeroftp/pull/1507). They are per-commit checks |

The self-hosted advisory pipeline is [Continuous Audit](./continuous-audit). A CodeRabbit or Greptile comment is a finding on that pull request's diff.
