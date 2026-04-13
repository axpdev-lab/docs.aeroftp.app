# WinSCP Bridge

> [WinSCP](https://winscp.net) is one of the most established file transfer clients on Windows, trusted by system administrators for over two decades. If you have built up a library of saved sessions over the years, AeroFTP can import them so you do not have to re-type everything. And if you need to go the other way, AeroFTP can export your profiles back to WinSCP format.

## What this does

AeroFTP and WinSCP are fully interoperable. Import and export server profiles freely between the two tools through the shared `WinSCP.ini` format.

### Import (WinSCP to AeroFTP)

- Reads your `WinSCP.ini` directly (auto-detected on Windows or manually selected)
- Maps WinSCP session types to AeroFTP protocols
- **Upgrades credential security**: WinSCP stores passwords using reversible XOR obfuscation with a public algorithm. AeroFTP decodes them and stores them in an AES-256-GCM encrypted vault with Argon2id key derivation
- **Duplicate detection**: Sessions that match existing profiles are flagged with an "Already exists" badge. You can re-import them to update credentials
- Available in the GUI (Settings > Export/Import > Import from WinSCP) and CLI (`aeroftp-cli import winscp`)

### Export (AeroFTP to WinSCP)

- Exports your server profiles to a standard `WinSCP.ini` file
- Passwords are obfuscated using WinSCP's own scheme for full compatibility
- Use it to set up WinSCP on another machine or share configurations with colleagues
- Available in the GUI (Settings > Export/Import > Export to WinSCP)

No vendor lock-in. Your data, your choice.

## Supported protocols

| WinSCP FSProtocol | AeroFTP protocol | Credentials | Notes |
|---|---|---|---|
| 0 (SCP) | SFTP | Password (decoded + vault stored) | Mapped to SFTP for better compatibility |
| 1 (SFTP + SCP fallback) | SFTP | Password (decoded + vault stored) | Standard SSH session |
| 2 (SFTP only) | SFTP | Password (decoded + vault stored) | Standard SSH session |
| 5 + Ftps=0 (FTP) | FTP | Password (decoded + vault stored) | Plain FTP |
| 5 + Ftps=1 (FTPS implicit) | FTPS | Password (decoded + vault stored) | Port 990 by default |
| 5 + Ftps=2/3 (FTPS explicit) | FTPS | Password (decoded + vault stored) | Explicit TLS/SSL |
| 6 + Ftps=0 (WebDAV HTTP) | WebDAV | Password (decoded + vault stored) | HTTP transport |
| 6 + Ftps=1 (WebDAV HTTPS) | WebDAV | Password (decoded + vault stored) | HTTPS transport |
| 7 (S3) | S3 | Access Key + Secret (vault stored) | Region and path-style options preserved |

**9 protocol combinations** covering the most common WinSCP session types. The mapping works in both directions for import and export.

### What is preserved

- Hostname, port, username
- Remote directory (initial path)
- Passwords (decoded on import, re-obfuscated on export)
- S3-specific settings (default region, URL style)
- FTPS mode (implicit vs explicit)
- Session display names (last segment of folder hierarchy)

### What requires manual setup

- SSH key authentication (key file paths are not portable across systems)
- WinSCP master password protected configurations (AES-encrypted, not the standard obfuscation)
- Tunnel/jump host settings
- Custom proxy configurations

## Security comparison

WinSCP uses a reversible XOR-based obfuscation scheme with `Username + Hostname` as the key. This is not encryption in any meaningful sense - the algorithm is public and fully documented.

| Aspect | WinSCP | AeroFTP |
|---|---|---|
| Password storage | XOR obfuscation (reversible, public algorithm) | AES-256-GCM + Argon2id vault |
| Config file protection | User responsibility | Encrypted at rest |
| Master password | Optional AES layer (not importable) | Argon2id-protected vault lock |
| Memory zeroization | Not guaranteed | Passwords cleared from RAM after use |

When you import from WinSCP, your credentials are automatically upgraded to the stronger security model. When you export, passwords are re-obfuscated in WinSCP's format for compatibility.

## GUI usage

### Import

1. Open **Settings > Export/Import**
2. In the **WinSCP** section, click **Import from WinSCP**
3. On Windows, AeroFTP auto-detects `%APPDATA%\WinSCP\WinSCP.ini`. On other platforms, click **Browse** to select the file
4. Review the list of detected sessions - servers already in your list are marked "Already exists"
5. Click **Import** - new servers are added, existing ones are updated with fresh credentials

### Export

1. Open **Settings > Export/Import**
2. In the **WinSCP** section, click **Export to WinSCP**
3. Select which servers to include
4. Choose whether to include credentials (passwords will be obfuscated)
5. Save the `.ini` file

## CLI usage

```bash
# Import from a WinSCP.ini file
aeroftp-cli import winscp /path/to/WinSCP.ini

# JSON output for scripting (credentials are redacted)
aeroftp-cli import winscp /path/to/WinSCP.ini --json

# On Windows, auto-detect the default location
aeroftp-cli import winscp
```

## How to export from WinSCP

If you do not have direct access to the `WinSCP.ini` file (for example, if WinSCP stores sessions in the Windows Registry), you can export them:

1. Open WinSCP
2. Go to **Session > Sites > Manage Sites**
3. Select the sessions you want to export (or select all)
4. Click **Other > Export/Backup Configuration**
5. Save the `.ini` file
6. Import it into AeroFTP using the steps above

## Frequently asked questions

**Can I import sessions stored in the Windows Registry?**
Not directly. Export them from WinSCP first using the steps above, then import the exported `.ini` file.

**What about sessions protected with a WinSCP master password?**
These use additional AES encryption on top of the standard obfuscation. Currently, AeroFTP can only import sessions using the standard obfuscation. Export without master password protection, or re-enter credentials manually.

**Are SCP sessions supported?**
Yes. SCP sessions (FSProtocol=0) are mapped to SFTP, which uses the same SSH transport with better feature support (directory listings, file attributes, resume).

**Can I round-trip profiles between AeroFTP and WinSCP?**
Yes. Import from WinSCP, work in AeroFTP, and export back to WinSCP whenever you need. Protocol mappings and password encoding are fully reversible.

---

*WinSCP is a trademark of Martin Prikryl. AeroFTP is not affiliated with or endorsed by the WinSCP project.*
