# AI Agent Credential Isolation

AeroFTP 4.2.5 lets agents operate on saved profiles without receiving the profile's password or tokens in tool responses. The agent supplies a profile name or ID and a path; Rust resolves authentication and performs the operation.

## The Boundary

The universal credential vault encrypts stored secrets with AES-256-GCM. Automatic unlock uses the OS keyring; optional master-password mode protects its passphrase with Argon2id and AES-GCM. The CLI can unlock with `AEROFTP_MASTER_PASSWORD` or the configured interactive flow. An unattended runner needs its own configured vault and unlock method.

```bash
aeroftp-cli profiles --json
aeroftp-cli ls --profile "Production" /var/www/ --json
aeroftp-cli put --profile "Staging" ./dist/app.js /var/www/app.js
aeroftp-cli sync --profile "NAS Backup" ./data/ /backups/ --direction upload --dry-run
```

These commands do not contain the saved server secret. Discovery still returns nonsecret identifiers such as host, username, protocol and paths. Reading a remote file sends that file's contents to the calling client, and an AI tool may then send it to its model provider. Credential isolation does not make remote file contents private from the agent you authorize to read them.

Do not supply inline URL passwords or paste credentials into a chat. When creating a profile, use write-only stdin or a protected credential file rather than a command-line secret. The protection of existing saved-profile secrets does not remove a secret that a client explicitly supplies from that client's own context, environment or logs.

## Profile Setup

Create profiles in the GUI or with `profile-add`, using `--options-json` for nonsecret provider options and `--password-stdin` or `--credential-json-file` for supported credentials. Browser-authorized providers can use supported headless `profile-auth` actions; native Proton Drive uses `aeroftp-cli proton sign-in`. See [profile creation and authorization](/cli/commands#profile-add-and-headless-authorization).

An exact name or ID is preferred. The CLI also accepts a 1-based index and unique substring matching, with ambiguity reported instead of guessing. Check `auth_state` and the provider's actual capabilities before operations.

`profiles --json` includes `cryptOverlay` (`aerocrypt`, `rclone-crypt` or `null`) and `protocolClass`. A bound overlay encrypts names and content transparently on upload. Read those fields before writing: the transport name alone does not tell you whether a remote is encrypted.

## AeroAgent Server Tools

`server_list_saved` returns saved profile identities without passwords, tokens or API keys. `server_exec` accepts only these operations:

| Operation | Result |
| --- | --- |
| `ls` | Directory entries |
| `cat` | Bounded remote text content |
| `stat` | Metadata |
| `find` | Filename matches |
| `df` | Quota where available |

`server_exec` refuses `get`, `put`, `mkdir`, `rm` and `mv`. Use dedicated download, upload, mkdir, delete and rename tools with their own approval rules. Its high danger classification reflects credential-backed remote access and possible content disclosure. In the CLI agent, `--auto-approve high` allows remote reads but still leaves delete, trash, sync control and shell to approval; `all` and `-y` include those too.

The GUI, CLI agent and native MCP server expose different tool catalogs and approval mechanisms. A CLI agent approval flag does not configure MCP client permission. See [agent orchestration](/features/agent-orchestration) and [MCP setup](/mcp/overview).

## Batch Workflows

```text
# deploy.aeroftp-script
ON_ERROR FAIL
CONNECT --profile "Staging"
PUT ./dist/app.js /var/www/app.js
STAT /var/www/app.js
DISCONNECT
```

The entire script is validated before it starts. File-operation lines use the active connection, and directory sync requires an explicit direction. See [Batch Scripting](/cli/batch-scripting).

## Scope and Limits

Credential isolation is an application boundary, not protection against arbitrary code running as the same OS user. Local agent paths are checked against sensitive locations, and shell execution has an additional denylist, but an authorized client or administrator still controls its own environment. Keep the vault and unlock mechanism protected, authorize only the required operation, and review outputs that may contain confidential remote content.
