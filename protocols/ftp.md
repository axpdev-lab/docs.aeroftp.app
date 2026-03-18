# FTP / FTPS

FTP (File Transfer Protocol) is the original file transfer protocol, dating back to 1971 and standardized in RFC 959. Despite its age, FTP remains the default protocol for web hosting providers, embedded devices, and legacy enterprise systems. AeroFTP provides a modern FTP/FTPS client built on the `suppaftp` library with full TLS support, automatic feature detection, and transfer resumption.

## Connection Settings

![FTP connection dialog with encryption dropdown](/images/ftp-connection.png)
<!-- SCREENSHOT: FTP connection fields showing Host, Port, Username, Password, and the Encryption dropdown set to "Explicit TLS". Port should show 21. -->

| Field | Value | Notes |
|-------|-------|-------|
| Host | Server hostname or IP | e.g. `ftp.example.com` or `192.168.1.100` |
| Port | `21` (FTP/Explicit TLS) or `990` (Implicit TLS) | Auto-set when you change the encryption mode |
| Username | Your FTP username | Often your hosting account name (cPanel, Plesk) |
| Password | Your FTP password | Stored encrypted in the OS keyring via `keyring` crate |
| Encryption | None / Explicit TLS / Implicit TLS | See detailed explanation below |

When you select a saved FTP server, all fields are populated from the encrypted credential store. The password is never written to disk in plaintext.

## Encryption Modes

AeroFTP offers three encryption options. Choosing the right one depends on your server configuration.

### None (Plain FTP) -- Not Recommended

- **Port**: 21
- **Security**: Zero encryption. Username, password, and all file data are transmitted in cleartext.
- **Use case**: Local network testing, isolated lab environments, or legacy hardware that does not support TLS.

> **Warning**: Never use plain FTP over the public internet. Your credentials can be captured by anyone on the network path. AeroFTP does not prevent you from connecting without encryption, but you should treat this mode as inherently insecure.

### Explicit TLS (AUTH TLS) -- Recommended

- **Port**: 21
- **Security**: The connection begins as plain FTP on port 21, then AeroFTP sends the `AUTH TLS` command to upgrade the control channel to TLS. The data channel is also encrypted via `PROT P`.
- **Use case**: The vast majority of hosting providers, cPanel, Plesk, and any modern FTP server.

This is the most compatible secure option. The initial handshake is unencrypted (just enough to negotiate TLS), after which all traffic -- including credentials -- is encrypted. Most shared hosting providers configure Explicit TLS by default.

### Implicit TLS (FTPS on port 990)

- **Port**: 990
- **Security**: TLS is established immediately on connection, before any FTP commands are exchanged. There is no plaintext phase.
- **Use case**: Enterprise and government environments that require encryption from the first byte. Some banking and compliance-focused servers mandate this mode.

Implicit TLS is less common than Explicit TLS but provides a marginally stronger guarantee because no unencrypted bytes ever cross the wire.

## TLS Downgrade Detection

If you select **Explicit TLS (if available)** and the server rejects the `AUTH TLS` command, AeroFTP does not silently fall back to plain FTP. Instead, it:

1. Flags the connection internally as `tls_downgraded`
2. Logs a security warning with the server's response
3. Continues the connection over plain FTP so you can still access your files
4. Displays a visible security indicator so you know the session is unencrypted

This prevents a class of attack where a man-in-the-middle strips the TLS upgrade. You will always know when your connection is not encrypted.

## Feature Detection (FEAT / MLSD / MLST)

When AeroFTP connects to an FTP server, it sends the `FEAT` command to discover the server's capabilities. This determines which features are available:

- **MLSD** (Machine Listing of a Directory): Returns structured, machine-parseable directory listings with precise file metadata -- size, modification time, type, and permissions. AeroFTP prefers MLSD over the older `LIST` command whenever available.
- **MLST** (Machine Listing of a Single File): Retrieves metadata for a single file without listing the entire directory. Used for efficient file existence checks and stat operations.
- **REST STREAM**: Indicates support for transfer resumption (see below).
- **UTF8**: Enables UTF-8 filename encoding, which AeroFTP activates automatically when supported.

If the server does not support `FEAT` (very old servers), AeroFTP falls back to `LIST` and parses the Unix-style or Windows-style directory output heuristically.

## Passive Mode

All AeroFTP FTP connections use **passive mode** (PASV) exclusively. In passive mode, the client initiates both the control and data connections to the server, which works reliably behind NAT routers and firewalls.

AeroFTP does not support **active mode** (PORT), where the server connects back to the client. Active mode requires inbound firewall rules on the client side and is incompatible with most consumer and corporate networks.

> **Firewall Note**: Even in passive mode, the server must have a range of ports open for data connections (typically configured in the FTP server as a passive port range, e.g. 49152-65535). If directory listings succeed but file transfers fail, the passive port range is likely blocked.

## Transfer Resumption

AeroFTP supports resuming interrupted transfers using the FTP `REST` (Restart) command. If a download or upload is interrupted by a network error:

- **Downloads**: AeroFTP sends `REST <offset>` before `RETR` to skip bytes already received, then appends to the partial local file.
- **Uploads**: AeroFTP queries the server for the partial file size and resumes with `REST <offset>` before `STOR`.

Resume is only available if the server advertises `REST STREAM` via `FEAT`. Most modern FTP servers support this.

## Server Compatibility

AeroFTP is tested with the following FTP servers:

| Server | Platform | Notes |
| ------ | -------- | ----- |
| vsftpd | Linux | Default on most Linux distributions |
| ProFTPD | Linux | Common on shared hosting |
| Pure-FTPd | Linux/BSD | Used by many hosting panels |
| FileZilla Server | Windows | Popular free FTP server |
| IIS FTP | Windows Server | Microsoft's built-in FTP service |
| AWS Transfer Family | Cloud | Managed FTP/FTPS/SFTP |
| Serv-U | Windows | Enterprise FTP server |

## CLI Usage

The AeroFTP CLI supports FTP connections using URL syntax:

```bash
# List files on an FTP server with Explicit TLS
aeroftp ls ftp://user@ftp.example.com/ --tls explicit

# Download a file
aeroftp get ftp://user@ftp.example.com/public_html/index.html ./

# Upload a file
aeroftp put ftp://user@ftp.example.com/public_html/ ./style.css

# Recursive directory listing
aeroftp tree ftp://user@ftp.example.com/public_html/ -d 3

# Sync local directory to remote
aeroftp sync ftp://user@ftp.example.com/public_html/ ./website/ --direction push
```

The `--tls` flag accepts `none`, `explicit`, or `implicit`. If omitted, AeroFTP defaults to `explicit`.

For servers with self-signed certificates, add `--insecure` to skip certificate validation.

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Directory listing works but transfers fail | Passive port range blocked by firewall | Open the server's passive port range in your firewall |
| `530 Login authentication failed` | Wrong credentials or IP-restricted access | Verify credentials; check if the server restricts login by IP |
| `SSL/TLS handshake failed` | Server does not support the requested TLS mode | Try a different encryption mode, or use `--insecure` for self-signed certs |
| Garbled filenames | Server using Latin-1 encoding | AeroFTP sends `OPTS UTF8 ON` automatically; if the server ignores it, filenames may display incorrectly |
| Connection timeout | Server behind a strict NAT or offline | Verify the server is reachable with `ping` or `telnet host 21` |
| TLS downgrade warning | Server rejected AUTH TLS | The server does not support TLS. Use a different server or accept the risk |
