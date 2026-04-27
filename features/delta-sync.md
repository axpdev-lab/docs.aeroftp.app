# Delta Sync

Delta sync is AeroFTP's bandwidth-saving transfer path for eligible SFTP sessions. Instead of re-sending an entire file after a small edit, AeroFTP can transfer only the changed blocks and show the savings directly in the sync UI.

This page is intentionally strict about scope. Delta sync is not a generic "all protocols" optimization today. It is a real, measured capability with specific requirements.

> **What's under the hood**: since v3.6.1, AeroFTP runs delta sync through **[aerorsync](/features/aerorsync)** - a native rsync wire-protocol implementation written entirely in Rust. No client-side `rsync` binary, no `rsync.exe` bundle on Windows, no WSL requirement. The user-facing UI described below is the same on every platform.

## What You Will See In AeroFTP

When delta sync is active, AeroSync can show:

- a `delta` badge on files that actually used the delta path
- a delta savings card summarizing files optimized, bytes saved, and effective speedup
- a `classic` badge with tooltip when AeroFTP attempted delta first and then fell back to the normal transfer path

If a transfer never attempted delta at all, AeroFTP does not show the `classic` badge. That keeps the UI honest and avoids noise.

For the full sync workflow around these indicators, see [AeroSync](/features/aerosync).

## When Delta Sync Works

Today, the supported happy path is:

- protocol: `SFTP`
- authentication: SSH key-based session
- remote requirement: stock `rsync` server reachable via SSH on the remote host
- client requirement: **none** - AeroFTP ships [aerorsync](/features/aerorsync), a native rsync protocol 31 implementation in pure Rust. No `rsync` binary needed on Linux/macOS/Windows
- product path: AeroSync / sync tree flows that request delta policy
- validation scope: Linux + macOS + Windows (cross-OS first-class as of v3.6.1, byte-identical to stock rsync 3.4.1 in CI)

When those conditions are met, AeroFTP can use the real rsync-over-SSH delta path and report the savings in the UI.

## When Delta Sync Does Not Activate

Delta sync does not activate in these cases:

- SFTP sessions authenticated by password only
- FTP / FTPS
- WebDAV / WebDAVS
- S3-compatible storage
- OAuth cloud APIs such as Google Drive, Dropbox, OneDrive, Box, pCloud, and similar providers

Those transfers still work normally. They just use the classic transfer path instead of delta.

## Current Validation Matrix

This is the current documented validation state as of April 23, 2026:

| Target / class | Delta status | Validation state | Notes |
| --- | --- | --- | --- |
| Generic SFTP with SSH key auth + remote `rsync` | Supported | Validated | Confirmed on the live Docker SFTP fixture using the real product path |
| SFTP password-only sessions | Classic only | Validated | Confirmed on the password-only Docker fixture |
| WD MyCloud HD (`SSH MyCloud HD`) | Classic only | Validated | Real saved profile; password-auth makes the session non-eligible by design |
| Synology DSM | Expected to be eligible if configured with key auth + `rsync` | Pending wider validation | Not yet available in the current workspace matrix |
| TrueNAS SCALE | Expected to be eligible if configured with key auth + `rsync` | Pending wider validation | Not yet available in the current workspace matrix |
| Hetzner Storage Box | Expected to be eligible if configured with key auth + `rsync` | Pending wider validation | Not yet available in the current workspace matrix |
| OVH Public Cloud | Expected to be eligible if configured with key auth + `rsync` | Pending wider validation | Not yet available in the current workspace matrix |

This table is intentionally conservative. AeroFTP only claims validation where we already have live evidence.

## Why You May See The `classic` Badge

The `classic` badge means:

- AeroFTP did try the delta route first
- the session or remote endpoint could not complete that path
- the transfer then completed safely through the normal classic path

Typical causes include:

- remote `rsync` not installed
- remote `rsync` not executable for that account
- session not delta-eligible
- remote capability mismatch discovered during the probe

The tooltip explains the sanitized fallback reason when one is available.

## Why You May Not See Any Delta Badge

Check these points in order:

1. Make sure the server is an SFTP target, not FTP, WebDAV, S3, or an OAuth cloud provider.
2. Make sure the session uses SSH key authentication, not password-only login.
3. Make sure `rsync` is installed on the remote host and available to the same user AeroFTP logs in with.
4. Make sure the sync flow is actually running with delta policy enabled.
5. If the transfer completed with no badge at all, AeroFTP likely stayed on the classic path from the beginning.

## Is Fallback Safe?

Yes. Fallback to the classic path is the normal non-eligible behavior.

Two important details:

- non-eligible or capability-mismatch cases can fall back to classic cleanly
- security-critical failures such as SSH host-key problems are treated as hard errors and are not silently downgraded

That separation is deliberate: AeroFTP does not hide security failures behind a successful classic retry.

## Power User Checklist

If you want delta sync to work reliably:

- use SFTP with SSH keys
- verify `rsync --version` on the remote host
- keep the same account and remote path stable between runs
- prefer servers with predictable Unix tooling and standard OpenSSH behavior

If your server is a NAS appliance, the deciding factor is usually not the brand. It is whether your saved profile uses key auth and whether the box exposes a usable `rsync` binary to that SSH account.

## Developer Notes

At the engineering level, the current contract distinguishes three outcomes:

- `used_delta`
- `fallback_reason`
- `hard_error`

That distinction is what allows AeroFTP to show `delta` and `classic` honestly without conflating non-eligibility with security failures.

For the deeper internal roadmap and validation notes, see the engineering appendix:

- [Appendix Y - AeroSync Advanced](https://github.com/axpdev-lab/aeroftp/blob/main/docs/dev/roadmap/APPENDIX-C-Y-D/APPENDIX-Y_AeroSync-Advanced.md)

## Related Pages

- [aerorsync](/features/aerorsync) - the native rsync engine that powers this feature
- [AeroSync](/features/aerosync)
- [SFTP](/protocols/sftp)
- [Hetzner Storage Box](/providers/hetzner-storage-box)
