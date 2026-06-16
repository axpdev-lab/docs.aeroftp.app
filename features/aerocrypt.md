# AeroCrypt Overlay

AeroCrypt is AeroFTP's **native client-side encryption overlay**. It turns any server, protocol or provider into a high-security, zero-knowledge store: the remote only ever holds ciphertext and obfuscated names, while the decrypted view is browsed exactly like a normal server in the standard dual panel.

AeroCrypt is an **overlay**, not a container. One local file maps to one remote object (a per-file encrypted blob with an encrypted name), so an encrypted scope stays listable, navigable and syncable object by object. This is the opposite shape from [AeroVault](/security/encryption), which seals many files into a single `.aerovault` container. The two coexist on purpose: AeroVault for a sealed, portable bundle, AeroCrypt for an ongoing encrypted mirror on a provider you do not trust at rest.

> **Community design attribution.** The AeroCrypt naming (AeroCrypt for the native overlay, Rclone Crypt for the interoperable one), the wrapper-and-overlay model it sits in, the opt-in "no default cipher" rule, and much of the format and UX were shaped by a sustained design contribution from **Ehud Kirsh** across the [Wrappers / Overlays roadmap (#272)](https://github.com/axpdev-lab/aeroftp/discussions/272) and the [AeroVault and cryptography design thread (#276)](https://github.com/axpdev-lab/aeroftp/discussions/276).

::: info AeroVault vs AeroCrypt: two different things
**AeroVault is to Cryptomator what AeroCrypt is to rclone crypt.** AeroVault is a sealed encrypted **container** (a single `.aerovault` vault you open); AeroCrypt is a transparent per-file **overlay** that encrypts each remote object in place and is browsed like a normal server.

They **share the same audited crypto core** (one implementation, one audit pass, extracted from the AeroVault v3 engine in v4.0.5): AES-256-GCM-SIV content, AES-256-KW key wrapping, AES-256-SIV filenames, and the Argon2id (128 MiB, t=4, p=4) KDF.

They **do not share their shape**: AeroVault seals many files into one container with the full wrapper stack (small-file packing, content-defined chunking, deduplication, per-chunk zstd, and the v4 error-correction extension); AeroCrypt encrypts object by object with no container and no cross-file dedup. Different on-disk formats too: `AEROVAULT3` container plus manifest, versus the per-object `AECR` format plus a `.aeroftp-crypt.json` config.
:::

There is **no default cipher**: you actively choose AeroCrypt (native) or [Rclone Crypt](/features/rclone-crypt) (the interop lane), by clicking in the GUI or typing in the CLI. Nobody encrypts by tapping Enter.

## What AeroCrypt gives you

- **Zero-knowledge on any backend.** AeroCrypt wraps the storage so the remote bucket only ever holds ciphertext and obfuscated names, on any of the supported backends, even the ones that offer no encryption of their own. On a provider that already encrypts at rest (Filen, MEGA, Internxt) it is a second independent layer keyed only by you, genuine double encryption where the key that matters never leaves your device.
- **Browses like a normal server.** You unlock once, and from then on the decrypted folder reads, navigates, gets and puts exactly like a connected server in the dual panel, with clear names on your side and ciphertext on the provider's.
- **AeroCrypt Profile (per-profile binding).** An overlay can be bound to a saved server profile so it auto-unlocks on connect, with a toggle in the connection form, per-session binding that survives a profile switch or reconnect, and edit-mode guards that lock the binding so it cannot be silently changed.

## The AECR format (v3)

AeroCrypt writes one encrypted object per file, with the format magic `AECR`. The current version is v3:

| Layer | Algorithm | Detail |
| ----- | --------- | ------ |
| Content encryption | AES-256-GCM-SIV (RFC 8452) | Per-file random data key (DEK), 64 KiB plaintext blocks, per-block random nonce |
| DEK wrapping | AES-256-KW (RFC 3394) | The per-file DEK is wrapped under the master key |
| Master key derivation | Argon2id (128 MiB, t=4, p=4) | Derives the master key from your password and the per-overlay salt |
| Filename encryption | AES-256-SIV (RFC 5297) | Deterministic, so the same plaintext name maps to the same ciphertext and the scope stays listable |
| Config integrity | HKDF-SHA256 key-bound MAC | On the `.aeroftp-crypt.json` config, over the version, block size, Argon2 profile (memory, time, lanes) and salt |

Each content block is laid out as `nonce(12) ‖ AES-256-GCM-SIV(DEK, plaintext_block, AAD) ‖ tag(16)`, where the AAD binds the block index **and** the total block count. The total block count is also carried, authenticated, in the file header.

### Hardened in v4.0.5 (pre-release audit)

A five-reviewer pre-release audit of the native overlay closed two live data-loss and downgrade classes, and the format was bumped to v3:

- **Per-file length binding.** Every block binds its index and the total block count; silent truncation (a dropped tail or whole blocks) and append (trailing bytes or extra blocks) now fail closed instead of returning short or padded plaintext.
- **Key-bound config MAC.** The `.aeroftp-crypt.json` config carries an HKDF-SHA256 MAC bound to the master key. A tampered or downgraded config is rejected on unlock, and a wrong password gives a clean error instead of an empty listing.
- **Init refuses to clobber.** `crypt init` will not overwrite an existing overlay config unless forced, because re-initialising rotates the salt and would orphan every file already in the overlay.
- **Empty crypt password rejected**, and the decrypted plaintext download is written atomically.
- **Legacy formats are read-only.** Existing v1 and v2 overlays keep decrypting transparently, but every new object is written as v3, so a stale or downgraded config can never produce weaker ciphertext. (v1 is the original plain AES-256-GCM with an HKDF per-file key and Argon2id-64; v2 is GCM-SIV without the length binding.)

## AeroCrypt vs rclone crypt vs AeroVault

AeroCrypt (native overlay), rclone crypt (interop overlay) and AeroVault (container) are three distinct things. Keep them apart:

| | AeroCrypt (native) | Rclone Crypt (interop) | AeroVault (container) |
| --- | --- | --- | --- |
| Shape | Per-file overlay on any provider | Per-file overlay, rclone's own format | Single sealed `.aerovault` file |
| Content cipher | AES-256-GCM-SIV (nonce-misuse resistant) | XSalsa20-Poly1305 (not nonce-misuse resistant) | AES-256-GCM-SIV |
| Filenames | AES-256-SIV | rclone EME | Kept inside the encrypted manifest |
| Interop | AeroFTP only | Reads and writes rclone's format | AeroFTP (plus Cryptomator import) |
| Best for | Leading encryption on any backend | Existing `rclone crypt` remotes | A sealed, portable bundle |

AeroFTP leads with AeroCrypt and keeps [Rclone Crypt](/features/rclone-crypt) beside it as the labelled interop lane, the same way [AeroVault](/security/encryption) sits beside Cryptomator import: support the foreign format, lead with ours. The nonce-misuse resistance of AES-256-GCM-SIV is the property rclone crypt's stream-cipher construction does not give you, which is why AeroCrypt leans on it.

## CLI

The `crypt` subcommand drives the same overlay from the terminal:

```bash
# initialize an encrypted overlay at /encrypted on the S3 profile
AEROFTP_CRYPT_PASSWORD=secret aeroftp-cli --profile "S3" crypt init _ /encrypted

# upload (content and filename encrypted)
AEROFTP_CRYPT_PASSWORD=secret aeroftp-cli --profile "S3" crypt put ./secret.pdf _ /encrypted

# list (decrypted names visible)
AEROFTP_CRYPT_PASSWORD=secret aeroftp-cli --profile "S3" crypt ls _ /encrypted

# download and decrypt
AEROFTP_CRYPT_PASSWORD=secret aeroftp-cli --profile "S3" crypt get secret.pdf _ /encrypted ./out.pdf
```

See [CLI Commands](/cli/commands) for the full `crypt` surface.

## Where AeroCrypt sits

AeroCrypt is the `crypt` wrapper of the AeroFTP overlay stack, applied per object on top of the provider. For the full layered encryption architecture see [Encryption](/security/encryption), and for the recovery layer that protects bytes against rot see [Error Correction](/security/error-correction).
