# TOTP Two-Factor Authentication

AeroFTP supports an optional TOTP (Time-based One-Time Password) second factor for protecting vault access. When enabled, unlocking the vault requires both the master password and a 6-digit code from an authenticator app, providing defense against stolen or guessed passwords.

## Overview

| Property | Detail |
| -------- | ------ |
| Standard | RFC 6238 (TOTP) |
| Code length | 6 digits |
| Time step | 30 seconds |
| Hash algorithm | HMAC-SHA1 |
| Secret length | 160 bits (20 bytes) |
| Secret generation | OsRng (operating system CSPRNG) |
| Compatible apps | Google Authenticator, Authy, 1Password, Bitwarden, Microsoft Authenticator, FreeOTP |

## Setup

### Enabling TOTP

1. Open **Settings > Security**
2. Click **Enable TOTP 2FA**
3. A QR code is displayed containing the TOTP secret in `otpauth://` URI format
4. Scan the QR code with your authenticator app
5. Enter the 6-digit verification code shown in your authenticator app to confirm setup
6. TOTP is now active — the vault will require a code on every unlock

The `setup_verified` gate ensures that TOTP enforcement only activates after the initial verification code is successfully entered. This prevents a misconfigured authenticator from locking the user out of the vault.

> **Warning:** Save your TOTP secret or take a screenshot of the QR code before closing the setup dialog. If you lose access to your authenticator app, you will not be able to unlock the vault. There is no recovery mechanism — the TOTP secret is stored encrypted and cannot be extracted without the current master password and a valid TOTP code.

### What the QR Code Contains

The QR code encodes a standard `otpauth://totp/` URI:

```text
otpauth://totp/AeroFTP:Vault?secret=BASE32SECRET&issuer=AeroFTP&algorithm=SHA1&digits=6&period=30
```

Any RFC 6238-compatible authenticator app can scan this code.

## Unlock Flow

When TOTP is enabled, the vault unlock sequence is:

```text
1. User enters master password
2. Argon2id derives master key from password
3. Master key is verified against stored authentication hash
4. If password is correct → TOTP input field appears
5. User enters 6-digit code from authenticator app
6. Code is verified against stored TOTP secret (current + previous time window)
7. If code is valid → vault unlocks
8. If code is invalid → attempt counter increments, rate limiting may apply
```

The TOTP verification accepts codes from the current 30-second window and the immediately preceding window, providing a 60-second effective validity period. This accounts for minor clock drift between the device and the authenticator app.

## Rate Limiting

To prevent brute-force attacks on the 6-digit TOTP code (which has only 1,000,000 possible values), AeroFTP enforces exponential backoff on failed attempts:

| Failed Attempts | Lockout Duration | Cumulative Delay |
| --------------- | ---------------- | ---------------- |
| 1-4 | None | 0 |
| 5 | 30 seconds | 30s |
| 6 | 1 minute | 1m 30s |
| 7 | 2 minutes | 3m 30s |
| 8 | 5 minutes | 8m 30s |
| 9 | 10 minutes | 18m 30s |
| 10+ | 15 minutes (cap) | 33m 30s+ |

The rate limiter state is held in memory and resets completely after a successful authentication. Restarting the application also resets the rate limiter (this is intentional — the rate limiter protects against automated attacks during a single session, not against offline attacks which are already mitigated by Argon2id).

### Lockout Behavior

During a lockout period:
- The TOTP input field is disabled
- A countdown timer shows the remaining lockout duration
- The master password field remains accessible (but submitting triggers the lockout check)
- No network requests are made during lockout (all verification is local)

## Disabling TOTP

1. Open **Settings > Security**
2. Click **Disable TOTP 2FA**
3. Enter your current 6-digit TOTP code to confirm identity
4. TOTP is removed — the vault returns to password-only authentication

Disabling TOTP requires a valid current code. This prevents an attacker who knows the master password (but not the TOTP secret) from downgrading the vault's security.

## Technical Implementation

### Thread Safety

The TOTP state is stored in a `Mutex<TotpInner>` structure that serializes all TOTP operations. This ensures that concurrent vault unlock attempts (e.g., from multiple UI events) cannot race against each other. The mutex includes poison recovery — if a thread panics while holding the lock, subsequent lock acquisitions recover gracefully instead of propagating the panic.

### Cryptographic Properties

| Property | Implementation |
| -------- | -------------- |
| Secret generation | `OsRng` — operating system CSPRNG (not `thread_rng`) |
| Secret storage | Encrypted in vault.db (AES-256-GCM) |
| Memory protection | Secret bytes wrapped in `secrecy::Secret<Vec<u8>>`, zeroized on drop |
| Verification | HMAC-SHA1 with time-based counter (RFC 6238 Section 4) |
| Time windows accepted | Current + previous (60-second effective window) |
| State mutex | Single `Mutex<TotpInner>` with poison recovery |
| Setup gate | `setup_verified: bool` — TOTP only enforced after initial code verification |

### Secret Lifecycle

```text
1. Setup initiated → OsRng generates 20 random bytes
2. Secret displayed as QR code → user scans with authenticator app
3. User enters verification code → code validated against secret
4. If valid → secret encrypted and stored in vault.db, setup_verified = true
5. If invalid → secret discarded, setup_verified remains false
6. On vault unlock → secret decrypted from vault.db, used for HMAC-SHA1, then zeroized
7. On TOTP disable → secret permanently deleted from vault.db
```

At no point is the raw TOTP secret written to disk in plaintext. The `Secret<Vec<u8>>` wrapper ensures that the bytes are overwritten with zeros when the value is dropped, preventing sensitive data from persisting in freed memory.

## Frequently Asked Questions

**Can I use TOTP without a master password?**
No. TOTP is a second factor that supplements the master password. Without a master password, the vault uses an auto-generated passphrase stored in the OS keyring, and TOTP cannot be enabled.

**What happens if my authenticator app is lost?**
There is no recovery mechanism. You will need to reset the vault, which deletes all stored credentials. This is a deliberate security design — TOTP recovery codes would weaken the two-factor guarantee.

**Does TOTP protect individual file operations?**
No. TOTP protects vault access only. Once the vault is unlocked for a session, all operations (file transfers, encryption, credential retrieval) proceed without additional TOTP prompts. The vault remains unlocked until the application is closed.

**Is the TOTP implementation audited?**
The TOTP implementation was reviewed as part of the v2.2.4 security audit (5 independent reviewers). Specific hardening measures include: single `Mutex<TotpInner>` replacing separate locks, `setup_verified` gate, exponential rate limiting, `OsRng` instead of `thread_rng`, zeroize on all secret bytes, and poison recovery on the mutex.
