# TOTP Two-Factor Authentication

AeroFTP can require a code from an authenticator app before unlocking the credential vault. The second factor protects vault access, including supported headless unlock paths; it is separate from a provider account's own two-factor sign-in.

| Property | Value |
| --- | --- |
| Standard | RFC 6238 |
| Code | Six digits |
| Time step | 30 seconds |
| HMAC | SHA-1 |
| Secret | 20 random bytes from the operating system |
| Clock allowance | Current step and its immediately previous and next steps |

## Setup

1. Open **Settings > Security** with the vault unlocked.
2. Start TOTP setup and scan the displayed QR code in your authenticator.
3. Enter a current six-digit code to verify the setup.
4. Enable the verified configuration.

AeroFTP persists the encrypted secret before enabling the factor. If that write fails, setup does not activate. Treat the QR code and displayed secret as credentials: keep any recovery copy in protected storage separate from this computer.

The QR code uses an `otpauth://` URI with AeroFTP as issuer and the Desktop 2FA account label. Standard TOTP authenticator apps can use it.

## Unlock and replay protection

A master-password vault first derives the wrapping key, decrypts the random vault passphrase, and verifies the resulting vault key. It then checks the second factor before making the unlocked vault available. Automatic keyring mode also has a TOTP unlock path; TOTP is not restricted to master-password mode.

A valid code is accepted only if its time step is newer than the last consumed step. Reusing a code from an already consumed step is rejected, even if it remains inside the clock allowance. If you have just unlocked and locked again, wait for a new code.

Keep your computer and authenticator clocks synchronized. The accepted skew is one step on either side; it is not an unrestricted extra period in which every code can be reused.

## Failed attempts

After five failed attempts, the delay starts at 30 seconds and doubles: 30, 60, 120, 240, 480 seconds, then a 900-second cap. Successful verification clears the failure counter.

Throttle state and the last consumed time step are persisted in the vault. Restarting the application is not intended to clear the throttle or permit replay. Verification is local, so no external authentication service is contacted to check a code.

## Disable or recover

Disabling TOTP requires a valid code. Use **Settings > Security** while you still have access to the authenticator. AeroFTP does not offer a password-reset service that can bypass the second factor.

If you lose the authenticator, use a protected copy of the TOTP setup secret if you kept one. Otherwise recovery depends on a suitable earlier backup or resetting the credential vault, which loses its saved credentials. Review the backup's scope and factor state before relying on it.

## Locking and scope

After unlock, approved file and provider operations can use the available credentials. TOTP does not ask for a new code for every file. The vault can lock manually or through its configured inactivity timeout, as well as when the app closes.

The secret is stored encrypted in the credential vault. Secret wrappers and explicit clearing reduce residual memory copies; they do not prove that no secret can appear in an unlocked process dump.

See [Credential Management](/security/credentials) for the passphrase modes and [Security audits](/security/audits) for dated review evidence.
