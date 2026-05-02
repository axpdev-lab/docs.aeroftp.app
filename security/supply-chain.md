# Supply Chain Security

AeroFTP protects the software update pipeline with cryptographic verification at multiple points, ensuring that users only install artifacts built by the official CI/CD pipeline.

## Sigstore Signing

Every release artifact is signed using [Sigstore](https://sigstore.dev) Cosign with GitHub Actions OIDC keyless signing:

| Property | Detail |
| -------- | ------ |
| **Signing tool** | Cosign v3.10.1 |
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

Verification uses the `sigstore` Rust crate (v0.13) with the production trust root. The identity is pinned to the exact workflow file and release tag:

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
  --bundle aeroftp_3.7.0_amd64.deb.sigstore.json \
  --certificate-identity-regexp "https://github.com/axpdev-lab/aeroftp/" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  aeroftp_3.7.0_amd64.deb
```

## Plugin Registry

The remote plugin registry is currently disabled until client-side cryptographic verification of registry content is implemented. Locally installed plugins continue to function. This is a deliberate fail-closed decision: the previous registry model provided integrity (SHA-256) but not authenticity, since both the download URL and the hash came from the same unauthenticated source.

## CI/CD Security

| Control | Detail |
| ------- | ------ |
| **GitHub Actions SHA pinning** | All third-party actions pinned to specific commit SHAs |
| **Security regression script** | `.github/scripts/security-regression.cjs` runs on every build across all platforms |
| **Dependency scanning** | Dependabot alerts enabled for both Rust (Cargo) and JavaScript (npm) |
| **OIDC permissions** | `id-token: write` restricted to tag-triggered release jobs only |
