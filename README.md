# luci-theme-beautiful

A [shadcn/ui](https://ui.shadcn.com) inspired theme for OpenWrt **LuCI** — neutral palette,
generous whitespace, sidebar navigation, light/dark with a one-click toggle.

Built on top of the official `luci-theme-bootstrap` structure layer, so every LuCI widget
keeps its original behaviour (dropdowns, dynamic lists, tab groups, modals, indicators).

## Highlights

- **shadcn design tokens** — the complete `--background / --foreground / --card / --primary …`
  variable set in `oklch()`, mapped onto the historic `--*-color-*` variables LuCI uses.
- **Sidebar shell** — collapsible navigation groups with lucide-style icons, sticky top bar
  with breadcrumb, page title, indicators and a colour-scheme toggle (persisted in
  `localStorage`, falls back to `prefers-color-scheme`).
- **App-like components** — cards, segmented tabs, quiet outline buttons, destructive
  styling, floating action bar, progress bars, badges, alerts, dialogs.
- **No webfonts** — system UI stack, so it stays fast and works offline.

## Install

### Option A — on-device installer (any OpenWrt 23.x/24.x/25.x)

```sh
scp luci-theme-beautiful-1.0.0.tar.gz root@192.168.1.1:/tmp/
ssh root@192.168.1.1
cd /tmp && tar xzf luci-theme-beautiful-1.0.0.tar.gz && sh luci-theme-beautiful-1.0.0/install.sh
```

Then reload LuCI (hard refresh). The theme is also selectable in *System → System → Language
and Style*.

### Option B — build an `.apk` (OpenWrt 24.10+)

`apk` packages must be produced by the OpenWrt build system (Linux only). Drop this directory
into `feeds/luci/themes/` and build:

```sh
# inside the OpenWrt buildroot / SDK
./scripts/feeds update -a && ./scripts/feeds install -a
make package/luci-theme-beautiful/compile V=s
ls bin/packages/*/luci/luci-theme-beautiful-*.apk
```

The included `.github/workflows/build-apk.yml` does the same on CI and uploads the artifact.

> The router only accepts packages signed by a key in `/etc/apk/keys`. A locally built package
> is signed with the build key of that SDK; for public distribution either publish the matching
> public key alongside the package, or install it explicitly with
> `apk add --allow-untrusted ./luci-theme-beautiful-*.apk`.

## Development

```sh
node tools/build.mjs          # src/*.css -> htdocs/luci-static/beautiful/cascade.css
tools/package.sh              # dist/luci-theme-beautiful-<version>.tar.gz
```

`src/vendor/00-structure.css` is the untouched bootstrap stylesheet (Apache-2.0). It carries
the functional rules that LuCI widgets depend on; everything visual lives in the numbered
layers above it. The build also stamps a content hash into `header.ut` so browsers pick up a
new stylesheet immediately after deployment.

## Layout

```
htdocs/luci-static/beautiful/           css, logo
htdocs/luci-static/resources/           menu-beautiful.js
ucode/template/themes/beautiful/        header.ut, footer.ut, sysauth.ut
root/etc/uci-defaults/                  theme registration
src/                                    design tokens + component layers
```

## Customising

Change the accent by overriding the tokens — no selector rewriting needed:

```css
:root {
	--primary: oklch(0.55 0.18 255);
	--primary-foreground: oklch(0.985 0 0);
	--radius: 0.75rem;
}
```

## Licence

Apache-2.0. The structure layer is derived from `luci-theme-bootstrap`
(Copyright 2008-2022 The LuCI team).
