# GitHub

AeroFTP treats GitHub repositories as remote filesystems. Every write operation -- upload, delete, rename, move -- creates a real Git commit on the target branch. This means you can manage repository contents, upload release assets, and browse code using the same file manager interface as any other protocol. GitHub is the 23rd protocol supported by AeroFTP.

## Capabilities

| Feature | Supported |
| ------- | --------- |
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

![GitHub authentication mode selection](/images/github-connection.png)
<!-- SCREENSHOT: GitHub connection card showing the three authentication options: "Authorize with GitHub" button (highlighted as recommended), Personal Access Token input field, and GitHub App .pem key upload. -->

AeroFTP supports three authentication methods for GitHub, each suited to different use cases.

### 1. Authorize with GitHub (Recommended)

One-click browser authentication via the AeroFTP GitHub App at [github.com/apps/aeroftp](https://github.com/apps/aeroftp). This is the easiest method -- no tokens to manage, no expiration dates to track.

- Click **Authorize with GitHub** in the connection dialog.
- Your browser opens to GitHub's authorization page.
- Grant the AeroFTP GitHub App access to your repositories.
- The authorization code is captured automatically.

Commits are attributed to your GitHub username and avatar. The app requests only the minimum permissions needed: repository contents (read/write) and metadata (read).

### 2. Personal Access Token

For users who prefer manual token management or need access to organizations that have not installed the AeroFTP GitHub App.

Generate a **fine-grained Personal Access Token** from [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).

**Required permissions:**

| Permission | Access |
| ---------- | ------ |
| Contents | Read and write |
| Metadata | Read |

Paste the token into the connection dialog. Commits are attributed to the token owner's GitHub identity (username and avatar).

> **Tip**: Fine-grained tokens can be scoped to specific repositories, which is more secure than classic tokens that grant access to all repositories.

### 3. GitHub App with `.pem` Key

Create a custom GitHub App for branded bot commits. This is the best option for teams and CI workflows where you want commits to appear as a bot rather than a personal account.

- Create a GitHub App in your organization's settings.
- Generate a private key (`.pem` file) for the app.
- Enter the App ID and upload the `.pem` file in AeroFTP's connection dialog.

The commit author appears as `yourapp[bot]` with your custom app logo. This provides clear audit trails in repositories where automated and manual changes should be distinguishable.

## Write Modes

AeroFTP automatically detects the branch protection level and selects the appropriate write mode. The current write mode is displayed in the status bar.

![Write mode indicator in the status bar](/images/github-write-mode.png)
<!-- SCREENSHOT: The bottom status bar showing the write mode badge, e.g. "DirectWrite" or "BranchWorkflow" with the branch name. -->

| Mode | Description |
| ---- | ----------- |
| **DirectWrite** | Branch accepts commits directly -- pushes go straight to the target branch. This is the default for unprotected branches. |
| **BranchWorkflow** | Protected branch detected -- AeroFTP auto-creates an `aeroftp/{user}/{base}` working branch and commits there. You can then create a pull request from GitHub's web interface. |
| **ReadOnly** | Token lacks write access -- browse and download only. No commit operations are available. |

Write mode detection happens automatically on connection. If you switch branches, the write mode is re-evaluated for the new branch.

## Branch Awareness

![Branch selector dropdown](/images/github-branch-selector.png)
<!-- SCREENSHOT: The branch selector dropdown in the toolbar showing a list of branches (main, develop, feature/xyz) with the currently selected branch highlighted. -->

AeroFTP lists all branches in the repository and lets you switch between them using a dropdown in the toolbar. The current branch name is always visible.

- **Default branch**: On connection, AeroFTP selects the repository's default branch (usually `main` or `master`).
- **Branch switching**: Select any branch from the dropdown to browse its contents. The file list updates immediately.
- **Branch in URL mode**: When using the CLI, append `@branch` to the repository path to select a branch.

## Batch Commits

![Commit message dialog](/images/github-commit-dialog.png)
<!-- SCREENSHOT: The commit message dialog that appears when uploading files, showing a text input for the commit message, the list of files being committed, and Commit/Cancel buttons. -->

When uploading multiple files in a single operation, AeroFTP prompts for a commit message once and reuses it across the batch. In current builds, batch upload/delete flows can use an atomic GraphQL commit, while single-file writes still go through the normal per-file content APIs.

- A dialog appears showing the files that will be committed.
- Enter a descriptive commit message.
- All files are committed with the same message.
- Single-file writes create normal content commits. Batch upload/delete flows can be committed atomically when the GraphQL path is used.

## Release Asset Management

GitHub Releases are exposed through a virtual `/.github-releases/` directory at the repository root. Each release tag appears as a subdirectory containing its assets.

```text
/.github-releases/
  v2.9.8/
    aeroftp_2.9.8_amd64.deb
    aeroftp_2.9.8_x86_64.rpm
    aeroftp_2.9.8.AppImage
  v2.9.7/
    aeroftp_2.9.7_amd64.deb
    ...
```

- **Upload** assets up to **2 GiB** per file by dragging files into a release directory.
- **Download** release assets with double-click or the CLI `get` command.
- **Delete** assets via the right-click context menu.
- Assets are managed via the GitHub Releases API, not Git LFS.

## CLI Usage

GitHub repositories are fully accessible from the AeroFTP CLI using saved profiles or URL mode.

### Profile Mode

```bash
# List repository root
aeroftp-cli ls --profile "My GitHub Repo" / -l

# Browse a subdirectory
aeroftp-cli ls --profile "My GitHub Repo" /src/components/ -l

# Upload a file (creates a commit)
aeroftp-cli put --profile "My GitHub Repo" ./fix.py /src/fix.py

# Download a file
aeroftp-cli get --profile "My GitHub Repo" /README.md ./

# Delete a file (creates a commit)
aeroftp-cli rm --profile "My GitHub Repo" /old-file.txt

# Directory tree
aeroftp-cli tree --profile "My GitHub Repo" /src/ -d 3

# Search for files
aeroftp-cli find --profile "My GitHub Repo" / -n "*.tsx"
```

### URL Mode

```bash
# Browse with a Personal Access Token
aeroftp-cli ls github://token:YOUR_PAT@owner/repo /src/

# Browse a specific branch
aeroftp-cli ls github://token:YOUR_PAT@owner/repo@develop /

# Download from a feature branch
aeroftp-cli get github://token:YOUR_PAT@owner/repo@feature/new-ui /src/App.tsx ./
```

The `@branch` suffix selects a specific branch. Without it, the repository's default branch is used.

## Technical Details

| Property | Value |
| -------- | ----- |
| API | GitHub REST v3 + GraphQL batch commit support |
| Rate limit | 5,000 requests/hour (authenticated) |
| Max file size (repo) | 100 MiB (GitHub Contents API limit) |
| Max file size (release asset) | 2 GiB |
| Commit identity | User avatar (OAuth/PAT) or `app[bot]` logo (GitHub App) |
| Write mode detection | Automatic via branch protection API |

## Limitations

- **API rate limits apply** -- heavy operations on large repositories may require pacing. AeroFTP does not currently implement rate limit backoff for GitHub.
- **Files larger than 100 MiB** must be uploaded as release assets, not repository files. This is a GitHub limitation, not an AeroFTP limitation.
- **Binary files** are stored as-is in Git (no LFS integration). Large binary files will bloat the repository.
- **Branch protection rules** are respected -- AeroFTP cannot bypass required reviews, status checks, or signed commit requirements.
- **Single-file writes and batch flows differ** -- single-file uploads use the Contents API; batch upload/delete flows can use GraphQL `createCommitOnBranch` for atomic commits.
