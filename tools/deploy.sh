#!/bin/sh
# Push the theme to a live router for a quick preview.
# usage: tools/deploy.sh <host> <password>
set -e
HOST=${1:?host}
PASS=${2:?password}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
STAGE=$(mktemp -d)

node "$ROOT/tools/build.mjs"

mkdir -p "$STAGE/www/luci-static/beautiful" \
         "$STAGE/www/luci-static/resources" \
         "$STAGE/usr/share/ucode/luci/template/themes/beautiful"

cp "$ROOT"/htdocs/luci-static/beautiful/* "$STAGE/www/luci-static/beautiful/"
cp "$ROOT"/htdocs/luci-static/resources/menu-beautiful.js "$STAGE/www/luci-static/resources/"
cp "$ROOT"/ucode/template/themes/beautiful/*.ut "$STAGE/usr/share/ucode/luci/template/themes/beautiful/"

tar czf /tmp/beautiful.tar.gz -C "$STAGE" .
rm -rf "$STAGE"

EXP="$ROOT/tools/remote.exp"
scp -O -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR \
    /tmp/beautiful.tar.gz "root@$HOST:/tmp/" <<<"$PASS"

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "root@$HOST" \
    'tar xzf /tmp/beautiful.tar.gz -C / && rm -f /tmp/beautiful.tar.gz && rm -f /tmp/luci-indexcache*'
