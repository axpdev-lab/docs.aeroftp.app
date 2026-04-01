# Quick Start

Get connected to your first server in under two minutes. This step-by-step guide walks you through launching AeroFTP, creating an SFTP connection, transferring files, and saving your credentials for future sessions.

## 1. Launch AeroFTP

After [installing](installation.md) AeroFTP, launch it from your application menu, desktop shortcut, or terminal. A splash screen will appear briefly while the application initializes its modules (Tauri runtime, protocol handlers, encryption engine, and IPC bridge).

![AeroFTP splash screen during initial loading](/images/quick-start-splash.png)
<!-- SCREENSHOT: The splash screen showing the AeroFTP logo with the loading progress bar and module names cycling at the bottom (e.g., "Loading protocol handlers...") -->

## 2. The Connection Screen

Once loaded, you arrive at the **connection screen**. On a fresh install this area will be empty. After you save servers, their cards will appear here for one-click reconnection.

At the top of the screen you will find the **protocol selector** -- a categorized grid of all 23 supported protocols. Below the selector are the connection input fields that adapt based on your chosen protocol.

![Main connection screen with empty saved servers area and protocol selector at the top](/images/quick-start-connection-screen.png)
<!-- SCREENSHOT: The connection screen on first launch. Show the protocol selector bar at top (collapsed state), the empty saved-servers area with placeholder text, and the connection form fields below. Use the Dark theme for consistency. -->

## 3. Choose a Protocol

Click the **protocol selector** to expand the full protocol grid. Protocols are organized into distinct categories:

| Category | Protocols | Authentication |
| --- | --- | --- |
| **Servers** | FTP, FTPS, SFTP | Host + username/password or SSH key |
| **Cloud (OAuth)** | Google Drive, Dropbox, OneDrive, Box, pCloud, MEGA, Filen, Zoho, Internxt, kDrive, Koofr, Jottacloud, Yandex Disk, OpenDrive, FileLu, 4shared | Browser-based OAuth2 authorization |
| **S3-Compatible** | AWS S3, Backblaze B2, Wasabi, Cloudflare R2, DigitalOcean Spaces, Storj, and more | Access Key + Secret Key |
| **WebDAV** | Nextcloud, Seafile, CloudMe, or custom WebDAV servers | Host + username/password |

Each protocol card displays a provider logo and name. Hover over a card to see a brief description. Click a card to select it and load the appropriate connection fields.

![Protocol selector expanded showing all categories: Servers, Cloud OAuth, S3, WebDAV](/images/quick-start-protocol-selector.png)
<!-- SCREENSHOT: The protocol selector fully expanded, showing the grid of protocol cards organized by category. All 27 protocols visible with their logos. Dark theme. -->

## 4. Enter Connection Details (SFTP Example)

For this guide, select **SFTP** from the Servers category. The connection form will display four fields:

- **Host**: Enter your server hostname or IP address (e.g., `nas.example.com` or `192.168.1.100`)
- **Port**: Defaults to `22` for SFTP. Change only if your server uses a non-standard port.
- **Username**: Your SSH account username
- **Password**: Your SSH password or key passphrase

Fill in all four fields. If your server uses key-based authentication, AeroFTP will attempt to load your default SSH keys from `~/.ssh/`.

![Connection fields filled in for an SFTP connection with host, port, username, and password](/images/quick-start-sftp-fields.png)
<!-- SCREENSHOT: The connection form with SFTP selected. Fields filled in: Host = "nas.example.com", Port = "22", Username = "admin", Password = dots (masked). The Connect button is visible and enabled at the bottom. Dark theme. -->

> **Cloud providers:** For OAuth-based services like Google Drive or Dropbox, the form shows an **Authorize** button instead of username/password fields. Clicking it opens your browser to complete the OAuth login flow. No manual credentials are needed.

## 5. Connect

Click the **Connect** button. AeroFTP initiates the SSH handshake with the remote server.

### First-Time Host Key Verification (SFTP)

When connecting to an SFTP server for the first time, AeroFTP displays a **TOFU (Trust On First Use) host key verification dialog**. This PuTTY-style dialog shows:

- The server's **SHA-256 fingerprint**
- The key type (e.g., ED25519, RSA)
- A warning that the host is not yet in your known hosts database

Verify the fingerprint matches your server's actual host key, then click **Accept** to trust it. The key is stored locally and verified on all subsequent connections. If the key ever changes unexpectedly, AeroFTP will display a prominent **MITM warning**.

![TOFU host key verification dialog showing the server fingerprint](/images/quick-start-tofu-dialog.png)
<!-- SCREENSHOT: The host key verification dialog for a first-time SFTP connection. Show the SHA-256 fingerprint, key type badge, the warning text about unknown host, and the Accept/Reject buttons. Dark theme. -->

## 6. You Are Connected

After successful authentication, the **dual-pane file manager** appears:

- **Left panel**: Your local filesystem, starting at your home directory
- **Right panel**: The remote server, starting at your SSH user's home directory

Both panels display files with sortable columns: Name, Size, Date Modified, Type, and Permissions. A breadcrumb path bar at the top of each panel shows your current location.

![Connected dual-pane view with local files on the left and remote files on the right](/images/quick-start-connected.png)
<!-- SCREENSHOT: The full AeroFTP window after a successful SFTP connection. Left panel showing local home directory files, right panel showing remote server files. Session tab visible at the top of the remote panel. Status bar at the bottom showing protocol and host info. Dark theme. -->

## 7. Transfer Files

There are several ways to move files between local and remote:

- **Drag and drop**: Drag files or folders from one panel to the other
- **Double-click**: Opens files locally or downloads remote files
- **Context menu**: Right-click a file and select **Upload** or **Download**
- **Keyboard**: Select files and use the toolbar buttons

During a transfer, a **progress bar** appears showing:

- Percentage complete
- Transfer speed (MB/s)
- Estimated time remaining (ETA)
- Current file name in batch transfers

![File transfer in progress with progress bar showing speed and ETA](/images/quick-start-transfer.png)
<!-- SCREENSHOT: A file transfer in progress. Show the transfer progress bar at the bottom of the window with percentage, speed (e.g., "12.4 MB/s"), ETA, and the filename. Both panels visible above. Dark theme. -->

## 8. Save the Connection

After connecting successfully, save your server profile so you can reconnect instantly next time:

1. Navigate to **File > Save Connection** in the titlebar menu
2. Optionally give the connection a memorable name
3. Click **Save**

Credentials are stored in AeroFTP's **encrypted vault** (AES-256-GCM + Argon2id). They never touch your filesystem as plaintext.

![Save server dialog with connection name and save button](/images/quick-start-save-server.png)
<!-- SCREENSHOT: The save server dialog/prompt showing the connection name field, protocol badge (SFTP), host info, and the Save button. Dark theme. -->

## 9. Reconnect from Saved Servers

Next time you launch AeroFTP, your saved servers appear as **cards** on the connection screen. Each card displays the server name, protocol badge, and host. Click any card to reconnect instantly with stored credentials.

Right-click a server card for additional options: Edit, Duplicate, Health Check, or Delete.

![Saved servers panel showing server cards with protocol badges](/images/quick-start-saved-servers.png)
<!-- SCREENSHOT: The connection screen with 2-3 saved server cards visible. Each card shows a server name, protocol icon/badge (e.g., SFTP, Google Drive), and hostname. One card could show a green "connected" indicator. Dark theme. -->

## 10. Essential Keyboard Shortcuts

These shortcuts will accelerate your workflow from day one:

| Shortcut | Action |
| --- | --- |
| `Ctrl+Shift+P` | Open the Command Palette (search ~25 commands) |
| `Ctrl+Shift+N` | New connection |
| `Ctrl+Shift+E` | Toggle AeroTools panel (editor, terminal, AI) |
| `F2` | Rename selected file inline |
| `F5` | Refresh file listing |

## What to Explore Next

Now that you are connected, there is much more to discover:

- **[Interface Overview](interface.md)** -- Detailed tour of every UI element
- **[AeroSync](../features/aerosync.md)** -- Intelligent directory synchronization with conflict resolution
- **[AeroVault](../features/aerovault.md)** -- Military-grade encrypted file containers
- **[AeroAgent](../features/aeroagent.md)** -- AI assistant with 47 tools for file management and code analysis
- **[AeroTools](../features/aerotools.md)** -- Integrated code editor (Monaco), terminal, and development tools
- **[Protocols Overview](../protocols/overview.md)** -- Guide to all 23 supported protocols

> **Next step:** Read the [Interface Overview](interface.md) to understand every panel, menu, and shortcut available in AeroFTP.
