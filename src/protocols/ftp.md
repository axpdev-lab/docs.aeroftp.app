# FTP / FTPS

FTP (File Transfer Protocol) is the classic file transfer protocol, widely supported by web hosting providers and legacy systems. AeroFTP supports plain FTP and FTPS (FTP over TLS) with both explicit and implicit encryption modes.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Host | Server hostname or IP | e.g. `ftp.example.com` |
| Port | `21` (FTP/Explicit TLS) or `990` (Implicit TLS) | Auto-set based on encryption mode |
| Username | Your FTP username | Often your hosting account name |
| Password | Your FTP password | Stored encrypted in the OS keyring |

## Encryption Modes

AeroFTP offers three encryption options for FTP connections:

| Mode | Port | Description |
|------|------|-------------|
| **None** | 21 | Plain FTP, no encryption. Credentials sent in cleartext. |
| **Explicit TLS** | 21 | Starts as plain FTP, then upgrades to TLS via `AUTH TLS`. Recommended. |
| **Implicit TLS** | 990 | TLS from the first byte. Used by some enterprise servers. |

> **TLS Downgrade Detection**: If you select "Explicit TLS (if available)" and the server rejects the TLS upgrade, AeroFTP flags the connection as `tls_downgraded` and displays a security warning. The connection continues over plain FTP, but you are informed that credentials were sent unencrypted.

## Features

- **MLSD/MLST**: Modern directory listing commands that provide structured file metadata (size, modification time, type). AeroFTP auto-detects server support via `FEAT`.
- **FEAT**: Feature negotiation. AeroFTP queries the server's capabilities on connect.
- **Passive Mode**: All connections use passive mode by default, which works reliably behind NAT and firewalls.
- **Resume**: Interrupted transfers can be resumed if the server supports `REST`.
- **Server Compatibility**: Tested with vsftpd, ProFTPD, Pure-FTPd, FileZilla Server, IIS FTP, and AWS Transfer Family.

## Tips

- If you are behind a strict firewall, ensure the server's passive port range is open. AeroFTP does not support active mode.
- For shared hosting (cPanel, Plesk), use **Explicit TLS** on port 21 -- most hosting panels configure this by default.
- If the server's TLS certificate is self-signed, AeroFTP will show a confirmation dialog before proceeding.
- FTP does not support file checksums natively. For integrity verification during AeroSync, use the **size + modification time** compare mode.
