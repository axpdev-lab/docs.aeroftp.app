# Jottacloud

<ProviderPlanCard id="jottacloud" />

AeroFTP v4.2.5 connects through its native **JFS REST API** provider, not a generic WebDAV preset. Authentication starts from a Personal Login Token and exchanges it through Jottacloud's OIDC flow. The resulting refresh token is saved in the encrypted credential vault.

## Connect

1. Select **Jottacloud** in AeroFTP.
2. Use **Generate Personal Login Token** to open Jottacloud's security page.
3. Generate a token there and paste it into AeroFTP's token field.
4. Connect and save the profile.

The form fills the JFS host and HTTPS port automatically. Do not enter your ordinary account password in place of the generated token. A saved refresh token can reconnect without spending the original login token again. Expired or revoked authorization can require generating a new token.

## Features and limits

- Browse folders, upload and download files, rename, move and delete.
- Storage information reports used space and quota where returned by the account.
- Download resume is available; upload resume is not the same capability.
- The dedicated trash manager supports browsing, restoration and permanent deletion. Folder restore reports the children it restored and any failures.
- Share-link creation and file-version browsing are not exposed by this provider.
- Use size and modification time for comparison when no comparable provider digest is available; the provider does not expose a server-side checksum.

A folder can be removed without recursion only when empty. Permanent deletion is separate from moving a live item to trash. Review the selected trash paths before purging.

## CLI

```bash
aeroftp-cli ls --profile "My Jottacloud" / --json
aeroftp-cli get --profile "My Jottacloud" /report.pdf ./report.pdf
aeroftp-cli sync --profile "My Jottacloud" ./Documents/ /Documents/ --direction upload --dry-run --json
```

Review the plan before executing sync. See [CLI Commands](/cli/commands) for flags and [Checksums](/protocols/checksums) for comparison limitations.
