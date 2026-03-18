# GitHub

AeroFTP treats GitHub repositories as remote filesystems. Every write operation — upload, delete, rename, move — creates a real Git commit on the target branch. GitHub is the 23rd protocol supported by AeroFTP.

## Capabilities

| Feature | Supported |
|---------|-----------|
| Browse repository as filesystem | Yes |
| Upload files (creates commits) | Yes |
| Delete files (creates commits) | Yes |
| Rename / move files (commits) | Yes |
| Create folders (via `.gitkeep`) | Yes |
| Batch commit prompts | Yes |
| Search files across entire repo | Yes |
| Release asset management | Yes |
| Branch awareness | Yes |

## Authentication

AeroFTP supports three authentication methods for GitHub.

### 1. Authorize with GitHub (Recommended)

One-click browser authentication via the AeroFTP GitHub App at [github.com/apps/aeroftp](https://github.com/apps/aeroftp). This is the easiest method — no tokens to manage. Commits are attributed to your GitHub username and avatar.

### 2. Personal Access Token

Generate a fine-grained PAT from [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).

**Required permissions:**

| Permission | Access |
|------------|--------|
| Contents | Read and write |
| Metadata | Read |

Commits are attributed to the token owner's GitHub identity.

### 3. GitHub App with `.pem` Key

Create a custom GitHub App for branded bot commits. The commit author appears as `yourapp[bot]` with your custom app logo. This is the best option for teams and CI workflows.

## Write Modes

AeroFTP automatically detects the branch protection level and selects the appropriate write mode.

| Mode | Description |
|------|-------------|
| DirectWrite | Branch accepts commits directly — pushes go straight to the target branch |
| BranchWorkflow | Protected branch detected — auto-creates `aeroftp/{user}/{base}` working branch |
| ReadOnly | Token lacks write access — browse and download only |

## Release Asset Management

GitHub Releases are exposed through a virtual `/.github-releases/` directory at the repository root. Each release tag appears as a subdirectory containing its assets.

- Upload assets up to **2 GiB** per file
- Download, delete, and list release assets
- Assets are managed via the GitHub Releases API, not Git LFS

## Batch Commits

When uploading multiple files in a single operation, AeroFTP prompts for a commit message once and reuses it across all file uploads. This keeps the commit history clean and avoids per-file commit noise.

## CLI Usage

GitHub repositories are fully accessible from the AeroFTP CLI using saved profiles or URL mode.

### Profile Mode

```bash
aeroftp ls --profile "My GitHub Repo" /src/ -l
aeroftp put --profile "My GitHub Repo" ./fix.py /src/fix.py
aeroftp get --profile "My GitHub Repo" /README.md ./
aeroftp rm --profile "My GitHub Repo" /old-file.txt
aeroftp tree --profile "My GitHub Repo" /src/ -d 3
```

### URL Mode

```bash
aeroftp ls github://token:YOUR_PAT@owner/repo /src/
aeroftp ls github://token:YOUR_PAT@owner/repo@develop /
```

The `@branch` suffix selects a specific branch. Without it, the default branch is used.

## Technical Details

| Property | Value |
|----------|-------|
| API | GitHub REST v3 + GraphQL foundations |
| Rate limit | 5,000 requests/hour (authenticated) |
| Max file size (repo) | 100 MiB |
| Max file size (release asset) | 2 GiB |
| Commit identity | User avatar (OAuth/PAT) or app[bot] logo (GitHub App) |

## Limitations

- GitHub API rate limits apply — heavy operations on large repositories may require pacing
- Files larger than 100 MiB must be uploaded as release assets, not repository files
- Binary files are stored as-is in Git (no LFS integration)
- Branch protection rules are respected — AeroFTP cannot bypass required reviews or status checks
