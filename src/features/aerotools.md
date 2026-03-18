# AeroTools

AeroTools is AeroFTP's built-in security toolkit, available exclusively in the **Cyber** theme. It provides three modules for hashing, encryption, and password generation — all running locally via Rust commands with no network access.

> **Note:** AeroTools is only visible when the Cyber theme is active. Switch themes via the theme toggle in the titlebar.

## Hash Forge

Compute and compare cryptographic hashes for files and text.

| Algorithm | Output Size | Use Case |
|-----------|------------|----------|
| MD5 | 128-bit | Legacy checksums (not for security) |
| SHA-1 | 160-bit | Legacy checksums (not for security) |
| SHA-256 | 256-bit | File integrity verification |
| SHA-512 | 512-bit | High-security integrity checks |
| BLAKE3 | 256-bit | Fast modern hashing |

**Operations:**
- **Hash text** — compute the hash of arbitrary text input
- **Hash file** — compute the hash of a local file
- **Compare hashes** — verify two hash values match

## CryptoLab

Encrypt and decrypt text using authenticated encryption algorithms.

| Algorithm | Key Size | Nonce | Tag |
|-----------|---------|-------|-----|
| AES-256-GCM | 256-bit | 96-bit | 128-bit |
| ChaCha20-Poly1305 | 256-bit | 96-bit | 128-bit |

Enter a password and plaintext to encrypt, or paste ciphertext to decrypt. Keys are derived from the password using a secure KDF.

> **Warning:** CryptoLab is intended for quick ad-hoc encryption of small text. For file encryption, use [AeroVault](aerovault.md).

## Password Forge

Generate cryptographically secure passwords and passphrases.

### Random Passwords
Uses CSPRNG (Cryptographically Secure Pseudo-Random Number Generator) to produce passwords with configurable:
- Length
- Character sets (uppercase, lowercase, digits, symbols)
- Entropy display (bits)

### BIP-39 Passphrases
Generate memorable passphrases using the BIP-39 word list:
- 4 to 24 words
- Each word adds ~11 bits of entropy
- Space-separated for readability

> **Note:** At 12+ words, a disclaimer notes that BIP-39 passphrases at this length are typically used for cryptocurrency seed phrases.

### Entropy Calculator
Paste any string to calculate its Shannon entropy in bits, helping you evaluate the strength of existing passwords.
