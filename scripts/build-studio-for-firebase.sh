#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STUDIO_DIR="$ROOT_DIR/Publications"
STUDIO_TARGET_DIR="$ROOT_DIR/studio"
STATIC_TARGET_DIR="$ROOT_DIR/static"
VENDOR_TARGET_DIR="$ROOT_DIR/vendor"

echo "Building Sanity Studio..."
cd "$STUDIO_DIR"
npm run build

echo "Syncing build output..."
rm -rf "$STUDIO_TARGET_DIR" "$STATIC_TARGET_DIR" "$VENDOR_TARGET_DIR"
mkdir -p "$STUDIO_TARGET_DIR"
cp "$STUDIO_DIR/dist/index.html" "$STUDIO_TARGET_DIR/index.html"
cp -R "$STUDIO_DIR/dist/static" "$STATIC_TARGET_DIR"
cp -R "$STUDIO_DIR/dist/vendor" "$VENDOR_TARGET_DIR"

echo "Studio ready at: $STUDIO_TARGET_DIR"
echo "Studio assets ready at: $STATIC_TARGET_DIR and $VENDOR_TARGET_DIR"
echo "Local URL (after serve): http://localhost:5500/studio"
