# Google Photos

Browse, download and upload photos and videos from your Google Photos library. Albums are shown as folders, media items as files.

## Capabilities

| Feature | Supported | Notes |
|---------|-----------|-------|
| Browse albums | Yes | Albums shown as folders |
| Browse all photos | Yes | Virtual `[All Photos]` folder |
| Browse favorites | Yes | Virtual `[Favorites]` folder |
| Download originals | Yes | Full resolution photos and videos |
| Upload photos/videos | Yes | New media only |
| Create albums | Yes | Via mkdir |
| Delete | No | Google Photos API limitation |
| Rename | No | Google Photos API limitation |
| Thumbnails | Yes | Dynamic sizing via URL parameters |

## Requirements

Google Photos uses the same Google Cloud project as Google Drive. You need:

1. A Google Cloud project with OAuth2 credentials (Client ID + Client Secret)
2. The **Photos Library API** enabled in that project
3. The OAuth scopes `photoslibrary.readonly` and `photoslibrary.appendonly` added to your consent screen

If you already use Google Drive in AeroFTP, you already have a Google Cloud project. You just need to enable the Photos Library API and add the scopes.

## Setup Guide

### Step 1: Enable Photos Library API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you have the **correct project** selected in the top bar (the same one you use for Google Drive)
3. Go to **APIs & Services** > **Library**
4. Search for **"Photos Library API"**
5. Click **Enable**

[ Screenshot 01 - Photos Library API page with Enable button ]

### Step 2: Add OAuth Scopes

1. Go to **Google Auth Platform** > **Accesso ai dati** (Data Access)
2. Click **"Aggiungi o rimuovi ambiti"** (Add or remove scopes)
3. In the manual input box at the bottom, paste these two lines:
```
https://www.googleapis.com/auth/photoslibrary.readonly
https://www.googleapis.com/auth/photoslibrary.appendonly
```
4. Click **"Aggiungi alla tabella"** (Add to table)
5. Verify both scopes appear as checked in the list
6. Click **Save**

[ Screenshot 02 - Scopes page with photoslibrary scopes added ]

!!! tip "Already have Google Drive?"
    If you already configured Google Drive, your `drive` and `drive.file` scopes should already be there. Add the Photos scopes alongside them.

### Step 3: Connect in AeroFTP

1. Open AeroFTP
2. Go to **Discover Services** > **Media Services** > **Google Photos**
3. The Client ID and Client Secret are **automatically filled** from your Google Drive configuration
4. Click **"Sign in with Google Photos"**
5. Your browser opens with the Google consent screen
6. Select your Google account
7. If you see "Google non ha verificato questa app" (Google hasn't verified this app), click **"Continua"** (Continue) - this is normal for personal OAuth apps
8. Grant both permissions:
   - View your Google Photos library
   - Add items to your Google Photos library
9. Click **"Continua"** (Continue)
10. AeroFTP connects and shows your albums

[ Screenshot 03 - AeroFTP Discover Services with Google Photos selected ]

[ Screenshot 04 - Google consent screen with Photos permissions ]

[ Screenshot 05 - AeroFTP connected showing albums ]

### Step 4 (Optional): Save Connection

Check **"Save this connection"** before signing in to add Google Photos to your My Servers list for quick access.

## Browsing Your Library

Once connected, you'll see:

```
/                      ← Root: list of albums
/[All Photos]/         ← Virtual folder: all media items
/[Favorites]/          ← Virtual folder: favorited items
/Vacation 2024/        ← Your albums as folders
/Family/               ← Each album contains its photos
```

- **Albums** appear as folders with a folder icon
- **Photos and videos** appear as files with their original filename
- File size may show as 0 (Google Photos API does not expose file sizes)
- Modification date shows the photo's creation time (EXIF date)

## Downloading Photos

- Double-click a photo to download it
- Right-click a folder to download an entire album
- Photos are downloaded in **original quality** (full resolution)
- Videos are downloaded in their original format
- Downloaded files preserve the original creation timestamp

!!! note "baseUrl Expiration"
    Google Photos download URLs expire after ~60 minutes. AeroFTP automatically refreshes them before each download.

## Uploading Photos

- Drag and drop photos from your local panel to a Google Photos album
- Or use the Upload button in the toolbar
- Uploaded photos appear in Google Photos within seconds
- Supported formats: JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, RAW formats (NEF, CR2, ARW, DNG), MP4, MOV, AVI, MKV, WebM

!!! warning "Upload Only"
    You can upload new photos, but you cannot overwrite or delete existing ones. This is a deliberate limitation of the Google Photos API to protect users' memories.

## Limitations

- **No delete**: The Google Photos API does not allow deleting media items
- **No rename**: Media items cannot be renamed via the API
- **No move between albums**: Moving photos between albums is not supported
- **Upload only**: You can add new photos but cannot modify existing ones created by other apps
- **Shared storage**: The 15 GB free storage is shared with Google Drive and Gmail
- **File size not available**: Google Photos API does not expose file sizes in listings

## Troubleshooting

### 403 Forbidden Error

This means either:

1. **Photos Library API not enabled**: Go to Google Cloud Console > APIs & Services > Library > search "Photos Library API" > Enable
2. **Wrong project**: Make sure you're enabling the API in the **same project** where your OAuth Client ID was created. Check the Client ID under Google Auth Platform > Client
3. **Scopes not added**: Go to Google Auth Platform > Data Access > Add the `photoslibrary.readonly` and `photoslibrary.appendonly` scopes
4. **Stale token**: If you enabled the API after your first sign-in, the old token is invalid. Open AeroFTP DevTools console (Ctrl+Shift+I) and run:
```javascript
await __TAURI_INTERNALS__.invoke('delete_credential', { account: 'oauth_googlephotos' })
```
Then sign in again.

### Callback Timeout

If you see "Callback error: Timeout", the OAuth flow took too long. Click "Sign in with Google Photos" again and complete the Google consent screen quickly (within 5 minutes).

### "Google hasn't verified this app"

This is normal when using your own OAuth credentials. Click "Continue" to proceed. This message will disappear once the app is verified by Google.
