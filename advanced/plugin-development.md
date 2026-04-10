# Plugin Development

AeroAgent supports a plugin system that extends its tool capabilities with custom scripts. Plugins are installed locally and executed in a sandboxed environment.

## Plugin Structure

Each plugin lives in a directory under `~/.config/aeroftp/plugins/<plugin-id>/` with the following structure:

```
my-plugin/
  plugin.json          # Manifest (required)
  my-tool-script.sh    # Tool script(s)
  hook-script.sh       # Hook script(s) (optional)
```

## Manifest Format

The `plugin.json` manifest defines the plugin metadata, tools, and hooks:

```json
{
  "id": "my_plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "enabled": true,
  "tools": [
    {
      "name": "my_tool",
      "description": "What this tool does",
      "parameters": [
        {
          "name": "input",
          "type": "string",
          "description": "The input to process",
          "required": true
        },
        {
          "name": "verbose",
          "type": "boolean",
          "description": "Enable verbose output",
          "required": false
        }
      ],
      "dangerLevel": "medium",
      "command": "my-tool-script.sh"
    }
  ],
  "hooks": [
    {
      "event": "transfer:complete",
      "command": "hook-script.sh",
      "filter": "*.csv"
    }
  ]
}
```

### Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (alphanumeric + underscore only) |
| `name` | string | Yes | Human-readable name |
| `version` | string | Yes | Semver version |
| `author` | string | Yes | Author name |
| `enabled` | boolean | No | Whether the plugin is active (default: `true`) |
| `tools` | array | Yes | List of tool definitions |
| `hooks` | array | No | List of event hooks |

## Tool Definition

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tool name (used in AI function calling) |
| `description` | string | Yes | What the tool does (shown to the AI model) |
| `parameters` | array | Yes | Input parameters |
| `dangerLevel` | string | No | `"safe"`, `"medium"`, or `"high"` (default: `"medium"`) |
| `command` | string | Yes | Script filename to execute |
| `integrity` | string | Auto | SHA-256 hash of the script (computed at install time) |

### Parameter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Parameter name |
| `type` | string | Yes | `"string"`, `"boolean"`, `"number"` |
| `description` | string | Yes | What the parameter does |
| `required` | boolean | No | Whether the parameter is required (default: `false`) |

### Danger Levels

| Level | Behavior | Use Case |
|-------|----------|----------|
| `safe` | **Elevated to `medium`** - plugins cannot bypass the approval gate | Read-only operations |
| `medium` | Requires user approval before execution | File modifications, API calls |
| `high` | Requires user approval, shown with warning | Destructive operations |

::: warning Minimum Danger Level
Plugin tools declared as `"safe"` are automatically elevated to `"medium"` at load time. This prevents plugin authors from bypassing the tool approval gate. Only built-in AeroAgent tools can be marked as `"safe"`.
:::

## Tool Execution Protocol

Tools communicate via **stdin/stdout**:

1. AeroAgent passes parameters as a JSON object on **stdin**
2. The script processes the input
3. The script writes its result to **stdout**
4. Exit code `0` indicates success; non-zero indicates failure
5. **stderr** output is captured as the error message on failure

### Example Tool Script

```bash
#!/bin/bash
# my-tool-script.sh - Reads JSON from stdin, processes it, writes result to stdout

# Read the full stdin JSON
INPUT=$(cat)

# Extract parameters using jq
FILE=$(echo "$INPUT" | jq -r '.input // empty')
VERBOSE=$(echo "$INPUT" | jq -r '.verbose // false')

if [ -z "$FILE" ]; then
  echo "Error: 'input' parameter is required" >&2
  exit 1
fi

# Do the work
RESULT=$(wc -l < "$FILE" 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "Error: Could not read file '$FILE'" >&2
  exit 1
fi

# Output result as JSON
echo "{\"line_count\": $RESULT, \"file\": \"$FILE\"}"
```

### Execution Environment

Plugin scripts run in a **sandboxed environment**:

- Environment variables are stripped - only minimal safe variables are restored (`PATH`, `HOME`, `LANG`, `TERM`)
- Working directory is set to a safe location
- Scripts have a configurable timeout
- Output is size-limited

## Hook Events

Hooks allow plugins to react to application events automatically.

### Available Events

| Event | Trigger | Context Data |
|-------|---------|-------------|
| `file:created` | A new file is created locally | `{ "path": "/path/to/file" }` |
| `file:deleted` | A file is deleted locally | `{ "path": "/path/to/file" }` |
| `transfer:complete` | A file transfer finishes | `{ "path": "/path/to/file", "direction": "upload\|download" }` |
| `sync:complete` | A sync operation finishes | `{ "profile": "...", "stats": {...} }` |

### Hook Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | string | Yes | Event name to listen for |
| `command` | string | Yes | Script to execute |
| `filter` | string | No | Glob pattern to filter (e.g., `"*.csv"`) |
| `integrity` | string | Auto | SHA-256 hash of the script |

### Example Hook Script

```bash
#!/bin/bash
# On transfer complete, log the file to a CSV

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.path')
DIRECTION=$(echo "$INPUT" | jq -r '.direction')
TIMESTAMP=$(date -Iseconds)

echo "$TIMESTAMP,$DIRECTION,$FILE_PATH" >> "$HOME/.config/aeroftp/transfer-log.csv"
```

## SHA-256 Integrity Verification

When a plugin is installed, AeroFTP computes the SHA-256 hash of each tool and hook script. Before every execution, the hash is recomputed and compared:

- If the hash matches, the script executes normally
- If the hash does not match, execution is blocked and an error is reported
- If no hash was stored (legacy plugins), the script executes with a warning

This prevents tampering with plugin scripts after installation.

## GitHub Plugin Registry

AeroFTP supports installing plugins from a GitHub-based registry.

### Registry Structure

The registry is a GitHub repository containing plugin packages:

```
registry/
  plugins/
    my-plugin/
      plugin.json
      my-tool-script.sh
    another-plugin/
      plugin.json
      tool.py
  index.json
```

### `index.json` Format

```json
{
  "plugins": [
    {
      "id": "my_plugin",
      "name": "My Plugin",
      "version": "1.0.0",
      "author": "Your Name",
      "description": "Brief description",
      "download_url": "https://github.com/.../releases/download/v1.0.0/my-plugin.tar.gz",
      "sha256": "abc123..."
    }
  ]
}
```

### Installing from Registry

1. Go to **Settings > AeroAgent > Plugins**
2. Switch to the **Browse** tab
3. Search for a plugin
4. Click **Install**

AeroFTP downloads the plugin archive, verifies the SHA-256 checksum, extracts to the plugins directory, and computes integrity hashes for all scripts.

## Plugin Browser UI

The plugin management interface in AI Settings has three tabs:

| Tab | Description |
|-----|-------------|
| **Installed** | List of locally installed plugins with enable/disable toggles and remove buttons |
| **Browse** | Searchable registry of available plugins |
| **Updates** | Plugins with newer versions available in the registry |

## Example: Complete Plugin

Here is a complete plugin that provides a word count tool and logs completed transfers:

### `plugin.json`

```json
{
  "id": "file_stats",
  "name": "File Stats",
  "version": "1.0.0",
  "author": "AeroFTP Community",
  "enabled": true,
  "tools": [
    {
      "name": "word_count",
      "description": "Count words, lines, and characters in a file",
      "parameters": [
        {
          "name": "path",
          "type": "string",
          "description": "Path to the file to analyze",
          "required": true
        }
      ],
      "dangerLevel": "medium",
      "command": "word-count.sh"
    }
  ],
  "hooks": [
    {
      "event": "transfer:complete",
      "command": "log-transfer.sh",
      "filter": "*.txt"
    }
  ]
}
```

### `word-count.sh`

```bash
#!/bin/bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.path')

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE" >&2
  exit 1
fi

WORDS=$(wc -w < "$FILE")
LINES=$(wc -l < "$FILE")
CHARS=$(wc -c < "$FILE")

echo "{\"words\": $WORDS, \"lines\": $LINES, \"characters\": $CHARS, \"file\": \"$FILE\"}"
```

### `log-transfer.sh`

```bash
#!/bin/bash
INPUT=$(cat)
echo "$(date -Iseconds) | $(echo "$INPUT" | jq -c '.')" >> "$HOME/.config/aeroftp/transfer-log.jsonl"
```

## Best Practices

- Keep tool scripts small and focused on a single task
- Always validate input parameters and exit with a non-zero code on errors
- Write error messages to **stderr**, results to **stdout**
- Use JSON for structured output so AeroAgent can parse the result
- Set appropriate danger levels (most tools should be `"medium"`)
- Test scripts independently before packaging as a plugin
- Include a meaningful `description` - this is what the AI model sees when deciding which tool to use
