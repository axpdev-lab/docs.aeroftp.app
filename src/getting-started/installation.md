# Installation

AeroFTP is available for **Linux**, **Windows**, and **macOS**. All packages are distributed through [GitHub Releases](https://github.com/axpnet/aeroftp/releases).

## Supported Platforms

| Platform | Formats | Install Method |
| ---------- | --------- | ---------------- |
| **Linux** | `.deb`, `.rpm`, `.AppImage`, `.snap`, AUR | Package manager or direct download |
| **Windows** | `.msi`, `.exe` | Installer or portable executable |
| **macOS** | `.dmg` | Drag to Applications |

## System Requirements

- **OS**: Ubuntu 22.04+, Fedora 38+, Windows 10+, macOS 12+
- **RAM**: 256 MB minimum
- **Disk**: ~120 MB installed
- **Linux only**: WebKitGTK 4.1 runtime library

## Choose Your Platform

- **[Linux](linux.md)** -- `.deb`, `.rpm`, `.AppImage`, Snap Store, or AUR
- **[Windows](windows.md)** -- `.msi` installer (recommended) or `.exe` portable
- **[macOS](macos.md)** -- `.dmg` disk image

## Verifying Downloads

All release artifacts are built by GitHub Actions in a clean CI environment. You can verify the SHA-256 checksums listed on each release page:

```bash
sha256sum aeroftp_3.0.1_amd64.deb
```

Compare the output against the checksum published on the [Releases page](https://github.com/axpnet/aeroftp/releases).

> **Next step:** Once installed, follow the [Quick Start](quick-start.md) guide to connect to your first server.
