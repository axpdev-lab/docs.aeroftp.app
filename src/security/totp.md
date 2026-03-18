# TOTP Two-Factor Authentication

AeroFTP supports an optional TOTP (Time-based One-Time Password) second factor for protecting vault access. When enabled, opening the vault requires both the master password and a 6-digit code from an authenticator app.

## Overview

| Property | Detail |
|----------|--------|
| Standard | RFC 6238 (TOTP) |
| Code length | 6 digits |
| Time step | 30 seconds |
| Algorithm | HMAC-SHA1 |
| Compatible apps | Google Authenticator, Authy, 1Password, Bitwarden, etc. |

## Setup

1. Open **Settings > Security**
2. Click **Enable TOTP 2FA**
3. Scan the QR code with your authenticator app
4. Enter the 6-digit verification code to confirm setup
5. TOTP is now active — the vault will require a code on every unlock

> **Warning:** Save your TOTP secret or backup codes before closing the setup dialog. If you lose access to your authenticator app, you will not be able to unlock the vault.

## Unlocking with TOTP

When TOTP is enabled, the vault unlock dialog shows an additional input field after the master password. Enter the current 6-digit code from your authenticator app to complete authentication.

## Rate Limiting

To prevent brute-force attacks on the TOTP code, AeroFTP enforces exponential backoff:

| Failed Attempts | Lockout Duration |
|----------------|-----------------|
| 1-4 | No lockout |
| 5 | 30 seconds |
| 6 | 1 minute |
| 7 | 2 minutes |
| 8 | 5 minutes |
| 9 | 10 minutes |
| 10+ | 15 minutes |

The rate limiter resets after a successful authentication.

## Disabling TOTP

1. Open **Settings > Security**
2. Click **Disable TOTP 2FA**
3. Enter your current TOTP code to confirm
4. TOTP is removed — the vault returns to password-only authentication

## Technical Details

- The TOTP secret is stored in a `Mutex<TotpInner>` with poison recovery
- The `setup_verified` gate ensures TOTP is only enforced after successful initial verification
- Random bytes are generated via `OsRng` (operating system CSPRNG)
- Secret bytes are zeroized on drop to prevent memory leakage
- The TOTP implementation is single-threaded by design — one `Mutex` serializes all operations

> **Tip:** TOTP protects vault access, not individual file operations. Once the vault is unlocked for a session, operations proceed without additional TOTP prompts.
