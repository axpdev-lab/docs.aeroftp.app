# SFTP

SFTP (SSH File Transfer Protocol) transfers files over an encrypted SSH channel. It is the recommended protocol for connecting to Linux/Unix servers, NAS devices, and any system running an SSH daemon.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Host | Server hostname or IP | e.g. `myserver.com` |
| Port | `22` | Default SSH port |
| Username | Your SSH username | Often `root` or your system user |
| Password | Your SSH password | Optional if using key-based auth |
| Private Key | Path to SSH private key | Supports RSA, Ed25519, ECDSA |

## Authentication Methods

AeroFTP supports two authentication methods, tried in order:

1. **Key-based authentication**: If a private key path is provided, AeroFTP uses it. Passphrase-protected keys are supported -- you will be prompted for the passphrase.
2. **Password authentication**: Standard username/password login.

## TOFU Host Key Verification

On first connection to a new server, AeroFTP displays a **Trust On First Use** dialog showing:

- The server's public key fingerprint (SHA-256)
- The key algorithm (Ed25519, RSA, ECDSA)
- A warning about potential MITM attacks

Once you accept the host key, it is stored locally. On subsequent connections, AeroFTP verifies that the server presents the same key. If the key changes, a prominent warning is displayed.

## Features

- **Symlink Support**: AeroFTP follows symbolic links and correctly identifies symlinked directories. This is critical for NAS devices (Synology, WD MyCloud) that use symlinks extensively.
- **File Permissions**: Full Unix permission display (rwxrwxrwx) in the file list, sortable by the PERMS column.
- **Large File Transfers**: Streaming uploads and downloads with no file size limit.
- **Resume**: Interrupted transfers can be resumed from the last byte.

## Tips

- For NAS devices, the SSH port may be non-standard (e.g. `2222` on Synology). Check your NAS admin panel for the correct port.
- Ed25519 keys are recommended over RSA for both security and performance.
- If you see "Permission denied" errors, verify that the SSH user has read/write access to the target directory.
- SFTP is the best protocol choice for AeroSync when connecting to self-hosted servers, as it provides both encryption and reliable file metadata (size, mtime, permissions).
