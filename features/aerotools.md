# AeroTools

AeroTools is AeroFTP's built-in security toolkit, available exclusively in the **Cyber** theme. It provides three modules for hashing, encryption, and password generation -- all running locally via Rust commands with zero network access. Every operation executes entirely on your machine; no data is transmitted externally.

> **Note:** AeroTools is only visible when the Cyber theme is active. Switch themes via the theme toggle in the titlebar (cycle: Auto, Light, Dark, Tokyo Night, Cyber).

## Hash Forge

Compute and compare cryptographic hashes for files and text. Hash Forge supports five algorithms covering both legacy compatibility and modern performance needs.

![Hash Forge interface](/images/aerotools-hash.png)
<!-- SCREENSHOT: Hash Forge showing the text input area, algorithm selector dropdown (with SHA-256 selected), and the computed hash output below. Include the Hash File button and Compare Hashes section -->

### Supported Algorithms

| Algorithm | Output Size | Speed | Use Case |
| --------- | ----------- | ----- | -------- |
| MD5 | 128-bit (32 hex chars) | Very fast | Legacy checksums, non-security verification |
| SHA-1 | 160-bit (40 hex chars) | Fast | Legacy checksums, Git object IDs |
| SHA-256 | 256-bit (64 hex chars) | Moderate | File integrity, digital signatures, standard security |
| SHA-512 | 512-bit (128 hex chars) | Moderate | High-security integrity, password hashing inputs |
| BLAKE3 | 256-bit (64 hex chars) | Very fast | Modern hashing, faster than SHA-256 on all platforms |

> **Security note:** MD5 and SHA-1 are cryptographically broken for collision resistance. They remain available for compatibility with legacy systems that use them for non-security checksums, but should not be relied upon for security-critical verification.

### Operations

- **Hash text** -- enter arbitrary text in the input field and compute its hash with any algorithm. Useful for verifying passwords, API keys, or configuration values.
- **Hash file** -- select a local file to compute its hash. The file is read in streaming chunks, so even multi-gigabyte files can be hashed without excessive memory usage.
- **Compare hashes** -- paste two hash values to check whether they match. Hash Forge performs a constant-time comparison and displays a clear match/mismatch result.

## CryptoLab

Encrypt and decrypt text using authenticated encryption algorithms. CryptoLab provides a quick way to protect sensitive text snippets without creating a full AeroVault container.

![CryptoLab interface](/images/aerotools-crypto.png)
<!-- SCREENSHOT: CryptoLab showing the plaintext input area, password field, algorithm selector (AES-256-GCM / ChaCha20-Poly1305), and the encrypted ciphertext output. Include the Encrypt and Decrypt buttons -->

### Encryption Algorithms

| Algorithm | Key Size | Nonce | Auth Tag | Characteristics |
| --------- | -------- | ----- | -------- | --------------- |
| AES-256-GCM | 256-bit | 96-bit | 128-bit | Hardware-accelerated on modern CPUs (AES-NI) |
| ChaCha20-Poly1305 | 256-bit | 96-bit | 128-bit | Constant-time, no hardware dependency, ideal for non-AES-NI platforms |

### How It Works

1. Enter a password in the password field. CryptoLab derives a 256-bit encryption key from the password using a secure key derivation function.
2. Type or paste plaintext into the input area and click **Encrypt**. The ciphertext is displayed as a Base64-encoded string.
3. To decrypt, paste the ciphertext into the input area, enter the same password, and click **Decrypt**.

Both algorithms provide authenticated encryption: the ciphertext includes an authentication tag that detects any tampering or corruption. If the password is wrong or the ciphertext has been modified, decryption fails with an explicit error rather than producing garbage output.

> **Warning:** CryptoLab is intended for quick ad-hoc encryption of small text snippets (passwords, API keys, notes). For file encryption, use [AeroVault](aerovault.md) which provides a full encrypted container with key wrapping, header integrity, and optional cascade encryption.

## Password Forge

Generate cryptographically secure passwords and passphrases using a cryptographically secure pseudo-random number generator (CSPRNG).

![Password Forge interface](/images/aerotools-password.png)
<!-- SCREENSHOT: Password Forge showing a generated random password with the character set toggles (uppercase, lowercase, digits, symbols), length slider, entropy display in bits, and the BIP-39 passphrase section below with a 6-word passphrase -->

### Random Passwords

Random passwords are generated using the operating system's CSPRNG (`OsRng` in Rust), ensuring true randomness independent of any deterministic seed.

Configuration options:

- **Length** -- set the password length (8 to 128 characters)
- **Character sets** -- toggle uppercase letters (A-Z), lowercase letters (a-z), digits (0-9), and symbols (`!@#$%^&*...`) independently
- **Entropy display** -- shows the password strength in bits of entropy, calculated from the character set size and length

### BIP-39 Passphrases

Generate memorable passphrases using the BIP-39 English word list (2048 words). Each word adds approximately 11 bits of entropy.

- **Word count** -- select from 4 to 24 words
- **Separator** -- words are space-separated for readability
- **Entropy calculation** -- displayed alongside the passphrase (e.g., 6 words = ~66 bits)

> **Note:** At 12 or more words, a disclaimer notes that BIP-39 passphrases of this length are typically associated with cryptocurrency seed phrases. This is informational only -- the words are generated randomly and are not derived from any wallet.

### Entropy Calculator

Paste any existing string to calculate its Shannon entropy in bits. This helps evaluate the strength of passwords you have already created or received from other generators. The calculator analyzes the character distribution and reports the effective entropy, which may be lower than the theoretical maximum if the password contains patterns or repeated characters.
