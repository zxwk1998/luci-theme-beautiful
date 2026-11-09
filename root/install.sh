#!/bin/sh
#
# luci-theme-beautiful — on-device installer
#
# Run as root on the router from the unpacked archive directory:
#   sh install.sh
#
set -e

[ "$(id -u)" = 0 ] || { echo "error: must run as root" >&2; exit 1; }

SRC=$(cd "$(dirname "$0")" && pwd)
WWW=/www/luci-static
TPL=/usr/share/ucode/luci/template/themes

echo "==> installing files"
mkdir -p "$WWW/beautiful" "$TPL/beautiful" "$WWW/resources"
cp -f "$SRC"/www/luci-static/beautiful/cascade.css  "$WWW/beautiful/"
cp -f "$SRC"/www/luci-static/beautiful/mobile.css   "$WWW/beautiful/"
cp -f "$SRC"/www/luci-static/beautiful/logo.svg     "$WWW/beautiful/"
cp -f "$SRC"/www/luci-static/resources/menu-beautiful.js "$WWW/resources/"
cp -f "$SRC"/usr/share/ucode/luci/template/themes/beautiful/*.ut "$TPL/beautiful/"

chmod 644 "$WWW"/beautiful/* "$TPL"/beautiful/* "$WWW"/resources/menu-beautiful.js

echo "==> registering theme"
uci -q set luci.themes.Beautiful=/luci-static/beautiful
uci -q set luci.main.mediaurlbase=/luci-static/beautiful
uci -q commit luci

echo "==> clearing caches"
rm -f /tmp/luci-indexcache* 2>/dev/null || true
/etc/init.d/uhttpd reload >/dev/null 2>&1 || true

echo "==> done — reload LuCI in your browser (hard refresh: Ctrl/Cmd+Shift+R)"
