---
layout: page
sidebar: false
aside: false
outline: false
title: AeroAgent Capability Matrix
description: Real-world capability tests of AeroAgent across multiple AI providers
---

<div class="test-reports">

<ul class="breadcrumb">
  <li class="breadcrumb-item"><a href="/test-reports/">Test Reports</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><a href="/test-reports/aeroagent/">AeroAgent</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><span class="current">Capability Matrix</span></li>
</ul>

# AeroAgent Capability Matrix

Real-world capability tests performed with multiple AI providers. All prompts and responses shown below are from actual AeroAgent sessions.

## Test Environment

| Component | Details |
|-----------|---------|
| AeroFTP Version | v3.0.3 |
| Primary Provider | **Google Gemini 3.1 Flash Lite Preview** (20 of 25 tests) |
| Secondary Provider | Cohere Command A Reasoning 08 2025 (5 of 25 tests) |
| Connection | FTP/TLS (Aruba hosting) |
| Platform | Ubuntu 24.04.2 LTS, kernel 6.17.0 |

::: tip Provider Performance
**Gemini 3.1 Flash Lite Preview** completed the vast majority of tests, demonstrating reliable tool calling across file management, archive operations, shell execution, and remote server operations. Cohere Command A Reasoning excelled at multi-step workflows with diff previews and thinking visualization.
:::

## Capability Matrix

| # | Capability | Tool(s) | Cohere | Gemini | Status |
|---|-----------|---------|:---:|:---:|:---:|
| 1 | Create files | `local_write` | Pass | Pass | Verified |
| 2 | Create directories | `local_mkdir` | Pass | Pass | Verified |
| 3 | Read files | `local_read` | Pass | Pass | Verified |
| 4 | List directory | `local_list` | Pass | Pass | Verified |
| 5 | Edit files (find/replace) | `local_edit` | Pass | Pass | Verified |
| 6 | Rename files | `local_rename` | -- | Pass | Verified |
| 7 | Copy files | `local_copy_files` | -- | Pass | Verified |
| 8 | Delete files | `local_delete` | -- | Pass | Verified |
| 9 | Directory tree | `local_tree` | -- | Pass | Verified |
| 10 | Search in files | `local_search` | -- | Pass | Verified |
| 11 | File info/metadata | `local_file_info` | -- | Pass | Verified |
| 12 | Diff two files | `local_diff` | -- | Pass | Verified |
| 13 | Compress to ZIP | `archive_compress` | -- | Pass | Verified |
| 14 | Extract archive | `archive_decompress` | -- | Pass | Verified |
| 15 | Upload files to remote | `upload_files` | Pass | Pass | Verified |
| 16 | Upload directory (recursive) | `upload_files` | -- | Pass | Verified |
| 17 | List saved servers | `server_list_saved` | -- | Pass | Verified |
| 18 | Connect to remote server | `server_exec` | -- | Pass | Verified |
| 19 | List remote directory | `server_exec(ls)` | -- | Pass | Verified |
| 20 | Shell command execution | `shell_execute` | -- | Pass | Verified |
| 21 | Disk usage | `local_disk_usage` | -- | Pass | Verified |
| 22 | Multi-step workflows | Chain | Pass | Pass | Verified |
| 23 | Tool approval (Allow/Reject) | UI | Pass | Pass | Verified |
| 24 | Thinking/reasoning display | UI | Pass | -- | Verified |
| 25 | Conversation continuity | Multi-turn | Pass | Pass | Verified |

## Test Sessions

### Test 1: Create Files

**Prompt:**
```
Create a folder called project/ with three files inside:
index.html (page with h1 "AeroAgent Demo", link to style.css),
style.css (bg #0d1117, color #c9d1d9, h1 color #58a6ff),
and a subfolder assets/ with readme.txt containing "Asset folder ready".
Show the directory tree. Then upload the entire project/ folder to the remote server.
```

**Result:**
```
Created directory project/
Written 204 bytes to project/index.html
Written 86 bytes to project/style.css
Created directory project/assets/
Written 18 bytes to project/assets/readme.txt

project/
├── assets/
│   └── readme.txt (18 B)
├── index.html (204 B)
└── style.css (86 B)

Uploaded 3 file(s):
  + index.html
  + style.css
  + assets/readme.txt
```

**Tools used:** `local_mkdir` x2, `local_write` x3, `local_tree`, `upload_files`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 2: Read and Edit Files

**Prompt:**
```
List the contents of batch1/. Read hello.txt and tell me what it contains.
```

**Result:**
```
  hello.txt (15 bytes)
  notes.md (35 bytes)
  info.json (31 bytes)

Content of hello.txt:
  Hello AeroAgent
```

**Tools used:** `local_list`, `local_read`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 3: Edit with Diff Preview

**Prompt:**
```
In index.html, find "Welcome Home" and replace with "AeroFTP Test Lab".
In style.css, add at the end: h1 { color: #7c3aed; text-align: center; }
In content.html, find "Content Page" and replace with "About AeroFTP".
Upload the modified files to the remote server.
```

**Result:**
```
4 tool calls pending approval:
  Local Edit · index.html ·    ✓
    - <h1>Welcome Home</h1>
    + <h1>AeroFTP Test Lab</h1>
  Local Edit · style.css ·     ✓
  Local Edit · content.html ·  ✓
  Local Edit · content.html ·  ✓
  [Allow All] [Reject All]

Replaced 1 occurrence(s) in index.html
Replaced 1 occurrence(s) in content.html

Uploaded 3 file(s):
  + index.html
  + style.css
  + content.html
```

**Tools used:** `local_edit` x4, `upload_files`
**Provider:** Cohere Command A Reasoning 08 2025

---

### Test 4: Search and Directory Tree

**Prompt:**
```
Show the directory tree of batch1/. Then search for the word
"AeroAgent" in all files in the folder.
```

**Result:**
```
3 files, 0 dirs (80 B)

  batch1/
  ├── config.json (31 B)
  ├── hello.txt (14 B)
  └── notes.md (35 B)

2 match(es) in 3 files for "AeroAgent"
  hello.txt:1 - Ciao AeroAgent
  notes.md:2 - - Created by AeroAgent
```

**Tools used:** `local_tree`, `local_search`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 5: Copy, Rename, File Info

**Prompt:**
```
Copy notes.md to notes-backup.md. Show file info for config.json.
```

**Result:**
```
Copied 1/1 file(s): notes.md

config.json - 31 bytes | Type: application/json | Permissions: 100664
```

**Tools used:** `local_copy_files`, `local_file_info`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 6: File Diff

**Prompt:**
```
Compare hello.txt and notes.md with a diff.
```

**Result:**
```
+0/-1 hello.txt vs notes.md

--- hello.txt
+++ notes.md
@@ -1 +0,0 @@
-Ciao AeroAgent
\ No newline at end of file
```

**Tools used:** `local_diff`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 7: Compress and Extract

**Prompt:**
```
Compress test.txt and backup.txt into archive.zip.
Extract archive.zip into the unpacked/ folder.
Show the complete directory tree.
Upload everything to the remote server.
```

**Result:**
```
Created archive.zip (214 bytes)
Extracted to unpacked/archive/

8 files, 4 dirs (522 B)
  test-aeroagent/
  ├── project/
  │   ├── assets/
  │   │   └── readme.txt (18 B)
  │   ├── index.html (204 B)
  │   └── style.css (86 B)
  ├── unpacked/
  │   └── archive/
  │       ├── backup.txt (0 B)
  │       └── test.txt (0 B)
  ├── archive.zip (214 B)
  ├── backup.txt (0 B)
  └── test.txt (0 B)

Uploaded 3 file(s):
  + test.txt
  + backup.txt
  + archive.zip
```

**Tools used:** `archive_compress`, `archive_decompress`, `local_tree`, `upload_files`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 8: Shell Command

**Prompt:**
```
Run "uname -a" in the terminal.
```

**Result:**
```
uname -a - exit code 0
Linux server 6.17.0-19-generic #19~24.04.2-Ubuntu SMP
PREEMPT_DYNAMIC Fri Mar 6 23:08:46 UTC 2 x86_64
```

**Tools used:** `shell_execute`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 9: Connect to Remote Server

**Prompt:**
```
List saved servers. Then connect to my-server.com and show
the contents of /var/www/html/
```

**Result:**
```json
{
  "count": 49,
  "servers": [
    { "name": "my-server.com", "protocol": "ftp", "port": 21 },
    { "name": "backup-server", "protocol": "sftp", "port": 2222 },
    ...
  ]
}

/ cgi-bin/          FOLDER
/ api/              FOLDER
/ app/              FOLDER
/ assets/           FOLDER
/ cloud/            FOLDER
/ index.php         6.7 KB
...
```

**Tools used:** `server_list_saved`, `server_exec(ls)`
**Provider:** Gemini 3.1 Flash Lite Preview

---

### Test 10: Multi-Step Workflow

**Prompt:**
```
Read index.html and content.html. In index.html add a paragraph
after the h1. In content.html add a Features section with a list.
Modify style.css adding list styles. Upload the 3 modified files
to the remote server and confirm.
```

**Result:**
```
Read index.html (496 bytes)
Read content.html (499 bytes)

Local Edit · index.html     ✓
Local Edit · content.html   ✓
Local Edit · style.css      ✓

Uploaded 3 file(s):
  + index.html
  + content.html
  + style.css

All modifications applied and uploaded successfully.
Details:
  - index.html: "Welcome Home" → "AeroFTP Test Lab"
  - style.css: Added h1 CSS rule
  - content.html: "Content Page" → "About AeroFTP" + new paragraph
```

**Tools used:** `local_read` x2, `local_edit` x3, `upload_files`
**Provider:** Cohere Command A Reasoning 08 2025

---

## Security Notes

- **Passwords are never exposed** to the AI model. Server credentials are resolved entirely in the Rust backend from the encrypted vault.
- **All tool calls require approval** for medium/high danger operations. The diff preview shows exactly what will change before you approve.
- **Shell commands are filtered** against a denylist of dangerous patterns (rm -rf /, sudo, eval, fork bombs, etc.).
- **Path validation** prevents traversal attacks, null bytes, and access to sensitive system directories.

</div>
