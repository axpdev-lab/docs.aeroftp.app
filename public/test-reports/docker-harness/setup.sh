#!/bin/bash
set -e

# Setup script for Docker Harness

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYS_DIR="$HARNESS_DIR/keys"
CERTS_DIR="$HARNESS_DIR/certs"

echo "=> Cleaning up old keys and certs..."
rm -rf "$KEYS_DIR" "$CERTS_DIR"
mkdir -p "$KEYS_DIR" "$CERTS_DIR"

echo "=> Generating SSH Keys for SFTP testing..."
# RSA Key
ssh-keygen -t rsa -b 4096 -f "$KEYS_DIR/id_rsa_test" -N "" -q
# Ed25519 Key
ssh-keygen -t ed25519 -f "$KEYS_DIR/id_ed25519_test" -N "" -q

echo "=> Generating Self-Signed Certificate for FTPS testing..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERTS_DIR/vsftpd.pem" \
    -out "$CERTS_DIR/vsftpd.pem" \
    -subj "/C=IT/ST=State/L=City/O=AeroFTP/OU=Testing/CN=localhost" 2>/dev/null

# Set correct permissions
chmod 600 "$KEYS_DIR"/*
chmod 644 "$KEYS_DIR"/*.pub
chmod 600 "$CERTS_DIR/vsftpd.pem"

echo "=> Setup complete. You can now run: docker compose up -d --build"
