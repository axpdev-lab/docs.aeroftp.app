# MCP Server

AeroFTP 4.2.5 provides a native Model Context Protocol server over stdio. It uses the Rust backend directly, with saved profiles, connection pooling, per-profile serialization, cancellation, schema validation, rate limits and audit events. It does not invoke an AI model itself.

The checked catalog contains **78 wire tool names**: 39 `aeroftp_*`, 36 `remote_*`, two `server_*` and `agent_connect`. The command inventory labels these 40 primary and 38 alias names using a namespace heuristic; this is not a count of independent capabilities. Use `tools/list` for the live schemas and [COMMAND-INVENTORY.json](https://github.com/axpdev-lab/aeroftp/blob/3a62301e589fffeb8b69fcdff7b5e95ff2b67288/docs/COMMAND-INVENTORY.json) for the checked snapshot. CLI agent tools and GUI AeroAgent tools are different catalogs.

## Setup

Install the [CLI](/cli/installation), then configure an MCP client:

```json
{
  "mcpServers": {
    "aeroftp": {
      "command": "aeroftp-cli",
      "args": ["mcp"]
    }
  }
}
```

`aeroftp-cli agent --mcp` starts the same server. The official [VS Code extension](https://marketplace.visualstudio.com/items?itemName=axpdev-lab.aeroftp-mcp) can configure supported clients. If the CLI is not on the client's `PATH`, use its absolute executable path.

Start with `aeroftp_list_servers`, then call a file tool with the exact saved profile name or ID in `server`. `aeroftp_agent_connect` combines connection, capability, quota and path results; inspect each block rather than assuming a successful overall envelope means every feature is supported.

Create profiles in the GUI or with `profile-add`. `connect --save` is not supported. Browser-authorized profiles can use supported [headless authorization](/cli/commands#profile-add-and-headless-authorization); native Proton has its separate sign-in flow. The MCP `aeroftp_profile_auth` tool operates on an already saved profile with a nested `request` whose action is `configure`, `begin`, `finish`, `status` or `cancel`.

## Tool Catalog

Names below are exact wire names. Many also have compatibility aliases; retrieve `tools/list` instead of guessing an alias or adding an `aeroftp_` prefix to every tool.

| Area | Tools |
| --- | --- |
| Discovery and lifecycle | `aeroftp_mcp_info`, `aeroftp_list_servers`, `aeroftp_agent_connect`, `aeroftp_profile_auth`, `aeroftp_close_connection` |
| Remote listing and inspection | `aeroftp_list_files`, `aeroftp_read_file`, `aeroftp_file_info`, `aeroftp_search_files`, `aeroftp_storage_quota`, `aeroftp_hashsum`, `aeroftp_head`, `aeroftp_tail`, `aeroftp_tree` |
| File writes | `aeroftp_download_file`, `aeroftp_upload_file`, `aeroftp_upload_many`, `aeroftp_create_directory`, `aeroftp_rename`, `aeroftp_edit`, `aeroftp_touch` |
| Delete and maintenance | `aeroftp_delete`, `aeroftp_delete_many`, `aeroftp_cleanup`, `aeroftp_dedupe` |
| Sync and comparison | `aeroftp_check_tree`, `aeroftp_sync_tree`, `aeroftp_sync_doctor`, `aeroftp_reconcile` |
| Cross-profile copy | `aeroftp_transfer`, `aeroftp_transfer_tree` |
| Versions and trash | `remote_versions`, `remote_trash` |
| Read-only server wrapper | `server_exec` |
| Diagnostics and measurements | `aeroftp_debug_snapshot`, `aeroftp_debug_run_test`, `aeroftp_speed`, `aeroftp_benchmark`, `aeroftp_transfer_stats` |
| Error-correction sidecars | `aeroftp_correct_gen`, `aeroftp_correct_verify`, `aeroftp_correct_repair` |

`server_exec` accepts only `ls`, `cat`, `stat`, `find` and `df`. It explicitly refuses `get`, `put`, `mkdir`, `rm` and `mv`; use the dedicated tools. Its high registry classification reflects credential-backed remote access and possible content disclosure, not support for destructive commands.

Provider support remains operation-specific. A profile exposes its `protocol`, `cryptOverlay` and `protocolClass`, and discovery reports capability information. A bound overlay encrypts uploaded names and content transparently; it is not equivalent to a plain remote. Authorize profiles first and inspect authentication state before transferring.

## Schemas and Bounded Results

- `aeroftp_check_tree` accepts `checksum`, `one_way`, `files`, `exclude`, `max_depth`, per-group caps and `omit_match`. It does not accept a `compare_method` field. Checksum mode requests a server-side digest and can fall back to size comparison when unavailable.
- Tree comparisons report `local_scan_incomplete` and `remote_scan_incomplete`, plus errors, truncation counters and bounded skipped/unseen-path lists. Missing on an incompletely scanned side does not prove a file was deleted. `summary_only` suppresses entry arrays.
- `aeroftp_sync_tree` takes `local_dir`, `remote_dir`, `direction` (`upload`, `download`, `both`), `dry_run`, `delete_orphans`, conflict and delta policies. `delete_orphans` is one-way only. Its policy choices are not identical to all CLI sync flags.
- A sync dry run returns `plan`, `plan_by_op`, totals, scan statistics and errors. An apply returns `summary` and errors. These are different result shapes. Delta details appear only when files actually used delta transfer.
- `aeroftp_upload_many` returns individual results and summary totals. It normally processes a pooled session serially. Proton Drive in CLI mode can group local files sharing a destination folder into one native bulk call; native Proton API mode does not use that optimization.
- `aeroftp_transfer_stats` reports the last DAG job seen by the current process, or `available: false`. The direct cross-profile tools do not run the DAG engine, so they do not populate those statistics.

Use a dry run to review a sync plan before applying it. Do not treat capped lists or a transport cancellation as a complete result.

## Rate Limits and Authorization

The MCP server uses token buckets shared by category, replenished continuously:

| Category | Capacity / refill rate |
| --- | --- |
| Read-only | 1200 requests per minute |
| Mutative | 400 requests per minute |
| Destructive | 100 requests per minute |

Aliases inherit the registry classification. Some diagnostic tools run probes that write temporary data even when their rate category is read-only; `aeroftp_benchmark` and `aeroftp_speed` exercise real uploads/downloads and cleanup. A rate category is not a human permission grant. Configure the MCP client's tool approval policy for the operations you intend to allow. The CLI agent's `--auto-approve` levels describe the AI-agent loop, not an MCP approval dialog.

Rate-limit errors include a `retry_after` duration. Wait for that interval rather than retrying in a tight loop.

## Security and Audit Events

Saved-profile authentication resolves secrets inside Rust and does not return passwords or tokens in tool results. The universal vault uses encrypted storage, with OS-keyring or master-password unlock depending on configuration. Secret values explicitly supplied in `aeroftp_profile_auth` requests are still visible to the client that supplies them; the vault does not erase that client's copy.

Remote paths allow absolute paths but reject traversal components, null bytes, control characters, leading `-` and oversized values. Local transfer paths also receive sensitive-path and symlink checks. These restrictions are not a filesystem sandbox for the whole client process.

Audit events are written as JSON to stderr with timestamp, tool, server, path, status and duration. They omit file content and credentials. Paths and server identifiers are still operational metadata; the MCP client controls whether stderr is retained.

## Troubleshooting

```bash
aeroftp-cli --version
aeroftp-cli profiles --json
aeroftp-cli agent-info --json
aeroftp-cli inventory --json
```

If the process will not start, check the executable path and its platform dependencies. If the vault is locked, unlock it through the configured flow; an unattended process must have a supported unlock method. If a tool reports authentication failure, authorize that profile again rather than repeatedly reconnecting. Restart an existing MCP process after replacing its executable so it uses the new release.

## Further Reading

- [CLI Commands](/cli/commands)
- [CLI Examples](/cli/examples)
- [Agent Orchestration](/features/agent-orchestration)
- [Credential Isolation](/credential-isolation)
- [LLM Integration Guide](https://github.com/axpdev-lab/aeroftp/blob/main/docs/LLM-INTEGRATION-GUIDE.md)
