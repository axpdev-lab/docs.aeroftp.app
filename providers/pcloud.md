# pCloud

<ProviderPlanCard id="pcloud" />

AeroFTP connects to pCloud via their native API with OAuth2 authentication. pCloud offers 10 GB of free storage with US and EU data center options.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the pCloud protocol.
2. A browser window opens to pCloud's authorization page.
3. Sign in and approve access.
4. Authorization completes automatically.

OAuth tokens are stored encrypted in the OS keyring.

## Requesting a pCloud OAuth app

AeroFTP uses credentials from your own pCloud OAuth app. pCloud currently limits self-service app creation, so the developer portal may ask you to contact support instead of creating the app immediately.

1. Sign in to the [pCloud My Apps](https://docs.pcloud.com/my_apps/) page.
2. Select **New app** and follow the portal prompts. If pCloud reports that app creation is temporarily unavailable, contact pCloud support from your account and request an OAuth app for use with AeroFTP.
3. After pCloud creates or approves the app, open it in **My Apps** and copy its **Client ID** and **Client secret**. Keep the secret private.
4. In AeroFTP, open **Quick Connect**, select **pCloud**, and paste those values into **Client ID** and **Client Secret**.
5. Click **Sign in with pCloud**, then approve access in the browser window.

The **Manage credentials** link in pCloud Quick Connect opens **My Apps** for existing apps. It does not guarantee that self-service creation is currently available.

For details about the authorization flow, see pCloud's [OAuth 2.0 documentation](https://docs.pcloud.com/methods/oauth_2.0/).

## Data Center Regions

When creating a pCloud account, you choose a data center region:

| Region | API Endpoint | Notes |
|--------|-------------|-------|
| **United States** | `api.pcloud.com` | Default |
| **European Union** | `eapi.pcloud.com` | GDPR-compliant |

AeroFTP auto-detects your data center based on the OAuth response. If detection fails, you can set the region manually.

## Features

- **Trash Management**: Deleted files can be recovered from pCloud's trash.
- **File Versioning**: pCloud retains up to 15 days of version history (30 days on Premium).
- **Shared Links**: Create download and upload links for files and folders.
- **Storage Quota**: Used and total storage displayed in the status bar.
- **Streaming Transfers**: Large files are uploaded and downloaded with streaming I/O.

## Tips

- pCloud's 10 GB free tier does not expire, unlike some competitors.
- pCloud also offers lifetime plans (one-time payment) -- a unique offering among cloud providers.
- For AeroSync, pCloud provides file hashes that enable efficient change detection.
- If your account is on the EU server, ensure you selected the EU region during pCloud account creation. You cannot migrate between regions.
