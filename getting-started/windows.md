# Windows Installation

AeroFTP provides two distribution formats for Windows 10 and later.

## .msi Installer (Recommended)

The MSI installer is the recommended way to install AeroFTP on Windows:

1. Download `AeroFTP_3.7.0_x64-setup.msi` from [GitHub Releases](https://github.com/axpnet/aeroftp/releases)
2. Double-click the `.msi` file to launch the installer
3. Follow the installation wizard
4. AeroFTP will appear in your Start Menu

The MSI installer:

- Registers file associations (`.aerovault` encrypted containers)
- Adds a Start Menu shortcut
- Supports standard Add/Remove Programs uninstallation

## .exe Portable

For users who prefer not to use the MSI format:

1. Download `AeroFTP_3.7.0_x64-setup.exe` from [GitHub Releases](https://github.com/axpnet/aeroftp/releases)
2. Run the executable directly

> **Note:** The `.exe` bundle is an NSIS installer that extracts and installs AeroFTP. For a truly portable experience, the AppImage format on Linux is more suitable.

## Windows SmartScreen

Since AeroFTP is not signed with a paid Windows code signing certificate, you may see a SmartScreen warning on first launch:

1. Click **"More info"**
2. Click **"Run anyway"**

This warning only appears once. The application is built in a clean GitHub Actions CI environment and all release checksums are published on the Releases page.

## Launch on Startup

AeroFTP can start automatically with Windows. Enable this in **Settings > General > Launch on Startup**. This adds a Registry entry under `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`.

## Uninstalling

Open **Settings > Apps > Installed apps**, find AeroFTP, and click **Uninstall**. Alternatively, use the Add/Remove Programs control panel.

> **Next step:** Follow the [Quick Start](quick-start.md) guide to connect to your first server.
