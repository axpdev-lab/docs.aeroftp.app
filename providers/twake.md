---
title: Twake Drive with AeroFTP
description: Connect Twake Drive (Linagora Twake Workplace, now home of Cozy Cloud) to AeroFTP with a browser sign-in on your own instance.
---

# Twake Drive

<ProviderPlanCard id="twake" />

Twake Drive is the file storage of **Twake Workplace**, the open-source workspace by Linagora (France). Cozy Cloud is now part of Twake Workplace, so existing Cozy instances work the same way. AeroFTP connects through the native files API of your instance with a browser sign-in: there is no developer app to create and no password to paste.

::: info Availability
Twake Drive ships in the release after AeroFTP v4.2.0. AeroFTP v4.2.0 has no Twake Drive connection.
:::

## What You Need

- a Twake Workplace account (the free plan is enough)
- the address of your instance, for example `yourname.twake.app`. You can also paste the address of any Twake page from your browser, such as `https://yourname-drive.twake.app/#/folder`: AeroFTP turns it into the instance address
- a regular desktop browser (Chrome, Firefox, Edge, Safari). The sign-in page does not open in embedded browsers

## How to Connect

1. Open AeroFTP and select **Twake Drive** from the cloud storage providers.
1. Enter the address of your instance.
1. Click **Sign in with Twake**. Your browser opens the Twake authorization page.
1. Log in if asked, then click **Authorize**. The page asks for access to your files only.
1. Back in AeroFTP the form shows **Signed in**. Connect and save the profile.

AeroFTP registers itself on your instance during the sign-in. It then appears in Twake under **Settings**, **Connected devices**, where you can revoke it at any time.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | Twake Drive | Native files API |
| Instance | `https://yourname.twake.app` | Your own address; self-hosted instances work too |
| Authentication | Browser sign-in (OAuth2 + PKCE) | The client is registered on your instance, nothing is shared with a third party |
| Permission | Files | No access to mail, contacts or settings |

## Features

- **File operations**: upload, download, rename, move, copy on the server, delete and create folders
- **Checksums**: Twake stores an MD5 for every file; AeroFTP checks each upload against it
- **Storage quota**: used and total space are shown for the account
- **Modification times**: kept on upload and restored on download
- **AeroSync and the CLI**: supported, including parallel transfers
- **Trash**: deleted files go to the Twake trash and keep counting against the quota until you empty it from the Twake web interface

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Twake shows "The state parameter is mandatory" | You were not logged in to Twake, and the login step dropped the request | Log in to Twake in your browser, then click **Sign in again** in AeroFTP |
| "Your web browser is not up-to-date" | The sign-in opened in an embedded browser | Make sure your system default browser is a regular desktop browser |
| The profile asks you to sign in again | The instance address changed, or AeroFTP was removed from **Connected devices** | Click **Sign in again** |
| Storage looks full after deleting files | Deleted files stay in the Twake trash | Empty the trash in Twake Drive |

## Related Documentation

- [Provider Reference](/advanced/provider-reference)
