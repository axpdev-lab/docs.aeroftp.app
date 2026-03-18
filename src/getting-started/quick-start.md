# Quick Start

Get connected to your first server in under a minute. This guide walks you through creating a connection, browsing remote files, and performing your first transfer.

## 1. Launch AeroFTP

After [installing](installation.md) AeroFTP, launch it from your application menu or desktop. You will see the connection screen with your saved servers (empty on first launch).

## 2. Create a New Connection

Click the **protocol selector** at the top of the connection screen. AeroFTP supports 22 protocols organized into three categories:

| Category | Protocols |
| ---------- | ----------- |
| **Servers** | FTP, FTPS, SFTP, WebDAV |
| **Cloud (S3)** | AWS S3, Backblaze B2, Wasabi, Cloudflare R2, and more |
| **Cloud (OAuth)** | Google Drive, Dropbox, OneDrive, MEGA, Box, pCloud, and more |

Select a protocol to continue. For this guide, we will use **SFTP** as an example.

## 3. Enter Connection Details

Fill in the connection fields:

- **Host**: Your server hostname or IP address (e.g., `example.com`)
- **Port**: The service port (default `22` for SFTP)
- **Username**: Your account username
- **Password**: Your account password or key passphrase

> **Tip:** For cloud providers like Google Drive or Dropbox, click **Authorize** to complete the OAuth login in your browser. No manual credentials are needed.

## 4. Connect

Click **Connect**. AeroFTP will establish the connection and display the remote file listing in the right panel.

For SFTP connections to a new server, you will see a **host key verification dialog** showing the server's SHA-256 fingerprint. Verify the fingerprint and click **Accept** to continue.

## 5. Browse and Transfer Files

The interface is a **dual-pane file manager**:

- **Left panel**: Your local files
- **Right panel**: Remote server files

To transfer files:

- **Drag and drop** files between panels
- **Double-click** a file to open/download it
- **Right-click** for context menu options (upload, download, rename, delete, and more)

A progress bar will appear at the bottom during transfers, showing percentage, speed, and estimated time remaining.

## 6. Save the Connection

After a successful connection, AeroFTP automatically offers to save your server profile. You can also save manually through **File > Save Connection** or by clicking the save icon. Saved servers appear on the connection screen for one-click access.

## 7. Explore Further

Now that you are connected, explore what AeroFTP can do:

- **[AeroSync](../features/aerosync.md)** -- Synchronize directories between local and remote
- **[AeroVault](../features/aerovault.md)** -- Create encrypted file containers
- **[AeroAgent](../features/aeroagent.md)** -- AI assistant for file management
- **[AeroTools](../features/aerotools.md)** -- Integrated code editor, terminal, and dev tools
- **[Interface Overview](interface.md)** -- Full guide to the UI layout

> **Next step:** Read the [Interface Overview](interface.md) to learn about all the panels and tools available.
