export type ArchiveFormatBadge =
  | 'OPEN'
  | 'PROPRIETARY'
  | 'READ-ONLY'
  | 'CREATE'
  | 'EXTRACT'
  | 'AES-256'

export interface ArchiveFormat {
  id: string
  name: string
  badges: ArchiveFormatBadge[]
  create: string
  extract: string
  encryption: string
  compression: string
  openness: string
}

// Facts mirror the "Supported Formats" table in features/archives.md so the
// card and the table never disagree. Order matches the table.
export const archiveFormats: ArchiveFormat[] = [
  {
    id: 'zip',
    name: 'ZIP',
    badges: ['OPEN', 'CREATE', 'EXTRACT', 'AES-256'],
    create: 'Yes',
    extract: 'Yes',
    encryption: 'AES-256 (WinZip AE-2)',
    compression: 'Deflate',
    openness: 'Open, publicly documented format (PKWARE APPNOTE). AeroFTP creates and extracts it.',
  },
  {
    id: '7z',
    name: '7z',
    badges: ['OPEN', 'CREATE', 'EXTRACT', 'AES-256'],
    create: 'Yes',
    extract: 'Yes',
    encryption: 'AES-256',
    compression: 'LZMA2',
    openness: 'Open format with a published SDK. Full create and extract, including encrypted filenames.',
  },
  {
    id: 'tar',
    name: 'TAR',
    badges: ['OPEN', 'CREATE', 'EXTRACT'],
    create: 'Yes',
    extract: 'Yes',
    encryption: '--',
    compression: 'None',
    openness: 'Open POSIX format. Full create and extract, preserving Unix permissions.',
  },
  {
    id: 'gz',
    name: 'GZ',
    badges: ['OPEN', 'CREATE', 'EXTRACT'],
    create: 'Yes',
    extract: 'Yes',
    encryption: '--',
    compression: 'Gzip (Deflate)',
    openness: 'Open standard (RFC 1952). Full create and extract.',
  },
  {
    id: 'xz',
    name: 'XZ',
    badges: ['OPEN', 'CREATE', 'EXTRACT'],
    create: 'Yes',
    extract: 'Yes',
    encryption: '--',
    compression: 'LZMA2',
    openness: 'Open format with a public specification. Full create and extract.',
  },
  {
    id: 'bz2',
    name: 'BZ2',
    badges: ['OPEN', 'CREATE', 'EXTRACT'],
    create: 'Yes',
    extract: 'Yes',
    encryption: '--',
    compression: 'Bzip2',
    openness: 'Open, well documented format. Full create and extract.',
  },
  {
    id: 'rar',
    name: 'RAR',
    badges: ['EXTRACT', 'PROPRIETARY', 'READ-ONLY'],
    create: '--',
    extract: 'Yes',
    encryption: '--',
    compression: 'RAR',
    openness:
      'Proprietary format. RARLAB ships a source-available UnRAR (extract only) plus a header technote, so AeroFTP can read .rar. Creating .rar needs the closed WinRAR/rar tool, so no AeroFTP tool can write it. This is a format limitation, not an AeroFTP scope choice.',
  },
]

// AeroFTP's own container formats are fully open and documented too.
export const nativeFormatsNote =
  "AeroFTP's native containers (.aerovault, .aerozip, .aeroftp) are open, documented formats that AeroFTP both creates and extracts."
