# Windows Installation

AeroFTP provides three distribution formats for Windows 10 and later: the MSI installer, the NSIS `.exe` installer, and a no-install portable ZIP.

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

## .exe Installer (NSIS)

For users who prefer not to use the MSI format, AeroFTP also ships an NSIS-based `.exe` installer:

1. Download `AeroFTP_3.7.0_x64-setup.exe` from [GitHub Releases](https://github.com/axpnet/aeroftp/releases)
2. Run the executable and follow the wizard

> **Note:** Despite being a single `.exe`, this is an installer (it extracts and installs AeroFTP, adds a Start Menu entry, and supports Add/Remove Programs). For a no-install, run-from-anywhere build, use the portable ZIP below.

## .zip Portable (no install)

The portable ZIP is the true run-from-anywhere build: no installer, no admin rights, no registry footprint.

1. Download `AeroFTP-<version>-portable-windows-x64.zip` from [GitHub Releases](https://github.com/axpnet/aeroftp/releases)
2. Extract it to any folder you can write to (Desktop, USB drive, network share)
3. Double-click `AeroFTP.exe` to launch

All your data (saved servers, AeroAgent chats, AeroVault, cache, logs) stays inside the extracted folder under `data\`, so you can move the whole folder to another machine and pick up where you left off. To uninstall, delete the folder.

> **Command-line tools (since v4.0.8):** the portable ZIP also ships `aeroftp-cli.exe` and `aeroftp-dispatch.exe` next to `AeroFTP.exe`. They are not added to `PATH`: run `.\aeroftp-cli.exe --help` from the extracted folder, or add the folder to your `PATH`. The CLI shares the same portable `data\` folder, so the servers and vault you set up in the GUI are visible from the command line. See the [CLI installation guide](../cli/installation.md) for the full reference.

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
