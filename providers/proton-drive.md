---
title: Proton Drive with AeroFTP
description: Use Proton Drive in AeroFTP through the official Proton Drive CLI, signed in in your browser.
---

# Proton Drive

<ProviderPlanCard id="proton" />

Proton Drive has no API open to third-party apps yet, but Proton publishes an official command-line client, the **Proton Drive CLI**. AeroFTP drives that CLI and gives it a graphical interface: you sign in to Proton in your browser through the CLI, and AeroFTP never sees your Proton password. The session stays in your operating system's secret store, managed by the CLI.

::: info Availability
Proton Drive ships in the release after AeroFTP v4.2.0. AeroFTP v4.2.0 has no Proton Drive connection.
:::

::: warning Third-party application
AeroFTP is a third-party application and is not officially supported by Proton. Proton has been informed of the integration.
:::

## What You Need

- a Proton account (the free plan is enough)
- the **Proton Drive CLI**, installed from Proton's download page: [proton.me/download/drive/cli](https://proton.me/download/drive/cli/index.html)
- a one-time sign-in of the CLI: run `proton-drive auth login` in a terminal and finish in the browser that opens

## How to Connect

1. Install the Proton Drive CLI and run `proton-drive auth login` once.
1. Open AeroFTP and select **Proton Drive**.
1. Check the status line under the mode selector:
   - **green**: the CLI is installed and signed in, you can connect
   - **amber**: the CLI is installed but not signed in; run `proton-drive auth login`, then press the refresh button
   - **red**: the CLI was not found; install it, then press the refresh button
1. Connect and save the profile.

"Connect" uses the CLI already signed in on this machine, so a profile holds no Proton credentials at all.

## Where AeroFTP Looks for the CLI

AeroFTP finds the `proton-drive` executable on your `PATH` or in the usual install locations (`~/.local/bin`, `/usr/local/bin` and `/usr/bin` on Linux and macOS; the per-user and Program Files install folders on Windows). If you keep it somewhere else, set the `AEROFTP_PROTON_CLI` environment variable to its full path before starting AeroFTP.

The executable is **never taken from a saved or imported profile**. Profiles travel in export files, so reading a program path from one would let an imported file choose what AeroFTP runs.

## How Your Drive Is Organized

The top level of Proton Drive is not a folder: it lists the account sections, such as **my-files**, **devices**, **photos**, **trash** and the shared views. Open **my-files** (or another section) to upload files or create folders. The sections themselves cannot be renamed, moved, copied or deleted.

## Features

- **File operations**: browse, upload, download, rename, move, copy and create folders
- **Delete**: items go to the Proton Drive trash. A permanent delete empties the item from the trash too; when two items in the trash have the same name AeroFTP refuses to purge rather than risk deleting the wrong one, because the CLI can only address the trash by name
- **Share links**: with an optional password, an expiry date (the CLI takes a date, so the earliest expiry is tomorrow) and view or edit permission
- **Used storage scan**: counts your own storage (my-files, devices, photos and both trash sections), not the shared views

## Limitations

These come from the Proton Drive CLI today:

- one Proton account per operating system user
- no storage quota in the status bar
- no live progress during a transfer, and no partial (ranged) reads
- photos and albums cannot be opened yet; use the Proton Drive web or mobile apps for them
- every operation starts the CLI again, so browsing is slower than with a native API
- a share link password is passed to the CLI as a command-line argument and is visible in the local process list while the command runs; the CLI offers no other way to supply it

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| The status line is red | The CLI is not installed or not found | Install it, or set `AEROFTP_PROTON_CLI` to its full path, then refresh |
| The status line is amber | The CLI is not signed in | Run `proton-drive auth login` in a terminal, finish in the browser, then refresh |
| An upload to the top level is refused | The top level only holds the account sections | Open **my-files** or another section first |
| "Moved to trash, not purged" | Several items in the trash share that name | Empty the trash from the Proton Drive apps |
| Photos or albums cannot be opened | The CLI does not support them yet | Use the Proton Drive web or mobile apps |

## Related Documentation

- [Provider Reference](/advanced/provider-reference)
