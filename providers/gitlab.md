# GitLab

AeroFTP treats GitLab repositories as remote filesystems using the GitLab REST API v4. You can browse, upload, download, and delete files directly from any GitLab instance, including self-hosted ones. Every write operation creates a real Git commit on the target branch.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Personal Access Token | Your GitLab PAT | From GitLab > Preferences > Access Tokens |
| API URL | `https://gitlab.com` | Or your self-hosted GitLab instance URL |

## Authentication

Generate a **Personal Access Token** from your GitLab instance:

1. Go to **Preferences > Access Tokens** (or `/~/-/user_settings/personal_access_tokens`).
2. Create a token with the `api` scope.
3. Paste the token into AeroFTP's connection dialog.

AeroFTP authenticates via the `PRIVATE-TOKEN` header (not Bearer), following GitLab's standard API authentication.

## Features

- **Browse repositories as filesystem**: Navigate projects and files like a directory tree.
- **File operations**: Upload, download, rename, move, and delete files (each operation creates a commit).
- **Self-hosted support**: Connect to any GitLab instance by changing the API URL.
- **Branch awareness**: Browse and operate on any branch in the repository.
- **Pagination**: Handles large repositories using GitLab's `x-next-page` header pagination.

## Tips

- GitLab uses `PRIVATE-TOKEN` header authentication, not the `Authorization: Bearer` scheme used by GitHub.
- For self-hosted instances, set the API URL to your instance root (e.g. `https://gitlab.yourcompany.com`).
- The token needs the `api` scope for full read/write access. Use `read_api` for read-only browsing.
- Rate limits are tracked via `ratelimit-remaining` response headers. AeroFTP monitors these automatically.
