# Seafile

<ProviderPlanCard id="seafile" />

Seafile is an open-source file platform commonly deployed as a self-hosted service, but AeroFTP's preset also works with managed hosted instances such as Seafile Plus / Seafile Cloud when they expose SeafDAV.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | WebDAV | Built-in preset |
| Server | `https://your-server.com/seafdav/` | Or `https://plus.seafile.com/seafdav/` for Seafile Cloud |
| Port | 443 | HTTPS |
| Username | Your Seafile email | |
| Password | Your Seafile password | |

## How to Connect

1. Open AeroFTP.
2. Select **Seafile** from the provider list.
3. Enter your server URL (or use the default for Seafile Cloud).
4. Enter your email and password.
5. Connect and verify the directory listing.

## Features

- **File operations**: Upload, download, rename, move, and delete files and folders.
- **Deployment flexibility**: Connect to self-hosted Seafile servers or hosted Seafile services through the same SeafDAV endpoint pattern.
- **AeroSync**: Supported with size + modification time compare mode.

## Hosted Seafile Plus: Observed Trial Behavior

The commercial model for **Seafile Plus** is less transparent on the public site than on the logged-in account pages. Based on a current hosted account verification on 2026-05-13:

- the organization billing page showed **Team Plan Trial**
- the hosted trial exposed **up to 3 users**
- the organization storage line showed **1 GB total**
- the organization dashboard showed **300 GB monthly traffic**
- the organization dashboard showed **6 AI credits per month**
- the billing page showed **USD 0** with a 30-day window and a next billing date one month later

This clarifies the distinction between plan data and tenant configuration:

- the **organization-level hosted trial** is the part that belongs in pricing docs (`1 GB total`, `3 users`, `300 GB monthly traffic`, `6 AI credits/month`)
- the **user quota** is assigned by the org admin and can be changed at any time, so it should not be documented as a public Seafile plan limit

The reminder email sent by Seafile Plus says the team has been deactivated and can be reactivated by clicking the recovery link. The public pricing text also describes the cloud offer as a **trial plan** that is inactivated after 30 days and deleted within a retention window. In the observed account, the deactivation email could still be used to reactivate the trial month-by-month. That behavior is useful for testing, but it should be treated as an **observed account state**, not as a guaranteed public policy.

## Tips

- The WebDAV endpoint path is `/seafdav/` - make sure to include the trailing slash.
- For self-hosted instances, ensure WebDAV is enabled in your Seafile server configuration (`ENABLE_WEBDAV = True` in `seahub_settings.py`). Hosted Seafile services usually manage this for you.
- Seafile libraries appear as top-level directories in the WebDAV view.
- If you are documenting **Seafile Plus**, use the **organization plan / billing pages** for plan limits and treat user quotas as admin configuration.
- Hosted trial retention wording appears inconsistent between surfaces: account emails may mention deletion after 60 days, while other Seafile trial wording references deletion within 90 days. Verify the current wording in the active account before documenting retention behavior.
- Hosted trial reactivation currently appears to work through reminder-email links, but it is safer to document this as an observed behavior, not a guaranteed renewable free plan.

## Related Documentation

- [WebDAV](/protocols/webdav)
