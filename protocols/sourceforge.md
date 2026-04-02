# SourceForge

SourceForge is one of the largest open-source hosting platforms, providing project hosting, file distribution, and download mirrors worldwide. AeroFTP includes a native SourceForge integration that lets you upload releases directly to the SourceForge File Release System (FRS) via SFTP.

For the shorter provider-oriented setup page, see [SourceForge with AeroFTP](/providers/sourceforge).

## Before You Start

SourceForge requires SSH key authentication for SFTP access. Password-based login is not supported for file uploads. Don't worry - setting up an SSH key takes just a few minutes, and you only need to do it once.

## Step 1: Generate an SSH Key

If you already have an SSH key (check if `~/.ssh/id_ed25519` or `~/.ssh/id_rsa` exists), you can skip to Step 2.

### Linux / macOS

Open a terminal and run:

```bash
ssh-keygen -t ed25519 -C "your-sourceforge-username"
```

When prompted:

- **File location**: Press Enter to accept the default (`~/.ssh/id_ed25519`)
- **Passphrase**: Enter a passphrase for extra security, or press Enter for none

This creates two files:

- `~/.ssh/id_ed25519` - your **private key** (keep this secret, never share it)
- `~/.ssh/id_ed25519.pub` - your **public key** (this is what you upload to SourceForge)

### Windows

#### Option A: Using PowerShell (Windows 10/11)

```powershell
ssh-keygen -t ed25519 -C "your-sourceforge-username"
```

Keys are saved to `C:\Users\YourName\.ssh\`

#### Option B: Using PuTTYgen

1. Download and run [PuTTYgen](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
2. Select **EdDSA** (Ed25519) at the bottom
3. Click **Generate** and move your mouse to create randomness
4. Save the private key as a `.ppk` file
5. Copy the public key text from the top box

## Step 2: Upload Your Public Key to SourceForge

1. Log in to your SourceForge account
2. Go to [Account Settings > SSH Settings](https://sourceforge.net/auth/shell_services)
3. Copy your public key:
   - **Linux/macOS**: Run `cat ~/.ssh/id_ed25519.pub` and copy the output
   - **Windows**: Open `C:\Users\YourName\.ssh\id_ed25519.pub` in a text editor
4. Paste it into the **SSH Public Keys** text box
5. Click **Save**

The key will be active within a few minutes. You can verify by running:

```bash
sftp your-username@frs.sourceforge.net
```

For more details, see [SourceForge SSH Keys documentation](https://sourceforge.net/p/forge/documentation/SSH%20Keys/).

## Step 3: Connect with AeroFTP

1. Open AeroFTP and go to **Discover > Developer > SourceForge**
1. Fill in the connection form:

| Field | Value | Notes |
| ----- | ----- | ----- |
| Server | `frs.sourceforge.net` | Pre-filled automatically |
| Port | `22` | Pre-filled automatically |
| Username | Your SourceForge username | The username you log in with (not your email) |
| Project (Unixname) | Your project's Unix name | e.g. `aeroftp` - visible in your project URL |
| Private Key Path | `~/.ssh/id_ed25519` | Click the browse button or type the path |

1. Leave the **Password** field empty (SSH key handles authentication)
1. Expand **SSH Authentication** and set the **Private Key Path**
1. Click **Connect**

## File Release System Structure

Once connected, you'll see your project's release directory:

```text
/home/frs/project/your-project/
    v1.0.0/
        your-app-1.0.0-linux-x64.deb
        your-app-1.0.0-windows-x64.msi
        your-app-1.0.0-macos-arm64.dmg
    v1.1.0/
        ...
```

Create a folder for each version, then upload your release files into it. SourceForge automatically makes these available on your project's download page and mirrors them worldwide.

## Tips

- **Organize by version**: Create a folder per release (e.g. `v3.3.0/`) for clean downloads
- **Default download**: SourceForge auto-detects the latest file per platform. You can override this in Project Admin > File Manager
- **Multiple keys**: You can add multiple SSH keys to your SourceForge account (e.g. one per machine)
- **Timeout**: For large uploads, increase the Connection Timeout in the form (default 30 seconds)
- **Web shell**: SourceForge also offers SSH shell access via `shell.sourceforge.net` for advanced management

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| "Authentication rejected" | Make sure your public key is uploaded to SourceForge SSH Settings and wait a few minutes for propagation |
| "Host key changed" | Accept the new host key in the TOFU dialog. SourceForge occasionally rotates server keys |
| Connection timeout | Increase the timeout value in the connection form. SourceForge servers can be slow during peak hours |
| Permission denied on upload | Verify you are a project admin or have release technician permissions on the SourceForge project |
