# kDrive

AeroFTP connects to Infomaniak kDrive via the official API. kDrive is a Swiss cloud storage service by Infomaniak, offering 15 GB of free storage.

## Connection Settings

To connect AeroFTP to your kDrive account, you need to generate a Personal API Token.

**How to generate a kDrive API Token:**
1. Log in to your Infomaniak Manager at [manager.infomaniak.com](https://manager.infomaniak.com/).
2. Click on your **Profile icon** (or name badge) in the top-right corner.
3. Select **Manage my profile** (or My Account / Users and profile).
4. In the left menu, select **Developer** > **API Tokens**.
5. Click **Create a token**.
6. For **Application**, select *Default application*.
7. For **Scopes**, add `drive - Drive products`.
8. Set **Valid for** to *Unlimited*.
9. Click **Create the token** and copy the generated token into AeroFTP.

**Drive ID:**
You can optionally specify a **Drive ID** (a number) if you have multiple drives. If left blank, AeroFTP will automatically connect to your default primary drive.

> [!WARNING]
> **Read-only Root and Base Directories**
> Infomaniak kDrive has strict API restrictions on where files can be uploaded. You **cannot** upload files directly to the root directory (`/`), nor can you upload files directly into the base category folders (e.g., `/Common documents` or `/Private`). If you try, you will receive an error: *"Only directory can be created here"*.
> 
> **Solution:** You must first create a custom folder inside one of the base categories (e.g., `/Common documents/MyUploads`) and upload your files into that subfolder.

## Features

- **Drive Selection**: If your account has multiple kDrives, AeroFTP uses the primary drive by default.
- **Cursor-Based Pagination**: Large directories are loaded efficiently using cursor pagination.
- **Trash Management**: Deleted files go to the kDrive trash and can be restored.
- **File Versioning**: kDrive retains previous versions of files. View and restore versions through AeroFTP.
- **Share Links**: Create shareable links for files and folders.
- **Storage Quota**: Used and total storage displayed in the status bar.

## Tips

- kDrive provides 15 GB free, which is generous among European cloud providers.
- Infomaniak is based in Switzerland, offering strong privacy protections under Swiss law.
- kDrive integrates with Infomaniak's broader ecosystem (email, web hosting, Swiss Transfer).
- For AeroSync, kDrive provides reliable modification timestamps for change detection.
