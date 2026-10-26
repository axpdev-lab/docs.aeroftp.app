# AI Tool Security

AeroAgent uses backend-classified tools for local files, remote providers, coding and automation. Its GUI tool catalog, CLI agent catalog and native MCP wire names are separate inventories. Consult [AeroAgent](/features/aeroagent), [Agent orchestration](/features/agent-orchestration) and [MCP](/mcp/overview) for the appropriate surface.

## Backend approval flow

The desktop approval protocol prepares a request, grants it through the permitted approval flow, then checks the grant when the tool executes:

```text
prepare_ai_tool_approval → grant_ai_tool_approval → execute_ai_tool
```

The backend recognizes the tool and arguments, decides whether approval is required, and binds the request to its execution context. Unknown tool names are refused. A read-only label does not imply that file content cannot leave the machine: remote reads or model context can contain sensitive data.

### Dedicated approval window

When required, approval appears in a dedicated AeroFTP window, separate from the chat WebView. Only the backend-created approval window for that pending request may answer it. Closing it counts as refusal. This is an AeroFTP window, not a GTK, Cocoa or Win32 system message box.

Safe and Normal mode use this approval window for the relevant grants. Expert mode can avoid a duplicate window after its frontend approval panel, except for tools whose policy requires the separate window on every call. Deletion, trash, shell and extraction retain stricter handling. A mode choice is not blanket permission to bypass the backend's required-window policy.

### Grant scope

| Property | Contract |
| --- | --- |
| Pending request | Expires after five minutes |
| One-shot grant | Expires after two minutes; consumed when used |
| Chat/session grant | Up to eight hours, only for tools that permit it |
| Context binding | Tool and execution scope, including local/remote context as applicable |
| Capacity | Bounded pending requests and active grants |

A chat-wide approval can cover later arguments within its allowed tool and context. Review the scope before choosing it. A one-shot approval cannot be replayed as a new operation. Destructive tools do not gain a chat-wide grant merely because another write tool has one.

## Credentials and content

Saved server operations resolve their secrets inside the Rust backend from the encrypted [credential vault](/security/credentials). The model receives the requested operation's result, rather than the server password or provider token. The result may itself contain private filenames or file content; review which tools and endpoints you enable.

The CLI's automatic approval tiers and MCP's safe/medium/destructive policy are separate from the desktop Safe/Normal/Expert/Extreme modes. Use the documentation for the actual entry point instead of treating their names as interchangeable.

## Additional controls and boundaries

The implementation includes tool allowlists, path checks, content and output bounds, shell restrictions, duplicate-call protection, cancellation and error limits. Those controls apply to the paths that implement them; they do not turn a shell command or third-party plugin into a general operating-system sandbox.

Plugins can execute local scripts. Review their manifest, source and requested operations before installation and approval. External MCP servers are separate processes with their own capabilities and lifecycle. Configure the minimum access you need and keep a visible approval boundary for destructive work.

For published security reviews and their scope, see [Security audits](/security/audits). A historical audit is evidence about the reviewed version, not a certification of every later change.
