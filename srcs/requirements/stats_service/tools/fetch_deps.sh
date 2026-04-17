#!/usr/bin/env bash
# Downloads Crow + Asio headers into this tools/ folder for local builds.

set -euo pipefail

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ASIO_VER="asio-1-30-2"
CROW_VER="v1.2.0"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "[1/2] Downloading Asio..."
curl -L "https://github.com/chriskohlhoff/asio/archive/refs/tags/${ASIO_VER}.tar.gz" -o "$tmp/asio.tar.gz"
tar -xzf "$tmp/asio.tar.gz" -C "$tmp"
cp -R "$tmp/asio-${ASIO_VER}/asio/include/"* "$TOOLS_DIR/"

echo "[2/2] Downloading Crow..."
curl -L "https://github.com/CrowCpp/Crow/releases/download/${CROW_VER}/crow_all.h" -o "$TOOLS_DIR/crow_all.h"

echo "OK: tools/ updated."
