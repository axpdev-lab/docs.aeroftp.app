# rclone Integration

> AeroFTP stands on the shoulders of a giant. [rclone](https://rclone.org) is the gold standard in file transfer and cloud synchronization — a project that has redefined what a command-line tool can do. With 70+ backends, a thriving community, and over a decade of relentless development, rclone has set the bar for every tool in this space, including ours.
>
> This integration is our way of building a bridge, not a wall. If you use rclone, AeroFTP welcomes you with open arms. Your configuration, your remotes, your workflow — bring it all.

## What this does

AeroFTP can **import and export** rclone configuration files (`rclone.conf`), allowing seamless migration between the two tools.

### Import (rclone to AeroFTP)

- Reads your `rclone.conf` directly (auto-detected or manually selected)
- Maps rclone remote types to AeroFTP protocols
- **Upgrades credential security**: rclone stores passwords using reversible obfuscation (AES-256-CTR with a published key). AeroFTP de-obfuscates them and stores them in an AES-256-GCM encrypted vault with Argon2id key derivation — a significant security improvement with zero effort on your part
- Available in the GUI (Settings > Export/Import > Import from rclone) and CLI (`aeroftp import rclone`)

### Export (AeroFTP to rclone)

- Exports your server profiles to a standard `rclone.conf` file
- Passwords are obfuscated using rclone's own scheme for full compatibility
- Use it to share configurations, set up rclone on a server, or simply keep a portable backup
- Available in the GUI (Settings > Export/Import > Export to rclone)

No vendor lock-in. Your data, your choice.

## Supported rclone backends

| rclone type | AeroFTP protocol | Credentials | Notes |
|---|---|---|---|
| `ftp` | FTP / FTPS | Password (revealed + vault stored) | `tls = true` mapped to FTPS |
| `sftp` | SFTP | Password (revealed + vault stored) | SSH key auth requires manual setup in AeroFTP |
| `s3` (AWS) | S3 | Access Key + Secret (vault stored) | Region, endpoint, bucket preserved |
| `s3` (Cloudflare R2) | S3 | Access Key + Secret (vault stored) | Mapped to Cloudflare R2 provider |
| `s3` (Backblaze B2) | S3 | Access Key + Secret (vault stored) | Mapped to Backblaze B2 provider |
| `s3` (DigitalOcean) | S3 | Access Key + Secret (vault stored) | Mapped to DigitalOcean Spaces |
| `s3` (Wasabi) | S3 | Access Key + Secret (vault stored) | Mapped to Wasabi provider |
| `s3` (MinIO) | S3 | Access Key + Secret (vault stored) | Path-style access enabled |
| `s3` (other) | S3 | Access Key + Secret (vault stored) | Generic S3-compatible |
| `webdav` | WebDAV | Password (revealed + vault stored) | Nextcloud/ownCloud vendor detected |
| `drive` | Google Drive | OAuth (re-auth required) | Profile imported, re-authenticate in AeroFTP |
| `dropbox` | Dropbox | OAuth (re-auth required) | Profile imported, re-authenticate in AeroFTP |
| `onedrive` | OneDrive | OAuth (re-auth required) | Profile imported, re-authenticate in AeroFTP |
| `mega` | MEGA | Password (revealed + vault stored) | Native API mode |
| `box` | Box | OAuth (re-auth required) | Profile imported, re-authenticate in AeroFTP |
| `pcloud` | pCloud | OAuth (re-auth required) | Profile imported, re-authenticate in AeroFTP |
| `azureblob` | Azure Blob Storage | Account Key (vault stored) | Container name preserved |
| `swift` | OpenStack Swift | Password/Key (vault stored) | Auth URL, region, tenant preserved |
| `yandexdisk` | Yandex Disk | OAuth (re-auth required) | Profile imported |
| `koofr` | Koofr | Password (vault stored) | Endpoint preserved |
| `jottacloud` | Jottacloud | OAuth (re-auth required) | Profile imported |
| `b2` | S3 (Backblaze B2) | Account Key (vault stored) | Mapped to S3-compatible endpoint |
| `opendrive` | OpenDrive | Password (vault stored) | Username + password |

**17 rclone types mapped to 13 AeroFTP protocols**, covering the most widely used cloud and server backends.

## What about unsupported backends?

rclone supports 70+ backends. We currently map 17 of them. Remotes with unsupported types (e.g., `fichier`, `compress`, `union`, `chunker`) are listed in the import dialog with their type name so you know exactly what was skipped and why.

We are actively adding support for more backends. If your favorite rclone remote type is missing, [open an issue](https://github.com/axpdev-lab/aeroftp/issues) and we will prioritize it.

## GUI usage

1. Open **Settings > Export/Import**
2. In the **rclone** section, click **Import from rclone**
3. AeroFTP auto-detects your `rclone.conf` — or click **Browse** to select it manually
4. Review the list of detected remotes, deselect any you don't need
5. Click **Import** — credentials are stored in your encrypted vault

For export, select **Export to rclone**, choose which servers to include, and save the `.conf` file.

## CLI usage

```bash
# Auto-detect rclone.conf and scan
aeroftp import rclone

# Specify path explicitly
aeroftp import rclone ~/.config/rclone/rclone.conf

# JSON output for scripting and automation
aeroftp import rclone --json
```

## Security comparison

| Aspect | rclone | AeroFTP |
|---|---|---|
| Password storage | AES-256-CTR with published key (reversible) | AES-256-GCM + Argon2id vault (authenticated encryption) |
| Config file permissions | User responsibility | Automatic 0600 + encrypted at rest |
| OAuth tokens | Stored in rclone.conf (plaintext JSON) | Stored in encrypted vault |
| Master password | Not available | Optional Argon2id-protected vault lock |
| Memory zeroization | Not guaranteed | Passwords cleared from RAM after use |

When you import from rclone, your credentials are automatically upgraded to the stronger security model. No extra steps needed.

---

*rclone is a trademark of Nick Craig-Wood. AeroFTP is not affiliated with or endorsed by the rclone project. We are simply grateful users who built a bridge.*
