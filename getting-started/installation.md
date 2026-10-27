# Installation

AeroFTP is available for **Linux**, **Windows**, and **macOS**. All packages are built in a clean GitHub Actions CI environment and distributed through [GitHub Releases](https://github.com/axpdev-lab/aeroftp/releases). AeroFTP is free and open-source with no license keys, subscriptions, or telemetry.

## Supported Platforms

| Platform | Formats | Install Method |
| --- | --- | --- |
| **Linux** | `.deb`, `.rpm`, `.AppImage`, `.snap`, AUR | Package manager, Snap Store, or direct download |
| **Windows** | `.msi`, `.exe`, portable `.zip` | MSI or NSIS installer, or extract the portable ZIP |
| **macOS** | `.dmg` | Drag to Applications |

## System Requirements

| Requirement | Minimum | Recommended |
| --- | --- | --- |
| **Disk space** | ~120 MB installed | 200 MB (including cache) |
| **RAM** | 256 MB | 512 MB or more |
| **OS (Linux)** | Ubuntu 22.04, Fedora 38, Arch (current) | Ubuntu 24.04+ or equivalent |
| **OS (Windows)** | Windows 10 (1709+) | Windows 11 |
| **OS (macOS)** | macOS 12 Monterey | macOS 14+ |
| **Linux runtime** | WebKitGTK 4.1 (`libwebkit2gtk-4.1`) | Included in most desktop distributions |

> **Note:** On Linux, AeroFTP requires the WebKitGTK 4.1 runtime library. Most desktop distributions (Ubuntu, Fedora, Arch with a desktop environment) include it by default. See the [Linux installation guide](linux.md) for manual installation commands if needed.

## Choose Your Platform

- **[Linux](linux.md)** -- `.deb`, `.rpm`, `.AppImage`, Snap Store, or AUR (Arch)
- **[Windows](windows.md)** -- `.msi` installer (recommended), `.exe` NSIS installer, or portable `.zip`
- **[macOS](macos.md)** -- `.dmg` disk image

## Downloading

All releases are published on the [GitHub Releases page](https://github.com/axpdev-lab/aeroftp/releases). Each release includes:

- Platform-specific installers and packages
- A changelog describing all changes in the release
- SHA-256 checksums for every artifact

To download the latest version, visit the Releases page and select the appropriate file for your platform and architecture.

## Verifying Downloads

Release artifacts are built by GitHub Actions with recorded build configuration. To verify the integrity of a downloaded file, compare its SHA-256 checksum against the value published on the Releases page:

```bash
# Linux / macOS
sha256sum AeroFTP_<version>_amd64.deb

# Windows (PowerShell)
Get-FileHash .\AeroFTP_<version>_x64_en-US.msi -Algorithm SHA256
```

If the checksum matches the value listed on the GitHub Releases page, the file has not been tampered with during download.

## Auto-Update

AeroFTP includes a built-in update checker that runs every 24 hours. When a new version is available, a non-intrusive notification appears with the option to download and install the update.

- **AppImage (Linux)**: Full auto-update support. The app downloads the new AppImage, atomically replaces the current AppImage after verification and restarts it.
- **Snap (Linux)**: Updates are handled automatically by the Snap daemon.
- **.deb / .rpm (Linux)**: The app downloads the matching package and requests installation through the system package tools and their authorization flow.
- **Windows**: The app downloads the matching MSI, NSIS or portable ZIP, verifies it and offers **Install & Restart**.
- **macOS**: The app downloads the DMG and opens it for manual installation.

## File Associations

AeroFTP registers itself as the handler for `.aerovault` encrypted container files. Double-clicking an `.aerovault` file in your operating system's file manager will open it directly in AeroFTP's vault browser.

> **Next step:** Once installed, follow the [Quick Start](quick-start.md) guide to connect to your first server.
