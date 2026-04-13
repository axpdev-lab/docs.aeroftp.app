# FileZilla Bridge

> [FileZilla](https://filezilla-project.org) is the most downloaded FTP client in the world. If you have accumulated sites over the years, AeroFTP can import them directly from your `sitemanager.xml` and export back when needed.

## What this does

AeroFTP and FileZilla are fully interoperable. Import and export server profiles freely between the two tools through the shared `sitemanager.xml` format.

### Import (FileZilla to AeroFTP)

- Reads your `sitemanager.xml` directly (auto-detected or manually selected)
- Maps FileZilla protocol values to AeroFTP protocols
- **Upgrades credential security**: FileZilla stores passwords as plain base64 (not encrypted at all). AeroFTP decodes them and stores them in an AES-256-GCM encrypted vault with Argon2id key derivation
- **Duplicate detection**: Sites that match existing profiles are flagged with an "Already exists" badge. You can re-import them to update credentials
- Available in the GUI (Settings > Export/Import > Bridge > FileZilla) and CLI (`aeroftp-cli import filezilla`)

### Export (AeroFTP to FileZilla)

- Exports your server profiles to a standard `sitemanager.xml` file
- Passwords are base64-encoded for FileZilla compatibility
- Use it to set up FileZilla on another machine or share configurations
- Available in the GUI (Settings > Export/Import > Bridge > FileZilla)

## Supported protocols

| FileZilla Protocol | AeroFTP protocol | Credentials | Notes |
| --- | --- | --- | --- |
| 0 (FTP) | FTP | Password (decoded + vault stored) | Plain FTP |
| 1 (SFTP) | SFTP | Password (decoded + vault stored) | SSH file transfer |
| 3 (FTPS implicit) | FTPS | Password (decoded + vault stored) | Port 990 by default |
| 4 (FTPS explicit) | FTPS | Password (decoded + vault stored) | Explicit TLS negotiation |
| 6 (S3) | S3 | Access Key + Secret (vault stored) | Amazon S3 compatible |

**5 protocol types** covering all FileZilla connection modes. The mapping works in both directions.

### What is preserved

- Hostname, port, username
- Remote directory
- Passwords (decoded from base64 on import, re-encoded on export)
- FTPS mode (implicit vs explicit)
- Site display names
- Folder hierarchy structure

### What requires manual setup

- SSH key authentication (key file paths are not portable)
- FileZilla master password protected configurations
- Proxy and transfer settings
- Bookmarks and synchronized browsing pairs

## Security comparison

FileZilla stores passwords as plain base64 in an XML file. Anyone with read access to `sitemanager.xml` can decode every password instantly.

| Aspect | FileZilla | AeroFTP |
| --- | --- | --- |
| Password storage | Base64 encoding (trivially reversible) | AES-256-GCM + Argon2id vault |
| Config file protection | User responsibility | Encrypted at rest |
| Master password | Available since 3.26.0 (optional) | Argon2id-protected vault lock |
| Memory zeroization | Not guaranteed | Passwords cleared from RAM after use |

When you import from FileZilla, your credentials are automatically upgraded to the stronger security model.

## GUI usage

### Import

1. Open **Settings > Export/Import**
2. Click **Import from another app** in the Bridge section
3. Select **FileZilla**
4. AeroFTP auto-detects `sitemanager.xml` on all platforms. Or click **Browse** to select manually
5. Review the list of detected sites - servers already in your list are marked "Already exists"
6. Click **Import** - new servers are added, existing ones are updated

### Export

1. Open **Settings > Export/Import**
2. Click **Export to another app** in the Bridge section
3. Select **FileZilla**
4. Choose which servers to include and whether to include credentials
5. Save the `.xml` file

## CLI usage

```bash
# Auto-detect sitemanager.xml and scan
aeroftp-cli import filezilla

# Specify path explicitly
aeroftp-cli import filezilla /path/to/sitemanager.xml

# JSON output for scripting (credentials are redacted)
aeroftp-cli import filezilla --json
```

## Where FileZilla stores its configuration

| Platform | Default path |
| --- | --- |
| Linux | `~/.config/filezilla/sitemanager.xml` |
| macOS | `~/.config/filezilla/sitemanager.xml` |
| Windows | `%APPDATA%\FileZilla\sitemanager.xml` |

## Frequently asked questions

**Can I import FileZilla sites protected with a master password?**
Not currently. Master password protected configurations use additional encryption. Export without master password protection first, or re-enter credentials manually.

**What about FileZilla Server configurations?**
This bridge handles FileZilla Client site manager only, not FileZilla Server user/group configurations.

**Can I round-trip profiles between AeroFTP and FileZilla?**
Yes. Import from FileZilla, work in AeroFTP, and export back whenever you need.

---

*FileZilla is a trademark of Tim Kosse. AeroFTP is not affiliated with or endorsed by the FileZilla project.*
