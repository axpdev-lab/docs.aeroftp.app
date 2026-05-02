# AI Tool Security

AeroFTP's AI assistant (AeroAgent) provides 43 tools for file management, server operations, and automation. Because AI models can be influenced by prompt injection or produce unexpected outputs, all mutative tool execution is subject to backend-enforced security controls that cannot be bypassed by the web frontend.

## Backend Approval Model

Tool execution follows a three-phase protocol:

```text
1. prepare_ai_tool_approval  →  Backend classifies tool risk, checks for existing grants
2. grant_ai_tool_approval    →  Native OS dialog shown to user, grant issued if approved
3. execute_ai_tool           →  Backend verifies grant matches tool + args before executing
```

The web frontend determines the UI flow (auto-approval modes, approval panels), but the backend is the final authority. Even if the frontend is compromised via XSS or prompt injection, the backend rejects any mutative tool call without a valid grant.

## Tool Classification

Tools are classified by the backend into two categories:

| Category | Approval | Examples |
| -------- | -------- | -------- |
| **Read-only** | No grant needed | `remote_list`, `local_read`, `remote_search`, `app_info`, `vault_peek` |
| **Mutative** | Grant required | `local_write`, `remote_upload`, `shell_execute`, `server_exec`, `local_delete` |

Some tools have **dynamic classification**:
- `server_exec`: read operations (`ls`, `cat`, `stat`, `find`, `df`) still require a grant because the tool accesses saved credentials, but mutative operations (`put`, `rm`, `mv`, `mkdir`) cannot be approved for the session
- `sync_control`: `status` is read-only; `start` and `stop` require approval

## Grant Properties

| Property | Detail |
| -------- | ------ |
| **Single-use** | One-shot grants are consumed on execution and cannot be replayed |
| **Session grants** | Approved once per tool/session, valid for 8 hours. Not available for destructive tools |
| **Scope** | Bound to specific tool + session. Session grants apply to the tool regardless of arguments |
| **TTL** | One-shot: 2 minutes. Session: 8 hours. Requests: 5 minutes |
| **Capacity** | Max 256 pending requests, 512 active grants. Oldest evicted when full |
| **Native confirmation** | Every grant requires confirmation via an operating system dialog rendered outside the web frontend |

## Native OS Dialogs

The confirmation dialog is rendered by the operating system (GTK on Linux, Cocoa on macOS, Win32 on Windows), not by the web frontend. This provides a critical security property: the dialog cannot be auto-dismissed, hidden, or suppressed by JavaScript, prompt injection, or XSS attacks.

The dialog displays:
- The tool name and operation details
- Key arguments (paths, server names, commands)
- Grant scope (one-shot or session)
- A clear Allow/Deny choice

## Credential Isolation

When the AI calls `server_exec` to operate on a saved server, the backend:
1. Resolves the server profile from the encrypted [vault](/security/credentials)
2. Creates a temporary connection using the stored credentials
3. Executes the operation
4. Closes the connection

At no point does the AI model receive passwords, tokens, or connection secrets. The model sees only the operation result. This isolation applies to all 22 supported protocols.

## Additional Controls

| Control | Detail |
| ------- | ------ |
| **Tool whitelist** | Only 43 named tools are accepted. Unknown tool names are rejected |
| **Path validation** | Null bytes, `..` traversal, and system paths (`/etc/shadow`, `~/.ssh`) are blocked |
| **Shell denylist** | 35 regex patterns block dangerous commands (`sudo`, `systemctl`, `mount`, `iptables`, etc.) |
| **Content limits** | Remote reads: 5 KB. Directory listings: 100 entries. Agent memory: 50 KB |
| **Rate limiting** | 20 requests/minute per AI provider |
| **Extreme mode circuit breaker** | 3 consecutive tool errors halt autonomous execution |
| **Plugin tools** | Plugin tools go through the same backend approval flow as built-in tools |
| **Duplicate prevention** | Tool call signatures tracked per conversation to prevent replay loops |

## Agent Modes

Users choose an agent mode that determines the frontend auto-approval behavior:

| Mode | Behavior |
| ---- | -------- |
| **Safe** | Only read-only tools auto-execute. All mutative tools show approval UI |
| **Normal** | Read-only + previously session-approved tools auto-execute |
| **Expert** | Read-only + all `medium` risk tools auto-execute. High-risk tools require per-session approval |
| **Extreme** | Most tools auto-execute except `shell_execute`, `local_delete`, `local_trash`, `archive_decompress`, `server_exec` |

Regardless of mode, the backend always requires a valid grant for mutative tools. The mode only affects whether the frontend shows the approval panel or calls the grant flow automatically.
