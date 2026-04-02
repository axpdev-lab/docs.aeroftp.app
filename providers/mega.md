# MEGA

AeroFTP provides comprehensive MEGA integration through three distinct connection modes, covering MEGA's entire product range from personal encrypted cloud storage to enterprise S3-compatible object storage.

MEGA provides 20 GB of free encrypted storage. All files are encrypted client-side with AES-128 before upload - MEGA cannot read your data.

## Three Ways to Connect

| Mode | Protocol | Auth | Best For |
| ---- | -------- | ---- | -------- |
| **Native API** (recommended) | MEGA JSON-RPC | Email + Password | Daily use, maximum privacy, no dependencies |
| **MEGAcmd** (legacy) | MEGAcmd CLI bridge | Email + Password | Users who already have MEGAcmd installed |
| **S4 Object Storage** | S3-compatible API | Access Key + Secret | Programmatic workflows, CI/CD, S3 tooling |

## Native API (Recommended)

Since v3.2.0, AeroFTP connects directly to MEGA's servers using the native JSON-RPC protocol. No external software is required.

### How It Works

- **Key derivation**: PBKDF2-SHA512 (v2 accounts) or 65536-round AES-ECB (v1 legacy accounts)
- **Session authentication**: RSA-encrypted session IDs with automatic resume via OS keyring
- **File encryption**: AES-128-CTR with per-file random keys and nonces - all performed locally
- **Metadata encryption**: AES-128-CBC encrypted filenames and attributes
- **Integrity verification**: Per-chunk MAC computation and meta-MAC validation

### Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Email | Your MEGA account email | |
| Password | Your MEGA password | Used locally to derive the AES master key - never sent in plaintext |
| Connection Backend | Native API / MEGAcmd | Select in the connection form |
| Remember session (24h) | Checkbox (default: on) | Encrypted session keys stored in OS keyring |

### Features

| Feature | Native API | MEGAcmd |
| ------- | ---------- | ------- |
| Upload / Download | Yes | Yes |
| Delete / Rename / Move / Mkdir | Yes | Yes |
| Share Links | Yes | Yes |
| Trash Management (list, restore, permanent delete) | Yes | Yes |
| Storage Quota | Yes | Yes |
| Search / Find | Yes | Yes |
| Session Resume (OS keyring) | Yes | No |
| External dependency | None | Requires MEGAcmd installed |

## MEGAcmd (Legacy)

The MEGAcmd mode uses MEGA's official CLI tool as a bridge. It was the original MEGA backend in AeroFTP and remains available for users who already rely on MEGAcmd for other workflows.

### Setup

1. Install [MEGAcmd](https://mega.io/cmd) for your platform.
2. Log in once from a terminal: `mega-login your@email.com`.
3. In AeroFTP, switch the Connection Backend to **MEGAcmd**.

### MEGAcmd-Specific Options

| Field | Notes |
| ----- | ----- |
| Logout on disconnect | Terminates the MEGAcmd daemon session when you disconnect from AeroFTP |

## MEGA S4 Object Storage

MEGA S4 is MEGA's S3-compatible object storage platform. It is a separate product from MEGA's encrypted cloud drive, designed for programmatic access using standard S3 tools and SDKs.

S4 requires a **MEGA Pro plan**.

### S4 Regions

| Region | Endpoint | Location |
| ------ | -------- | -------- |
| `eu-central-1` | `s3.eu-central-1.s4.mega.io` | Amsterdam |
| `eu-central-2` | `s3.eu-central-2.s4.mega.io` | Luxembourg |
| `ca-central-1` | `s3.ca-central-1.s4.mega.io` | Montreal |
| `ca-west-1` | `s3.ca-west-1.s4.mega.io` | Vancouver |

Unlike standard S3, MEGA S4 allows cross-region object access: objects uploaded in one region can be retrieved from any other S4 region.

### S4 Setup

1. Enable S4 at [mega.nz/fm/s4](https://mega.nz/fm/s4).
2. Create an access key pair from the S4 dashboard.
3. Create a bucket.
4. In AeroFTP, choose **New Connection > S3 Compatible > MEGA S4 Object Storage**.
5. Enter your access key, secret key, bucket name, and region.

### S4 vs MEGA Cloud

| Feature | MEGA Cloud | MEGA S4 |
| ------- | ---------- | ------- |
| Protocol | MEGA JSON-RPC | S3-compatible (AWS Signature V4) |
| Authentication | Email + Password | Access Key + Secret Key |
| Encryption | Client-side AES-128 (zero-knowledge) | Standard HTTPS (server-managed) |
| Free tier | 20 GB | None (Pro plan required) |
| File versioning | Planned | Not supported |
| Object tagging | Not applicable | Not supported |
| Share links | Encrypted link with key fragment | S3 presigned URLs (max 7 days) |
| Best for | Personal files, privacy | S3 tooling, automation, CI/CD |

For full S4 setup details and S3 compatibility notes, see the [S3-Compatible Storage page](s3.md#mega-s4-object-storage).

## Share Links

All three MEGA modes support share link creation:

- **Native API / MEGAcmd**: Creates an encrypted MEGA link (`https://mega.nz/file/...#key`). The decryption key is embedded in the URL fragment and never sent to MEGA's servers.
- **S4**: Creates a standard S3 presigned URL with configurable expiration (default 1 hour, maximum 7 days).

Share links can be created via right-click context menu or the CLI:

```bash
# MEGA Cloud (encrypted link)
aeroftp-cli link --profile "My MEGA" /path/to/file.pdf

# S4 (presigned URL with 7-day expiry)
aeroftp-cli link --profile "Mega S3" /file.pdf --expires 7d
```

## Tips

- MEGA's encryption means that rename and move operations require re-encrypting metadata. AeroFTP handles this transparently.
- If 2FA is enabled, you will be prompted for the TOTP code during login.
- MEGA free accounts have bandwidth quotas. If you hit the transfer limit, wait or upgrade to Pro.
- For AeroSync with MEGA, use the **size** compare mode since MEGA does not expose reliable file modification times.
- On Windows, the Native API mode avoids the console window flash that occurs with MEGAcmd operations.
- MEGA Pro plans unlock password-protected and expiring share links on the MEGA web interface. AeroFTP support for these Pro features via the native API is on the roadmap.
