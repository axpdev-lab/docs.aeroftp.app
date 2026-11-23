# Launch arguments

Since 4.2.8 the desktop app and `aeroftp-cli` read one URL table. A scheme the app accepts is a scheme the CLI accepts, and the other way around. `file://` is not in that table: it names a folder on this machine, and each surface opens it on its own.

A second launch hands the same arguments to the window that is already open. Launching the same endpoint, user and bucket again switches to the tab that already has it.

## Desktop app

```bash
aeroftp 'sftp://user@host.example/reports'
aeroftp --profile "Production NAS"
aeroftp --profile="Home Lab"
```

`--profile` and `--profile=<name>` open a saved server by its name. The name may contain spaces. An empty name is ignored.

## CLI

```bash
aeroftp-cli ls 'sftp://user@host.example/var/www' -l
aeroftp-cli ls --profile "My Server" / --json
```

Saved profiles resolve their own credentials. A URL does not need a saved profile when the scheme can take a user and a secret.

## Secrets

Put the secret in the environment when you can. The app reads the variables of that scheme, in the order listed below, and then `AEROFTP_PASSWORD`. A password written in the URL still works, for a tool that can pass only one argument, and every log masks it with `***`.

A raw `/`, `?` or `#` in that password is refused. Encode them as `%2F`, `%3F` and `%23`. An `@` ends the user part of a URL, so encode it as `%40`.

A query string never carries a secret. A query option the scheme does not list is refused, so a typo cannot connect with the setting silently dropped.

Sign-in providers (Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, 4shared, Twake Drive, and Yandex Disk) do not take a token from the URL. The URL opens the saved profile that already holds the authorization. If none matches, AeroFTP tells you to authorize the account once, or to use `--profile`. Yandex Disk is the exception on the CLI: `aeroftp-cli` also accepts `--token`, so a URL with no saved profile can still connect.

## Server schemes

The port column says where a `:port` in the URL goes. **Native** means the connection reads it. **In the host** means the provider keeps `host:port` in the address it builds. **Refused** means a port in the URL is an error, because the service is reached on its own address.

| Scheme | Secret variables, then `AEROFTP_PASSWORD` | User from the environment | Port |
| --- | --- | --- | --- |
| `ftp`, `ftps` | `FTP_PASSWORD` | | Native |
| `ftpes` | `FTP_PASSWORD` | | Native. Explicit TLS on the FTP port. |
| `sftp`, `scp` | `SFTP_PASSWORD` | | Native |
| `webdav`, `webdavs` | `WEBDAV_PASSWORD` | | Native |
| `s3` | see [S3](#s3) | `AWS_ACCESS_KEY_ID` | Native. The host is the endpoint. |
| `azure` | `AZURE_STORAGE_KEY` | | Refused. Query: `container`. |
| `swift` | `ST_KEY`, `OS_PASSWORD` | | In the host |
| `mega` | | | Refused |
| `proton` | | | Refused |
| `filen` | | | Refused |
| `internxt` | | | Refused |
| `jottacloud` | | | Refused |
| `filelu` | | | Refused |
| `koofr` | | | Refused |
| `opendrive` | | | Refused |
| `github` | | | Refused. See [GitHub and GitLab](#github-and-gitlab). |
| `gitlab` | `GITLAB_TOKEN` | | In the host |
| `kdrive` | `KDRIVE_TOKEN` | | Refused. The host is the drive id: `kdrive://123456/Documents` |
| `drime` | `DRIME_TOKEN` | | Refused. No host: `drime:///Projects` |
| `immich` | `IMMICH_API_KEY` | | In the host. `?scheme=` is `http` or `https` (https when omitted). |
| `imagekit` | `IMAGEKIT_PRIVATE_KEY` | | Refused. The host is the imagekit id. |
| `uploadcare` | `UPLOADCARE_SECRET_KEY` | | Refused. The host is the public key. |
| `backblaze` | `B2_APPLICATION_KEY` | `B2_APPLICATION_KEY_ID` | Refused. The host is the bucket name. |
| `cloudinary` | `CLOUDINARY_API_SECRET` | | Refused. `cloudinary://API_KEY:SECRET@cloud_name/` |

These aliases are accepted and are not listed in the error text: `ssh` (SFTP), `http` and `https` (WebDAV), `protondrive` (Proton Drive), `b2` (Backblaze B2).

## S3

```text
s3://ACCESS_KEY@s3.eu-central-1.amazonaws.com/photos/?bucket=photos&region=eu-central-1
```

The host is the endpoint. A port on that host is part of the endpoint (`s3://ACCESS_KEY@minio.lan:9000/?bucket=photos`). Query options are `bucket`, `region`, `endpoint` and `path_style` (`true` or `false`). `endpoint` names a host, never a user or a password. When `endpoint` is set, its own port wins over the port on the URL host.

Credentials, highest first:

| Source | Access key id | Secret | Session token | Region |
| --- | --- | --- | --- | --- |
| URL | user part | password part | never in a URL | `?region=` |
| AeroFTP | | `AEROFTP_PASSWORD` | | |
| AWS environment | `AWS_ACCESS_KEY_ID` | `AWS_SECRET_ACCESS_KEY` | `AWS_SESSION_TOKEN` | `AWS_REGION`, then `AWS_DEFAULT_REGION` |
| AWS files | `aws_access_key_id` | `aws_secret_access_key` | `aws_session_token` | `region` |

The files are `~/.aws/credentials` and `~/.aws/config`, or the paths in `AWS_SHARED_CREDENTIALS_FILE` and `AWS_CONFIG_FILE`. The profile is `AWS_PROFILE`, or `default`. A complete URL does not open those files. A secret is paired only with its own access key id. The one exception is a bare `AWS_SECRET_ACCESS_KEY` next to a key id that came from the URL.

The endpoint host also selects the S3 preset it belongs to, and a region written into that preset's endpoint template.

## GitHub and GitLab

```text
github://owner/repo
github://owner/repo@release/2026
github://github.com/owner/repo@dev
gitlab://gitlab.com/group/project
gitlab://git.example.com:8443/group/subgroup/project@main
```

The branch is the `@branch` suffix or `?branch=`. Name it once. A GitLab host must contain a dot, and the port stays inside that host. The path is the project, so the URL opens it at its root.

## Sign-in schemes

The host is the saved profile name. `dropbox://work` opens that profile at its start folder. `dropbox://work/` opens the root. A port is refused.

| Scheme | Provider |
| --- | --- |
| `googledrive` | Google Drive. Alias: `drive`. |
| `dropbox` | Dropbox |
| `onedrive` | OneDrive |
| `box` | Box |
| `pcloud` | pCloud |
| `zohoworkdrive` | Zoho WorkDrive |
| `fourshared` | 4shared |
| `twake` | Twake Drive |
| `yandexdisk` | Yandex Disk. The CLI also accepts `--token`. |

## Path

`ftp://host.example` does not name a folder: a tab that is already there stays, and a new connection opens the profile's start folder. `ftp://host.example/` is the root. The path is percent-decoded. A `..` segment behind an encoded separator, or a NUL in the path, is refused.
