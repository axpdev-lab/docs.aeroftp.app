# MEGA

AeroFTP connects to MEGA's end-to-end encrypted cloud storage. All files are encrypted client-side with AES-128 before upload. MEGA provides 20 GB of free storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Email | Your MEGA account email | |
| Password | Your MEGA password | Used to derive the encryption master key |

MEGA does not use OAuth. Your password is used locally to derive the AES master key -- it is never sent to MEGA's servers in plaintext.

## Features

- **End-to-End Encryption**: All files are encrypted with AES-128 before leaving your device. MEGA cannot read your files.
- **Shared Links**: Create encrypted share links. Recipients need the decryption key (included in the link by default).
- **Large Storage**: 20 GB free tier, one of the most generous free offerings.
- **Streaming Transfers**: Files are encrypted/decrypted on the fly during upload and download.

## Tips

- MEGA's encryption means that server-side operations (rename, move) require re-encrypting metadata. This is handled transparently by AeroFTP.
- If you have 2FA enabled on your MEGA account, you will be prompted for the TOTP code during login.
- MEGA's API has bandwidth quotas on free accounts. If you hit the transfer limit, you will need to wait or upgrade.
- For AeroSync, use the **size** compare mode since MEGA does not expose file modification times reliably.
