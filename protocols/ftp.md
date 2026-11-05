# FTP / FTPS

> FTP is a two-connection file protocol. Commands travel on a control channel, and the file bytes travel on a separate data channel. Abhay Bhushan published it as RFC 114 on 16 April 1971. The current base is RFC 959 (October 1985), written by Jon Postel and Joyce Reynolds. Explicit FTPS is RFC 4217 (2005), by Paul Ford-Hutchinson. Implicit FTPS on port 990 is a convention from the 1990s, not that RFC.
>
> The client logs in on port 21, asks the server for a passive data port, and transfers one file on that second connection. FTPS wraps the same commands in TLS. AeroFTP uses `suppaftp` 12.2.1 and passive mode only. The modes are None, Explicit TLS, Explicit TLS if available, and Implicit TLS. If an explicit TLS upgrade fails, the connection stops. Plain FTP requires choosing None.

FTP remains the default protocol for a lot of web hosting, embedded devices, and older enterprise systems. AeroFTP's client detects server features and can resume a transfer.

## Connection Settings

![FTP connection dialog with encryption dropdown](/images/ftp-connection.png)
<!-- SCREENSHOT: FTP connection fields showing Host, Port, Username, Password, and the Encryption dropdown set to "Explicit TLS". Port should show 21. -->

| Field | Value | Notes |
|-------|-------|-------|
| Host | Server hostname or IP | e.g. `ftp.example.com` or `192.168.1.100` |
| Port | `21` (FTP/Explicit TLS) or `990` (Implicit TLS) | Auto-set when you change the encryption mode |
| Username | Your FTP username | Often your hosting account name (cPanel, Plesk) |
| Password | Your FTP password | Stored encrypted in the Universal Credential Vault |
| Encryption | None / Explicit TLS / Explicit TLS if available / Implicit TLS | See detailed explanation below |

When you select a saved FTP server, all fields are populated from the encrypted credential store. The password is never written to disk in plaintext.

## Encryption Modes

AeroFTP offers four encryption options. Choosing the right one depends on your server configuration.

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

### Explicit TLS if available

- **Port**: 21
- **Security**: AeroFTP tries the `AUTH TLS` upgrade. If the server rejects it, the connection stops. Credentials are not sent over plaintext. Choose **None** when you intend to connect without TLS.
- **Use case**: A server that should offer TLS, where a silent drop to plain FTP is not acceptable.

The GUI label is "Use explicit FTP over TLS if available". The saved value is `explicit_if_available`. A failed upgrade returns the same kind of connection error as required Explicit TLS, with wording that tells you to choose None for plaintext.

### Implicit TLS (FTPS on port 990)

- **Port**: 990
- **Security**: TLS is established immediately on connection, before any FTP commands are exchanged. There is no plaintext phase.
- **Use case**: Enterprise and government environments that require encryption from the first byte. Some banking and compliance-focused servers mandate this mode.

Implicit TLS is less common than Explicit TLS but provides a marginally stronger guarantee because no unencrypted bytes ever cross the wire.

## TLS Downgrade Detection

If you select **Explicit TLS (if available)** and the server rejects the `AUTH TLS` command, AeroFTP does not continue over plain FTP. The connection fails with an error that names the failed upgrade and tells you to choose **None** if you intend to connect without TLS. Plaintext is only the mode you select yourself.

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

The CLI uses saved FTP/FTPS profiles, including their TLS policy. Save the connection in AeroFTP first, then use its exact profile name:

```bash
aeroftp-cli ls --profile "My FTPS" /public_html/ --json
aeroftp-cli get --profile "My FTPS" /public_html/index.html ./index.html
aeroftp-cli put --profile "My FTPS" ./style.css /public_html/style.css
aeroftp-cli tree --profile "My FTPS" /public_html/ -d 3
aeroftp-cli sync --profile "My FTPS" ./website/ /public_html/ --direction upload --dry-run --json
```

Review the dry-run before executing a sync. Keep certificate verification enabled and configure trust for your server rather than routinely using an insecure flag.

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Directory listing works but transfers fail | Passive port range blocked by firewall | Open the server's passive port range in your firewall |
| `530 Login authentication failed` | Wrong credentials or IP-restricted access | Verify credentials; check if the server restricts login by IP |
| `SSL/TLS handshake failed` | Server does not support the requested TLS mode | Check the server's supported TLS mode and configure trust for its certificate while keeping verification enabled |
| Garbled filenames | Server using Latin-1 encoding | AeroFTP sends `OPTS UTF8 ON` automatically; if the server ignores it, filenames may display incorrectly |
| Connection timeout | Server behind a strict NAT or offline | Verify the server is reachable with `ping` or `telnet host 21` |
| Explicit TLS upgrade failed | Server rejected AUTH TLS | The connection stops. Choose None only when you want plaintext FTP |
