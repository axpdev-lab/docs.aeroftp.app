---
title: Mail.ru Cloud with AeroFTP
description: Connect Mail.ru Cloud to AeroFTP over WebDAV with the built-in preset and an app password.
---

# Mail.ru Cloud

<ProviderPlanCard id="mailru-cloud" />

Mail.ru Cloud (Облако Mail) is the cloud storage of the Mail.ru mailbox. AeroFTP connects to it over **WebDAV** with a built-in preset that fills in the server for you.

::: info Availability
The Mail.ru Cloud preset ships in the release after AeroFTP v4.2.0. On v4.2.0, use the generic **WebDAV** form with the server `https://webdav.cloud.mail.ru` and the same app password.
:::

## What You Need

- a Mail.ru mailbox (`@mail.ru`, `@inbox.ru`, `@list.ru`, `@bk.ru` or `@internet.ru`)
- an **app password**: since 1 January 2022 Mail.ru blocks the mailbox password for WebDAV. Create one in your account settings under **Security**, **Passwords for external applications**

## How to Connect

1. Open AeroFTP.
1. Select **Mail.ru Cloud** from the WebDAV providers.
1. Enter your full mailbox address as the username.
1. Paste the app password.
1. Connect and save the profile.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | WebDAV | Built-in preset |
| Server | `https://webdav.cloud.mail.ru` | Auto-configured, cloud root |
| Port | 443 | HTTPS |
| Username | Your full mailbox address | For example `name@mail.ru` |
| Password | An app password | Not the mailbox password |

## Features

- **File operations**: upload, download, rename, move, delete and create folders
- **Storage quota**: used and total space are shown for the account
- **AeroSync**: supported
- **Share links**: not available over WebDAV; share from the Mail.ru Cloud web interface

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Authentication failed with the right password | The mailbox password was used | Create and use an app password |
| An app password is rejected | The password was created with a narrow access scope | Recreate it with full access to Mail, Cloud and Calendar |

## Related Documentation

- [WebDAV](/protocols/webdav)
- [Provider Reference](/advanced/provider-reference)
