# macOS Installation

AeroFTP is distributed as a `.dmg` disk image for macOS 12 (Monterey) and later.

## Installing

1. Download the right `.dmg` for your Mac from [GitHub Releases](https://github.com/axpdev-lab/aeroftp/releases):
   - Apple Silicon (M1/M2/M3/M4): `AeroFTP_<version>_aarch64-beta.dmg`
   - Intel: `AeroFTP_<version>_x64-beta.dmg`
2. Open the `.dmg` file
3. Drag **AeroFTP** into your **Applications** folder
4. Eject the disk image

## Gatekeeper Warning

AeroFTP is not signed with an Apple Developer certificate. On first launch, macOS Gatekeeper will block the application. To allow it:

1. Open **System Settings > Privacy & Security**
2. Scroll down to the Security section
3. You will see a message: *"AeroFTP was blocked from use because it is not from an identified developer"*
4. Click **"Open Anyway"**
5. Confirm by clicking **Open** in the dialog

Alternatively, you can right-click (or Control-click) the app in Finder and select **Open** from the context menu. This bypasses Gatekeeper for that specific launch.

> **Tip:** You only need to do this once. After the first launch, macOS will remember your choice.

## Apple Silicon vs Intel

Every release ships two native builds. Pick the one that matches your Mac:

- **Apple Silicon (M1/M2/M3/M4):** download `AeroFTP_<version>_aarch64-beta.dmg`. It runs natively on arm64, no Rosetta 2 required.
- **Intel:** download `AeroFTP_<version>_x64-beta.dmg`.

If you are unsure which Mac you have, open the Apple menu > About This Mac and check the Chip / Processor line.

## Launch on Startup

To start AeroFTP automatically when you log in, enable **Settings > General > Launch on Startup** inside the app. This registers a macOS Launch Agent.

## Uninstalling

Drag AeroFTP from the Applications folder to the Trash. To remove configuration data:

```bash
rm -rf ~/Library/Application\ Support/com.aeroftp.AeroFTP
rm -rf ~/Library/Caches/com.aeroftp.AeroFTP
```

> **Next step:** Follow the [Quick Start](quick-start.md) guide to connect to your first server.
