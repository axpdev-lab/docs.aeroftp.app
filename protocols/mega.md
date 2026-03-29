# MEGA

AeroFTP connects to MEGA's end-to-end encrypted cloud storage. All files are encrypted client-side with AES-128 before upload. MEGA provides 20 GB of free storage.

## Connection Modes

Since v3.2.0, AeroFTP offers two connection backends:

| Mode | Badge | Description |
|------|-------|-------------|
| **Native API** | `API` (blue) | Direct integration via MEGA JSON-RPC. No external software required. Recommended. |
| **MEGAcmd** | `CMD` (red) | Uses the MEGAcmd CLI tool as a bridge. Requires [MEGAcmd](https://mega.io/cmd) installed. |

Select the mode in the connection form. Your choice is saved per server profile and shown as a badge in session tabs and saved servers.

### Native API

The Native API mode connects directly to MEGA's servers using the documented JSON-RPC protocol. It handles:

- **Authentication**: PBKDF2-SHA512 key derivation (v2 accounts) or 65536-round AES-ECB (v1 legacy accounts)
- **Session management**: RSA-encrypted session IDs (csid path) with automatic resume via OS keyring
- **File encryption**: AES-128-CTR with per-file random keys and nonces
- **Node attributes**: AES-128-CBC encrypted filenames and metadata
- **Integrity**: Per-chunk MAC computation and meta-MAC verification

### MEGAcmd (Legacy)

The MEGAcmd mode uses MEGA's official CLI tool. It is the original backend and offers maximum compatibility with all MEGA features. It requires MEGAcmd to be installed and running on your system.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Email | Your MEGA account email | |
| Password | Your MEGA password | Used to derive the encryption master key |
| Remember session | Checkbox (default: on) | Stores encrypted session keys in OS keyring for fast reconnect |
| Logout on disconnect | Checkbox (MEGAcmd only) | Terminates the MEGAcmd daemon session when disconnecting |

MEGA does not use OAuth. Your password is used locally to derive the AES master key - it is never sent to MEGA's servers in plaintext.

## Features

- **End-to-End Encryption**: All files are encrypted with AES-128 before leaving your device. MEGA cannot read your files.
- **Shared Links**: Create encrypted share links. Recipients need the decryption key (included in the link by default).
- **Trash Management**: Deleted files go to the rubbish bin. Restore or permanently delete from the Trash Manager.
- **Large Storage**: 20 GB free tier, one of the most generous free offerings.
- **Streaming Transfers**: Files are encrypted/decrypted on the fly during upload and download.
- **Session Resume**: Native API sessions are persisted in the OS keyring and resume automatically (saves ~3s per connection).

## Tips

- MEGA's encryption means that server-side operations (rename, move) require re-encrypting metadata. This is handled transparently by AeroFTP.
- If you have 2FA enabled on your MEGA account, you will be prompted for the TOTP code during login.
- MEGA's API has bandwidth quotas on free accounts. If you hit the transfer limit, you will need to wait or upgrade.
- For AeroSync, use the **size** compare mode since MEGA does not expose file modification times reliably.
- On Windows, the Native API mode is recommended to avoid the cmd.exe console flash that occurs with MEGAcmd operations.
