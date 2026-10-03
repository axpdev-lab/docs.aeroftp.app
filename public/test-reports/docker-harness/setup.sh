#!/bin/bash
set -e

# Setup script for the Docker harness: generates the SSH test keys the SFTP
# container trusts. The FTP container runs its image's own configuration and
# takes no certificate from this script.

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYS_DIR="$HARNESS_DIR/keys"

echo "=> Cleaning up old keys..."
rm -rf "$KEYS_DIR"
mkdir -p "$KEYS_DIR"

echo "=> Generating SSH Keys for SFTP testing..."
# RSA Key
ssh-keygen -t rsa -b 4096 -f "$KEYS_DIR/id_rsa_test" -N "" -q
# Ed25519 Key
ssh-keygen -t ed25519 -f "$KEYS_DIR/id_ed25519_test" -N "" -q

# Set correct permissions
chmod 600 "$KEYS_DIR"/*
chmod 644 "$KEYS_DIR"/*.pub

echo "=> Setup complete. You can now run: docker compose up -d --build"
