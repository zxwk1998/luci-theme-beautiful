#!/bin/sh
# Push the theme to a live router for a quick preview.
#
# usage: tools/deploy.sh <host> [password]
#
# The password is optional and only honoured when `sshpass` is installed;
# without it the script relies on SSH keys or an interactive prompt.
set -e

HOST=${1:?usage: tools/deploy.sh <host> [password]}
PASS=${2:-}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
STAGE=$(mktemp -d)
TARBALL=/tmp/beautiful-$$.tar.gz

cleanup() { rm -rf "$STAGE" "$TARBALL"; }
trap cleanup EXIT INT TERM

node "$ROOT/tools/build.mjs"

mkdir -p "$STAGE/www/luci-static/beautiful" \
         "$STAGE/www/luci-static/resources" \
         "$STAGE/usr/share/ucode/luci/template/themes/beautiful"

cp "$ROOT"/htdocs/luci-static/beautiful/* "$STAGE/www/luci-static/beautiful/"
cp "$ROOT"/htdocs/luci-static/resources/menu-beautiful.js "$STAGE/www/luci-static/resources/"
cp "$ROOT"/ucode/template/themes/beautiful/*.ut "$STAGE/usr/share/ucode/luci/template/themes/beautiful/"

tar czf "$TARBALL" -C "$STAGE" .

SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"

if [ -n "$PASS" ]; then
	command -v sshpass >/dev/null 2>&1 || {
		echo "error: sshpass is not installed; omit the password and use SSH keys" >&2
		exit 1
	}
	copy() { sshpass -p "$PASS" scp -O $SSH_OPTS "$1" "root@$HOST:/tmp/"; }
	remote() { sshpass -p "$PASS" ssh $SSH_OPTS "root@$HOST" "$@"; }
else
	copy() { scp -O $SSH_OPTS "$1" "root@$HOST:/tmp/"; }
	remote() { ssh $SSH_OPTS "root@$HOST" "$@"; }
fi

NAME=$(basename "$TARBALL")

copy "$TARBALL"

# unpack, drop the stale LuCI index cache and make sure the theme is selected:
# an unselected theme keeps serving the stock skin and the deploy looks no-op
remote "tar xzf /tmp/$NAME -C / && rm -f /tmp/$NAME /tmp/luci-indexcache* && \
        uci -q set luci.themes.Beautiful=/luci-static/beautiful && \
        uci -q set luci.main.mediaurlbase=/luci-static/beautiful && \
        uci -q commit luci && \
        chmod 644 /www/luci-static/beautiful/* /www/luci-static/resources/menu-beautiful.js \
                  /usr/share/ucode/luci/template/themes/beautiful/*.ut"

echo "==> deployed to $HOST — hard refresh the browser (Ctrl/Cmd+Shift+R)"
