# Linux Installation

AeroFTP supports all major Linux distributions. Choose the format that matches your system.

## .deb (Ubuntu / Debian / Linux Mint)

Download the `.deb` package from [GitHub Releases](https://github.com/axpnet/aeroftp/releases) and install:

```bash
sudo dpkg -i aeroftp_3.0.1_amd64.deb
sudo apt-get install -f   # resolve any missing dependencies
```

To uninstall:

```bash
sudo apt remove aeroftp
```

## .rpm (Fedora / RHEL / openSUSE)

```bash
sudo rpm -i aeroftp-3.0.1-1.x86_64.rpm
```

Or with DNF:

```bash
sudo dnf install ./aeroftp-3.0.1-1.x86_64.rpm
```

## .AppImage (Universal)

AppImage runs on virtually any Linux distribution without installation:

```bash
chmod +x AeroFTP_3.0.1_amd64.AppImage
./AeroFTP_3.0.1_amd64.AppImage
```

> **Tip:** AeroFTP's AppImage supports built-in auto-updates. When a new version is available, the app will prompt you to download and install it in place.

## Snap Store

```bash
sudo snap install aeroftp
```

The Snap package receives automatic updates from the Snap Store. AeroFTP is published in the `stable` channel.

## AUR (Arch Linux / Manjaro)

Install using your preferred AUR helper:

```bash
yay -S aeroftp-bin
```

Or with `paru`:

```bash
paru -S aeroftp-bin
```

## Dependencies

AeroFTP on Linux requires the **WebKitGTK 4.1** runtime library. Most desktop distributions include it by default. If you encounter a missing library error:

| Distribution | Install Command |
| ------------- | ----------------- |
| Ubuntu/Debian | `sudo apt install libwebkit2gtk-4.1-0` |
| Fedora | `sudo dnf install webkit2gtk4.1` |
| Arch | `sudo pacman -S webkit2gtk-4.1` |

## Launch on Startup

AeroFTP can start automatically when you log in. Enable this in **Settings > General > Launch on Startup**. This creates a `.desktop` autostart entry on freedesktop-compatible environments.

> **Next step:** Follow the [Quick Start](quick-start.md) guide to connect to your first server.
