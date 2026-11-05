---
title: SCP
description: SCP in AeroFTP, the legacy SSH copy protocol for servers that have no SFTP subsystem, including OpenWrt.
---

# SCP

> SCP here is the legacy copy protocol inside the classic `scp` program, not the modern `scp` command's SFTP mode. It is the Berkeley `rcp` dialogue carried over an SSH exec channel. `rcp` shipped in 4.2BSD (1983). Tatu Ylönen carried it over SSH in 1995, and OpenSSH kept it. It was never an IETF standard. AeroFTP uses it to reach an SSH server that has no SFTP subsystem.
>
> One SSH login. A file transfer is a remote `scp` process: `scp -t` to upload, `scp -f` to download. A directory listing is a quoted shell command (`ls`, `find`), not an SFTP packet. Since 4.2.6, on `russh` 0.65.1, AeroFTP uses the same login SFTP uses. Choose SCP directly, or let an SFTP profile fall back when the server has no SFTP subsystem.

OpenSSH 9.0 (2022) switched the `scp` *command* to SFTP by default. The legacy protocol is still what `scp -O` speaks, and what a Dropbear box without `sftp-server` can speak. That second case is why AeroFTP has it. A stock OpenWrt router is the usual example.

## Two ways in

Both ways use the SSH connection SFTP would use: the same host-key check, and the same login order (`none`, then the password or the key).

- **SCP as its own protocol.** Choose SCP in Add Services or the connection form, or use `scp://user@host/path` on the CLI. The profile never asks for SFTP. A WinSCP session whose protocol is SCP imports as SCP.
- **SFTP with SCP fallback, the default.** An SFTP profile whose server refuses the SFTP subsystem, or accepts it and closes it at once, continues over SCP on that same connection. The GUI shows a notice and the CLI prints one on stderr. The fallback does not start after a timeout, a transport error, or a refused login. Turn it off per profile ("Allow SCP fallback") or with `--no-scp-fallback`. The error then names the cause.

[SFTP](/protocols/sftp) remains the right choice when the server has an SFTP subsystem. SCP does not do delta sync, and an interrupted upload starts again from the first byte.

## What the server must have

The connection checks for a POSIX shell, `scp`, an `ls` that accepts `--full-time`, and a `find` that accepts `-mindepth`, `-maxdepth`, and `-print0`. BusyBox on OpenWrt, GNU, and uutils provide those. A custom build has to provide them too.

Resumed downloads need `dd` and `cat`. Ranged reads and segmented downloads also need `head`. Without those tools, a whole-file transfer still works. An account that cannot run the shell commands (rssh, scponly, or a forced command) is refused, with the reason.

## What you can do

| Operation | SCP |
| --- | --- |
| List, stat, mkdir, delete, rename, chmod | POSIX shell commands. Every path is single-quoted. |
| Upload and download, with progress | Yes. An upload keeps the file's time. The speed limit applies both ways. |
| Resume | Downloads continue from the partial file (`dd` seeks on the server). Interrupted uploads restart from zero. |
| Parallel transfers | Up to 8 files at once when `dd`, `cat`, and `head` exist, each on its own exec channel of the one connection. Otherwise one file at a time. |
| Segmented download | Up to 8 windows per file on that one connection, above the usual size cutoff. |
| Server-side checksum | SHA-256 via `sha256sum`, MD5 via `md5sum`, each only when the host has the tool. The bytes stay on the server. |
| Search | `find` on the server. |
| Free space | `df -Pk`, when `df` exists. |
| Replace an existing file | `mv`, atomic on the same filesystem. A folder is never replaced by a file, or the reverse. |
| Delta sync, server-side copy, upload append | No. |

A name that contains a newline or a NUL is refused. SCP cannot transfer that basename without changing it, so AeroFTP does not change it. Listings keep spaces, and a name that contains a control character is resolved on its own so it cannot forge another entry.

## Where SCP does not appear yet

[AeroCloud setup](/features/aerocloud) does not offer an SCP profile. The [mount list](/features/mount-manager) does not include SCP. File transfer, sync, and the CLI do.

WinSCP sessions map the way WinSCP defines them: 0 is SCP, 1 is SFTP with the fallback on, 2 is SFTP with it off. Export writes the same values back. See the [WinSCP bridge](/features/winscp).
