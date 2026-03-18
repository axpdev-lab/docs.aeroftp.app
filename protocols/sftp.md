# SFTP

SFTP (SSH File Transfer Protocol) provides encrypted file transfer over an SSH channel. Unlike FTP/FTPS, which layer encryption on top of a separate protocol, SFTP runs entirely within SSH -- there is a single encrypted connection for both commands and data. This makes SFTP the recommended protocol for connecting to Linux servers, Unix systems, NAS devices, and any host running an SSH daemon.

AeroFTP's SFTP implementation is built on the `russh` library (v0.57), supporting modern key exchange algorithms, host key verification, and streaming transfers with no file size limit.

## Connection Settings

![SFTP connection dialog with key file option](/images/sftp-connection.png)
<!-- SCREENSHOT: SFTP connection fields showing Host, Port (22), Username, Password, and the Private Key file selector with a "Browse" button. -->

| Field | Value | Notes |
| ----- | ----- | ----- |
| Host | Server hostname or IP | e.g. `myserver.com` or `192.168.1.50` |
| Port | `22` | Default SSH port; some NAS devices use `2222` |
| Username | Your SSH username | Often `root`, your system user, or a NAS admin account |
| Password | Your SSH password | Optional if using key-based authentication |
| Private Key | Path to SSH private key file | Supports RSA, Ed25519, ECDSA formats |

## Authentication Methods

AeroFTP supports two authentication methods, attempted in order of priority:

### 1. Key-Based Authentication (Recommended)

If a private key path is provided, AeroFTP uses it to authenticate. This is the most secure method and is standard practice for production servers.

- **Supported key types**: Ed25519, RSA (2048/4096-bit), ECDSA (P-256, P-384)
- **Passphrase-protected keys**: Fully supported. AeroFTP prompts for the passphrase when the key is loaded.
- **Key file formats**: OpenSSH format (`-----BEGIN OPENSSH PRIVATE KEY-----`) and PEM format are both accepted.

> **Recommendation**: Ed25519 keys are preferred over RSA for both security and performance. Generate one with: `ssh-keygen -t ed25519 -C "your@email.com"`

### 2. Password Authentication

Standard username and password login. The password is transmitted over the encrypted SSH channel, so it is never exposed on the network. However, key-based authentication is preferred because it eliminates the risk of brute-force attacks.

## TOFU Host Key Verification

On the first connection to a new server, AeroFTP displays a **Trust On First Use** (TOFU) dialog modeled after PuTTY's host key verification prompt.

![TOFU host key verification dialog](/images/sftp-tofu.png)
<!-- SCREENSHOT: The host key verification dialog showing the server hostname, key algorithm (e.g. Ed25519), SHA-256 fingerprint in hex, and Accept/Reject buttons. The dialog should show the MITM warning text. -->

The dialog displays:

- **Server hostname and port**: So you can verify you are connecting to the intended host.
- **Key algorithm**: Ed25519, RSA, or ECDSA.
- **SHA-256 fingerprint**: The cryptographic hash of the server's public key, displayed in hexadecimal. You can compare this against the fingerprint shown by `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the server.
- **MITM warning**: A clear explanation that accepting an unverified key carries risk.

Once you accept the host key, AeroFTP stores it locally. On all subsequent connections:

- If the server presents the **same key**, the connection proceeds silently.
- If the server presents a **different key**, AeroFTP displays a prominent warning indicating a potential man-in-the-middle attack. You must explicitly accept the new key before connecting.

This behavior mirrors how OpenSSH's `known_hosts` file works, but with a graphical interface instead of a terminal prompt.

## Symlink Directory Detection

AeroFTP follows symbolic links and correctly identifies symlinked directories. When listing a directory, AeroFTP calls `sftp.metadata()` on each symlink target to determine whether it points to a file or a directory.

This is critical for NAS devices that use symlinks extensively:

- **Synology DiskStation**: Shared folders under `/volume1/` are often symlinked from user home directories.
- **WD MyCloud**: Network shares may appear as symlinks in the SFTP filesystem.
- **QNAP**: Similar symlink patterns for shared folders.

Without symlink resolution, directories would appear as files and could not be browsed. AeroFTP handles this transparently.

## File Permissions

AeroFTP displays full Unix file permissions in the **PERMS** column of the file list:

- Permissions are shown in the standard `rwxrwxrwx` format (owner / group / others).
- The PERMS column is sortable and responsive -- it hides on narrow viewports to save space.
- Permission values are read directly from the SFTP server's file attributes.

> **Note**: AeroFTP displays permissions but does not currently provide a GUI to change them. Use the AeroAgent `shell_execute` tool or an SSH terminal for `chmod` operations.

## Large File Transfers

SFTP transfers are fully streaming -- files are read and written in chunks without loading the entire file into memory. There is no practical file size limit beyond what the server's filesystem supports.

- **Downloads**: Data is streamed from the server and written to disk in chunks.
- **Uploads**: Data is read from disk and streamed to the server.
- **Resume**: If a transfer is interrupted, AeroFTP can resume from the last byte by seeking to the appropriate offset in the remote file.

## CLI Usage

The AeroFTP CLI supports SFTP connections with password or key-based authentication:

```bash
# Connect with password (prompted interactively)
aeroftp ls sftp://user@myserver.com/

# Connect with a specific port
aeroftp ls sftp://user@myserver.com:2222/home/user/

# List files with details
aeroftp ls sftp://user@myserver.com/ -l

# Download a file
aeroftp get sftp://user@myserver.com/var/log/syslog ./

# Upload a file
aeroftp put sftp://user@myserver.com/home/user/docs/ ./report.pdf

# Key-based authentication
aeroftp ls sftp://user@myserver.com/ --key /home/user/.ssh/id_ed25519

# Key with passphrase
aeroftp ls sftp://user@myserver.com/ --key /home/user/.ssh/id_rsa --key-passphrase "my passphrase"

# Recursive directory tree
aeroftp tree sftp://user@myserver.com/var/www/ -d 3

# Sync local to remote
aeroftp sync sftp://user@myserver.com/var/www/html/ ./website/ --direction push
```

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `Connection refused` | SSH daemon not running or wrong port | Verify `sshd` is running; check the port with `ss -tlnp \| grep ssh` |
| `Permission denied (publickey)` | Key not authorized on server | Add your public key to `~/.ssh/authorized_keys` on the server |
| `Permission denied (password)` | Password auth disabled on server | Enable `PasswordAuthentication yes` in `/etc/ssh/sshd_config`, or use a key |
| `Host key changed` warning | Server was reinstalled or key rotated | Verify the new fingerprint with the server admin, then accept |
| Symlinked directories show as files | Rare; metadata call failed | Check that the SSH user has read permission on the symlink target |
| Slow directory listings | Server under load or high latency | SFTP lists sequentially; consider reducing directory sizes |
| NAS uses non-standard port | Synology defaults to `22`, some use `2222` | Check your NAS admin panel for the SSH port setting |

## Tips

- For NAS devices, always verify the SSH port in the NAS administration interface. Synology uses port 22 by default, but this can be changed.
- Ed25519 keys are recommended over RSA for both security and connection speed.
- SFTP is the best protocol for AeroSync when connecting to self-hosted servers, as it provides encryption, reliable file metadata (size, mtime, permissions), and transfer resumption.
- If you see "Permission denied" errors, verify that the SSH user has read/write access to the target directory with `ls -la` on the server.
