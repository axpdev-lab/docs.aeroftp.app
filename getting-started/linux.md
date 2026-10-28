# Linux Installation

AeroFTP supports all major Linux distributions. Choose the format that best matches your system and preferences.

## .deb (Ubuntu / Debian / Linux Mint / Pop!_OS)

Download the `.deb` package from [GitHub Releases](https://github.com/axpdev-lab/aeroftp/releases) and install with `apt`:

```bash
sudo apt install ./AeroFTP_4.2.5_amd64.deb
```

This method automatically resolves and installs any missing dependencies (including WebKitGTK 4.1). Alternatively, use `dpkg` directly:

```bash
sudo dpkg -i AeroFTP_4.2.5_amd64.deb
sudo apt-get install -f   # resolve any missing dependencies
```

To uninstall:

```bash
sudo apt remove aeroftp
```

## .rpm (Fedora / RHEL)

Download the `.rpm` package and install with DNF:

```bash
sudo dnf install ./AeroFTP-4.2.5-1.x86_64.rpm
```

Or with RPM directly:

```bash
sudo rpm -i AeroFTP-4.2.5-1.x86_64.rpm
```

To uninstall:

```bash
sudo dnf remove aeroftp
```

## .AppImage (Universal)

AppImage runs without a system-package installation on compatible Linux desktops. No root access is required to launch it.

```bash
chmod +x AeroFTP_4.2.5_amd64.AppImage
./AeroFTP_4.2.5_amd64.AppImage
```

The AppImage bundles the application and many dependencies; compatible host graphics and system libraries are still required.

> **Auto-update:** AeroFTP's AppImage supports in-app updates. After you approve an available update, AeroFTP downloads and verifies the new AppImage, atomically replaces the current AppImage, and restarts it.

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

Runtime dependencies depend on the package format and desktop. For example, the Debian package also declares GTK3, AppIndicator, libacl and GStreamer with base, good and bad plugins. Let the package manager resolve the package dependencies; WebKitGTK 4.1 alone is not the complete runtime requirement.

## Launch on Startup

AeroFTP can start automatically when you log in. Enable this in **Settings > General > Launch on Startup**. This creates a standard `.desktop` autostart entry in `~/.config/autostart/` on freedesktop-compatible desktop environments (GNOME, KDE, XFCE, etc.).

## Configuration Data Location

AeroFTP stores its configuration, encrypted vault, chat history, and sync journals in `~/.config/aeroftp/`. Interface state kept by the web view lives under `~/.local/share/`, in `app.aeroftp.AeroFTP/` and, for installations made before v4.2.0, `com.aeroftp.AeroFTP/`.

For a clean uninstall, remove every one of these directories that exists after uninstalling the package, and the keyring entry described in [Privacy](/security/privacy).

> **Next step:** Follow the [Quick Start](quick-start.md) guide to connect to your first server.
