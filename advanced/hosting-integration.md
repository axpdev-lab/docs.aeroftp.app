# Hosting Provider Integration

AeroFTP supports encrypted `.aeroftp` connection profiles that hosting providers can generate directly from their control panels.

**Instead of sending FTP credentials in plaintext emails, you can offer your customers a one-click import file with encrypted credentials.**

## What You Can Do Today

1. **Generate `.aeroftp` profiles** from your hosting control panel (cPanel, Plesk, DirectAdmin, custom)
2. **Deliver them to customers** via download link or email attachment
3. **Customers import with one click** - connections appear in AeroFTP ready to use
4. **Credentials stay encrypted** - AES-256-GCM with Argon2id key derivation, never exposed in plaintext

## How It Works

When a customer signs up or requests FTP access, your panel generates an `.aeroftp` file containing their connection details (host, port, username, password, remote path). The file is encrypted with a password that you communicate through a separate channel (SMS, phone call, or a second email).

The customer opens the file in AeroFTP, enters the password, and their server appears in the connection list - configured and ready to connect.

```
Your Control Panel                    Customer
      │                                  │
      ├── Generate .aeroftp file ──────► Download
      │   (encrypted with password)      │
      │                                  │
      ├── Send password via SMS ───────► Enter password
      │                                  │
      │                                  ├── Open in AeroFTP
      │                                  ├── Server appears in "My Servers"
      │                                  └── Connect with one click
```

## File Format

An `.aeroftp` file is a JSON document with an encrypted payload:

```json
{
  "version": 1,
  "salt": [/* 32 random bytes as integer array */],
  "nonce": [/* 12 random bytes as integer array */],
  "encrypted_payload": [/* AES-256-GCM ciphertext as integer array */],
  "metadata": {
    "exportDate": "2026-04-04T20:00:00Z",
    "aeroftpVersion": "3.7.0",
    "serverCount": 1,
    "hasCredentials": true
  }
}
```

The `metadata` field is unencrypted and shown to the user before they enter the decryption password.

## Encryption Details

### Key Derivation (Argon2id)

| Parameter | Value |
|-----------|-------|
| Algorithm | Argon2id |
| Memory | 128 MiB |
| Iterations | 3 |
| Parallelism | 4 |
| Output length | 32 bytes |
| Salt | 32 random bytes |

### Symmetric Encryption (AES-256-GCM)

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-256-GCM |
| Key | 32-byte Argon2id output |
| Nonce | 12 random bytes |
| Plaintext | JSON-serialized payload (UTF-8) |

The `salt`, `nonce`, and `encrypted_payload` fields are JSON arrays of unsigned byte values (0-255).

## Payload Schema

The decrypted payload contains a `servers` array:

```json
{
  "servers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "example.com - FTP",
      "host": "ftp.example.com",
      "port": 21,
      "username": "customer@example.com",
      "protocol": "ftp",
      "initialPath": "/public_html",
      "credential": "the-password",
      "options": {
        "tlsMode": "explicit",
        "verifyCert": true
      }
    }
  ]
}
```

### Server Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier (UUID v4 recommended) |
| `name` | string | yes | Display name shown to the customer |
| `host` | string | yes | Server hostname or IP address |
| `port` | number | yes | Connection port |
| `username` | string | yes | Login username |
| `protocol` | string | no | `ftp`, `ftps`, `sftp`, `webdav`. Default: `ftp` |
| `initialPath` | string | no | Remote directory opened after connection |
| `localInitialPath` | string | no | Local directory paired with connection |
| `credential` | string | no | Password (encrypted in file) |
| `color` | string | no | Hex color for the server badge (e.g. `#3B82F6`) |
| `providerId` | string | no | Provider identifier for branding |
| `options` | object | no | Protocol-specific options (see below) |

### FTP / FTPS Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `tlsMode` | string | `explicit`, `implicit`, `explicit_if_available`, `none` | TLS encryption mode |
| `verifyCert` | boolean | `true` / `false` | Validate server certificate |

- **`explicit`** (recommended): AUTH TLS on port 21
- **`implicit`**: TLS on port 990
- **`explicit_if_available`**: Try TLS, fall back to plaintext
- **`none`**: No encryption (not recommended)

### SFTP Options

| Option | Type | Description |
|--------|------|-------------|
| `authMethod` | string | `password`, `key`, `key_and_password` |
| `privateKeyPath` | string | Path to SSH private key file |
| `key_passphrase` | string | Passphrase for encrypted private key |

### WebDAV

No additional options required. Use the full URL as `host`.

## Code Examples

### Python

```python
import json, os, uuid
from argon2.low_level import hash_secret_raw, Type
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from datetime import datetime, timezone

def generate_aeroftp_profile(servers, password):
    salt = os.urandom(32)
    key = hash_secret_raw(
        secret=password.encode('utf-8'),
        salt=bytes(salt),
        time_cost=3,
        memory_cost=131072,  # 128 MiB
        parallelism=4,
        hash_len=32,
        type=Type.ID
    )

    nonce = os.urandom(12)
    payload = json.dumps({"servers": servers}).encode('utf-8')
    ciphertext = AESGCM(key).encrypt(nonce, payload, None)

    return {
        "version": 1,
        "salt": list(salt),
        "nonce": list(nonce),
        "encrypted_payload": list(ciphertext),
        "metadata": {
            "exportDate": datetime.now(timezone.utc).isoformat(),
            "aeroftpVersion": "3.7.0",
            "serverCount": len(servers),
            "hasCredentials": any(s.get("credential") for s in servers)
        }
    }

# Usage
servers = [{
    "id": str(uuid.uuid4()),
    "name": "example.com - FTP",
    "host": "ftp.example.com",
    "port": 21,
    "username": "customer@example.com",
    "protocol": "ftp",
    "initialPath": "/public_html",
    "credential": "customer-password",
    "options": {"tlsMode": "explicit", "verifyCert": True}
}]

profile = generate_aeroftp_profile(servers, "transfer-password")
with open("customer.aeroftp", "w") as f:
    json.dump(profile, f, indent=2)
```

### Node.js

```javascript
const crypto = require('crypto');
const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');

async function generateAeroftpProfile(servers, password) {
  const salt = crypto.randomBytes(32);
  const key = await argon2.hash(password, {
    type: argon2.argon2id,
    salt,
    memoryCost: 131072,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
    raw: true
  });

  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({ servers }), 'utf8'),
    cipher.final(),
    cipher.getAuthTag()
  ]);

  return {
    version: 1,
    salt: [...salt],
    nonce: [...nonce],
    encrypted_payload: [...encrypted],
    metadata: {
      exportDate: new Date().toISOString(),
      aeroftpVersion: '3.7.0',
      serverCount: servers.length,
      hasCredentials: servers.some(s => s.credential)
    }
  };
}
```

### PHP

```php
<?php
function generateAeroftpProfile(array $servers, string $password): array {
    $salt = random_bytes(32);

    // Argon2id key derivation
    $key = sodium_crypto_pwhash(
        32,
        $password,
        str_pad($salt, SODIUM_CRYPTO_PWHASH_SALTBYTES, "\0"),
        3,                                          // time cost
        134217728,                                  // 128 MiB memory
        SODIUM_CRYPTO_PWHASH_ALG_ARGON2ID13
    );

    // AES-256-GCM encryption
    $nonce = random_bytes(12);
    $payload = json_encode(['servers' => $servers]);
    $ciphertext = openssl_encrypt(
        $payload, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $nonce, $tag
    );

    return [
        'version' => 1,
        'salt' => array_values(unpack('C*', $salt)),
        'nonce' => array_values(unpack('C*', $nonce)),
        'encrypted_payload' => array_values(unpack('C*', $ciphertext . $tag)),
        'metadata' => [
            'exportDate' => gmdate('Y-m-d\TH:i:s\Z'),
            'aeroftpVersion' => '3.7.0',
            'serverCount' => count($servers),
            'hasCredentials' => !empty(array_filter($servers, fn($s) => !empty($s['credential'])))
        ]
    ];
}
```

## Best Practices

- **Always use FTPS or SFTP** - set `tlsMode` to `explicit` or `implicit`, or use `protocol: "sftp"`
- **Use a strong transfer password** - protect the credentials in transit. Communicate the password through a separate channel (SMS, phone, second email)
- **Set `verifyCert: true`** - ensure your server has a valid TLS certificate. [Let's Encrypt](https://letsencrypt.org/) is free and fully supported
- **Pre-fill `initialPath`** - save customers from navigating to their web root (`/public_html`, `/httpdocs`, `/www`)
- **Use meaningful names** - include the domain so customers can identify the connection (e.g. "example.com - FTP")
- **One profile per customer** - generate a unique file for each customer with their specific credentials

## Recommend AeroFTP to Your Customers

AeroFTP is free, open source, and available on all platforms:

| Platform | Install |
|----------|---------|
| **Windows** | `winget install axpnet.AeroFTP` |
| **Linux (Snap)** | `sudo snap install aeroftp` |
| **Linux (AUR)** | `yay -S aeroftp-bin` |
| **macOS** | [Download DMG](https://github.com/axpdev-lab/aeroftp/releases/latest) |

## Contact

For integration help or questions about the `.aeroftp` format, contact [dev@aeroftp.app](mailto:dev@aeroftp.app).

AeroFTP is free and open source (GPL-3.0). Hosting providers are welcome to integrate without any licensing requirements.
