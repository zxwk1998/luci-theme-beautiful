#!/bin/sh
# Build dist/luci-theme-beautiful-<version>.tar.gz with an on-device installer.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
VER=$(node -p "require('$ROOT/package.json').version")
OUT="$ROOT/dist"
STAGE=$(mktemp -d)

node "$ROOT/tools/build.mjs"

mkdir -p "$STAGE/www/luci-static/beautiful" \
         "$STAGE/www/luci-static/resources" \
         "$STAGE/usr/share/ucode/luci/template/themes/beautiful"
cp "$ROOT"/htdocs/luci-static/beautiful/* "$STAGE/www/luci-static/beautiful/"
cp "$ROOT"/htdocs/luci-static/resources/menu-beautiful.js "$STAGE/www/luci-static/resources/"
cp "$ROOT"/ucode/template/themes/beautiful/*.ut "$STAGE/usr/share/ucode/luci/template/themes/beautiful/"
cp "$ROOT"/root/install.sh "$STAGE/install.sh"
chmod +x "$STAGE/install.sh"

mkdir -p "$OUT"
NAME="luci-theme-beautiful-$VER"
mkdir -p "$STAGE/$NAME" && (cd "$STAGE" && mv www usr install.sh "$NAME/")
tar czf "$OUT/$NAME.tar.gz" -C "$STAGE" "$NAME"
rm -rf "$STAGE"
echo "built $OUT/$NAME.tar.gz"
