---
title: Proton Drive with AeroFTP
description: Connect to Proton Drive with AeroFTP's native encrypted client or the optional official Proton Drive CLI.
---

# Proton Drive

<ProviderPlanCard id="proton" />

Since v4.2.4, AeroFTP includes a native Proton Drive client built from Proton's open-source SDK logic and Rust cryptography libraries. Select the **API** tab, sign in through Proton's page in your system browser, then connect. No separate CLI installation is needed. AeroFTP saves the resulting session and key password in its encrypted vault; your Proton account password stays on Proton's sign-in page.

::: info Existing profiles
New profiles default to the native client when the build includes it. Profiles saved before the native integration keep using the official CLI until you explicitly choose API mode and sign in. The two modes have separate sessions.
:::

::: warning Third-party application
AeroFTP is a third-party application and is not officially supported by Proton.
:::

## Choose a Connection Mode

| Feature | Native client: API tab | Official CLI: CLI tab |
| ------- | ---------------------- | --------------------- |
| Installation | Included in default AeroFTP builds | Install Proton's CLI separately |
| Sign-in | Proton's browser page, started from AeroFTP | `proton-drive auth login` |
| Session storage | AeroFTP's encrypted vault, per profile | Operating system secret store, managed by the CLI |
| Root folder | My Files | Account sections; open **my-files** for your files |
| Upload and download | Live progress | File start and confirmed completion |
| Many small files | Up to five shared-session file/list workers; availability depends on the runner | Automatic bulk transfers for suitable files since v4.2.4 |
| Storage quota and checksums | Quota and SHA-1 when available | No quota display or provider checksum |
| Share links and server-side copies | Not available | Supported |

## Connect with the Native Client

You need a Proton account; the free plan is enough.

1. Open AeroFTP and select **Proton Drive**.
2. Select the **API** tab and press **Sign in**.
3. Complete Proton's sign-in page in your browser. Finish any account challenges there.
4. Return to AeroFTP, connect and save the profile.

The browser page expires after ten minutes. Cancel it from AeroFTP or start a new sign-in if it expires. The sign-in address contains a one-time key: do not share it or copy it into a log.

The native root `/` is **My Files**. Native mode supports browsing, file uploads and downloads with progress, folders, rename and move, trash and permanent deletion, SHA-1 checksums when available, and storage quota. Downloads verify the signed manifest before the downloaded content replaces its destination.

Each saved profile keeps its own session. Duplicated profiles can share a session; signing out or deleting one does not revoke a session still used by another saved profile. Unlock the vault before using a saved native session.

### Native concurrency

The native provider can clone workers on one connection for transfers and listings, with a ceiling of five sessions. Workers share parent-folder discovery and can be reused across files. The runner and the caller's selected concurrency still determine whether work overlaps; an individual operation does not imply five simultaneous files. This differs from CLI mode's bounded subprocess bulk transfers.

### Native Limitations

- Native mode currently exposes My Files, rather than the official CLI's complete set of account sections. Use Proton's apps for photos, devices and other views.
- Creating share links and server-side copies requires the official CLI mode or Proton's apps.
- Uploading over a compatible existing file creates a new revision. When an existing file uses Proton's newer AEAD format, replacement uploads a new file and moves the previous file to the trash; its old version history and share links remain attached to the old file.
- AeroCloud spaces full remote scans at least one hour apart for Proton; local changes between scans can still upload individually.

## Use the Official Proton Drive CLI

The **CLI** tab retains the integration introduced in AeroFTP v4.2.1. It requires Proton's separately installed [Proton Drive CLI](https://proton.me/download/drive/cli/index.html).

1. Install the official CLI and run `proton-drive auth login` in a terminal.
2. Complete the browser sign-in.
3. Select **CLI** in AeroFTP and refresh its status, then connect.

The CLI manages its session in the operating system's secret store. This mode keeps one Proton account per operating system user and provides no quota display, intermediate byte progress or partial reads. Photos and albums cannot be opened through this mode; use Proton's apps for them.

AeroFTP finds `proton-drive` on `PATH` or in usual installation locations. Set `AEROFTP_PROTON_CLI` to its full executable path if necessary. A saved or imported profile cannot choose an executable path.

The CLI root lists account sections such as **my-files**, **devices**, **photos** and **trash**. Open **my-files**, or another writable section, before adding files or folders. Sections themselves cannot be renamed, moved, copied or deleted. A used-storage scan counts your own sections, including trash, and excludes shared views; it does not report your plan's storage limit.

Deletion moves items to trash. Permanent deletion refuses ambiguous duplicate names in the trash. CLI share links can carry a password, an expiry date (tomorrow at the earliest) and view or edit permission. A share password is passed as a command argument and is visible in the local process list while that command runs.

### Bulk Transfers Since v4.2.4

AeroFTP groups suitable files into bounded CLI calls, reducing program startup overhead for batches of small files. This is automatic in the CLI, GUI and compatible sync operations. Downloads request only the selected files, and each file retains its own result. Progress reports file starts and confirmed completions; it does not estimate intermediate byte percentages.

Large files, incompatible names and transfers that require the existing resume, delta, checksum or error-correction path keep their individual transfer handling. Proton CLI mode does not support resuming at a byte offset. After an interruption, check which files completed before retrying; an upload with an uncertain result may already exist remotely.

See the [Proton Drive benchmark report](/test-reports/comparison/proton-drive-2026-10) for the measured comparison with the official CLI and its limitations.

## Headless Use and Profile Backups

```bash
aeroftp-cli profile-add --name "Proton" --protocol proton --proton-mode native
aeroftp-cli proton sign-in "Proton"
aeroftp-cli proton status "Proton"
aeroftp-cli --profile "Proton" ls /
```

For a machine without a browser, `aeroftp-cli proton sign-in "Proton" --no-browser` shows the address on an interactive terminal so you can open it on another device. Sensitive sign-in addresses are not emitted to JSON or redirected output. `aeroftp-cli proton sign-out "Proton"` ends the saved session; `status` only checks the vault and does not contact Proton.

An encrypted `.aeroftp` backup can include a native session when saved credentials are explicitly included. The [rclone bridge](/features/rclone#proton-drive-sessions) can import and export a recoverable native session as a `protondrive` remote without carrying the account password. Protect the exported configuration: it contains credentials that authorize access to the account. A native profile without a saved session and an official CLI profile are skipped on bridge export with a reason.

An imported or exported session is shared with rclone. Proton rotates its refresh token: when one tool refreshes, the other may lose access. Sign in again in AeroFTP if needed; if a password-free rclone remote loses its session, export a fresh one from AeroFTP and replace the stale remote. Use separate sign-ins for independent sessions. See the [bridge guide](/features/rclone#proton-drive-sessions) for recovery and encryption of the exported config.

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| Native profile has no saved session | Unlock the vault, press Sign in and complete the browser page |
| A previous profile still asks for the CLI | Choose API mode explicitly and sign in; existing profiles are preserved |
| Sign-in expired or the form changed during sign-in | Start a new sign-in from the intended profile and mode |
| The CLI status is red or amber | Install the CLI or run `proton-drive auth login`, then refresh |
| A CLI upload to the top level is refused | Open **my-files** or another section first |
| A CLI purge reports duplicate trash names | Empty the relevant items using Proton's apps |
| A shared session stops working after using rclone | Sign in again; use separate sessions for independent access |

## Related Documentation

- [Provider Reference](/advanced/provider-reference)
- [CLI Profile and Proton Commands](/cli/commands#proton-native-sign-in)
- [rclone Bridge](/features/rclone#proton-drive-sessions)
- [Proton Drive Benchmarks](/test-reports/comparison/proton-drive-2026-10)
