# Linux Installation

AeroFTP supports all major Linux distributions. Choose the format that best matches your system and preferences.

## .deb (Ubuntu / Debian / Linux Mint / Pop!_OS)

Download the `.deb` package from [GitHub Releases](https://github.com/axpnet/aeroftp/releases) and install with `apt`:

```bash
sudo apt install ./aeroftp_3.7.0_amd64.deb
```

This method automatically resolves and installs any missing dependencies (including WebKitGTK 4.1). Alternatively, use `dpkg` directly:

```bash
sudo dpkg -i aeroftp_3.7.0_amd64.deb
sudo apt-get install -f   # resolve any missing dependencies
```

To uninstall:

```bash
sudo apt remove aeroftp
```

## .rpm (Fedora / RHEL / openSUSE)

Download the `.rpm` package and install with DNF:

```bash
sudo dnf install ./AeroFTP-3.7.0-1.x86_64.rpm
```

Or with RPM directly:

```bash
sudo rpm -i AeroFTP-3.7.0-1.x86_64.rpm
```

To uninstall:

```bash
sudo dnf remove aeroftp
```

## .AppImage (Universal)

AppImage runs on virtually any Linux distribution without installation. No root access required.

```bash
chmod +x AeroFTP_3.7.0_amd64.AppImage
./AeroFTP_3.7.0_amd64.AppImage
```

The AppImage is fully self-contained and includes all required libraries.

> **Auto-update:** AeroFTP's AppImage has built-in auto-update support. When a new version is available, the app downloads the update, backs up your current AppImage, replaces it in place, and restarts. No manual intervention needed.

## Snap Store

Install from the Snap Store with a single command:

```bash
sudo snap install aeroftp
```

The Snap package is published in the `stable` channel and receives automatic background updates from the Snap daemon. You can also find AeroFTP in the Ubuntu Software Center or GNOME Software.

To check the installed version:

```bash
snap info aeroftp
```

## AUR (Arch Linux / Manjaro / EndeavourOS)

AeroFTP is available on the Arch User Repository as `aeroftp-bin`:

```bash
# Using yay
yay -S aeroftp-bin

# Using paru
paru -S aeroftp-bin
```

The AUR package installs the pre-built binary from GitHub Releases.

## Dependencies

AeroFTP on Linux requires the **WebKitGTK 4.1** runtime library. Most desktop distributions include it out of the box. If you encounter a missing library error at launch, install it manually:

| Distribution | Install Command |
| --- | --- |
| Ubuntu / Debian | `sudo apt install libwebkit2gtk-4.1-0` |
| Fedora / RHEL | `sudo dnf install webkit2gtk4.1` |
| Arch / Manjaro | `sudo pacman -S webkit2gtk-4.1` |
| openSUSE | `sudo zypper install webkit2gtk3-soup2-devel` |

No other runtime dependencies are required. The application bundles all other libraries internally.

## Launch on Startup

AeroFTP can start automatically when you log in. Enable this in **Settings > General > Launch on Startup**. This creates a standard `.desktop` autostart entry in `~/.config/autostart/` on freedesktop-compatible desktop environments (GNOME, KDE, XFCE, etc.).

## Configuration Data Location

AeroFTP stores its configuration, encrypted vault, chat history, and sync journals in:

```text
~/.config/aeroftp/
```

To perform a clean uninstall, remove this directory after uninstalling the package.

> **Next step:** Follow the [Quick Start](quick-start.md) guide to connect to your first server.
