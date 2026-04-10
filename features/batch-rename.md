# Batch Rename

AeroFTP provides a batch rename dialog for renaming multiple files at once, plus inline rename for quick single-file edits.

## Batch Rename Dialog

Select multiple files, then right-click and choose **Batch Rename** to open the dialog. Four rename modes are available:

| Mode | Description | Example |
|------|-------------|---------|
| **Find/Replace** | Replace text in filenames | `report` → `summary` |
| **Prefix** | Add text before the filename | `backup_` + `data.csv` → `backup_data.csv` |
| **Suffix** | Add text before the extension | `photo` + `_2024` → `photo_2024.jpg` |
| **Sequential** | Number files sequentially | `img_001.jpg`, `img_002.jpg`, ... |

### Live Preview

As you type, a preview column shows the result of the rename operation for every selected file. This lets you verify the outcome before committing any changes.

### Sequential Options

When using Sequential mode, you can configure:
- **Base name** - the prefix before the number
- **Start number** - the first number in the sequence (default: 1)
- **Zero padding** - number of digits (e.g., 3 digits gives `001`, `002`, ...)

## Inline Rename

For renaming a single file quickly:

- **F2** - press F2 with a file selected to enter inline edit mode
- **Click on filename** - click the filename text of an already-selected file

Inline rename works in both the local and remote file panels. Press **Enter** to confirm or **Escape** to cancel.

> **Tip:** Batch Rename and Inline Rename are also available through AeroAgent. Ask something like *"Rename all .jpeg files to .jpg"* and the `local_batch_rename` tool handles it automatically.
