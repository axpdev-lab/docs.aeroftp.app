#!/bin/bash
set -e

# Setup authorized keys for key and mixed users
cat /mnt/keys/id_rsa_test.pub > /home/user_key/.ssh/authorized_keys
cat /mnt/keys/id_ed25519_test.pub >> /home/user_key/.ssh/authorized_keys

cat /mnt/keys/id_rsa_test.pub > /home/user_mixed/.ssh/authorized_keys

chown user_key:user_key /home/user_key/.ssh/authorized_keys
chmod 600 /home/user_key/.ssh/authorized_keys

chown user_mixed:user_mixed /home/user_mixed/.ssh/authorized_keys
chmod 600 /home/user_mixed/.ssh/authorized_keys

echo "Starting sshd..."
exec /usr/sbin/sshd -D -e
