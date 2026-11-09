# AGENTS.md

Instructions for coding agents (Claude Code, Codex, Cursor, WorkBuddy, …) working in
**luci-theme-beautiful**, a shadcn/ui-styled theme for OpenWrt LuCI.

Read this before touching anything. It is short on purpose.

---

## 1. What this repo is

A LuCI theme, not an app:

- `htdocs/luci-static/beautiful/` — the built stylesheet (`cascade.css`), `mobile.css`, `logo.svg`
- `htdocs/luci-static/resources/menu-beautiful.js` — the sidebar / top bar controller (LuCI module)
- `ucode/template/themes/beautiful/` — `header.ut`, `footer.ut`, `sysauth.ut` (ucode templates)
- `src/` — the **source of truth** for CSS. `cascade.css` is generated; never edit it.
- `tools/` — `build.mjs`, `lint-css.mjs`, `package.sh`, `deploy.sh`

`src/vendor/00-structure.css` is the unmodified `luci-theme-bootstrap` stylesheet. It carries the
functional rules LuCI widgets rely on. Do not edit it, do not delete it, do not reorder it.

## 2. Commands

```sh
npm run build      # src/*.css -> htdocs/luci-static/beautiful/cascade.css (+ assetver hash)
npm run lint       # layout contract check; must pass before you finish
tools/package.sh   # dist/luci-theme-beautiful-<version>.tar.gz for on-device install
tools/deploy.sh <host> <password>   # build + push to a live router for a real check
```

`node --watch` is not wired up: CSS changes need `npm run build` (it is instant).

Deploying to a router by hand:

```sh
# copy the three trees, then:
uci set luci.themes.Beautiful=/luci-static/beautiful
uci set luci.main.mediaurlbase=/luci-static/beautiful
uci commit luci
rm -f /tmp/luci-indexcache* && /etc/init.d/uhttpd reload
```

## 3. How the theme is layered

Layers are numbered and concatenated in filename order:

| file | owns |
| --- | --- |
| `10-tokens.css` | **all** colour + metric tokens (`--space-*`, `--text-*`, `--control-h`, `--card-pad`, …) |
| `20-base.css` | document defaults, typography, focus, scrollbars |
| `30-layout.css` | app shell: sidebar, top bar, main column, footer |
| `40-controls.css` | buttons, inputs, checkbox/radio, select, range |
| `50-surfaces.css` | cards, tables, tabs, dialogs, form rows |
| `60-luci.css` | LuCI-specific widgets (dropdown, dynlist, cbi-map, …) |
| `70-utilities.css` | small helpers + the auth (login) screen |
| `mobile.css` | narrow-screen overrides only |

Rules that the linter enforces, and reviewers will reject:

1. **No page-level selectors.** `[data-page="…"]`, page-specific `#id`s and per-page overrides are
   out. Fix the component, not the page.
2. **No hard-coded sizes.** Use tokens; if a value is missing, add the token in `10-tokens.css`.
3. **No inline layout styles in templates.** `header.ut` / `footer.ut` / `sysauth.ut` own
   structure and semantics only.
4. **Colour comes from tokens.** No raw `#hex` / `rgb()` in component layers besides the token file.
5. **Never edit `cascade.css` by hand.** `npm run build` regenerates it and stamps the content hash
   into `header.ut` (`assetver`), which is what busts browser caches.

## 4. LuCI specifics that bite

- LuCI compiles resources with `new Function(...)`, so `menu-beautiful.js` may end with a top-level
  `return baseclass.extend({…})`. `node --check` will fail on it — wrap it to syntax-check:
  `{ echo "(function(){"; cat file; echo "})();"; } > /tmp/x.js && node --check /tmp/x.js`
- Modules load through `L.require('name')` → `/luci-static/resources/name.js`. The browser caches
  them by ETag; a hard reload is the reliable way to see a change.
- `ui.menu.getChildren()` already filters entries whose dependencies are unmet. **Do not render raw
  `children` objects** — that is how 404 menu entries appear.
- Views render themselves into `#view`; the theme must not clear or replace that node.
- `header.ut` prints the page title; the view's own `<h2>` is hidden by CSS (`.cbi-map > h2`,
  `#view > h2:first-child`, …). If you see a duplicate title, extend that list — do not delete the
  view heading rule for everything.
- The theme targets LuCI with **ucode templates** (OpenWrt 23.05+). Lua-era LuCI needs a different
  template API; do not try to support both in one template.

## 5. Browser support

`oklch()` and `color-mix()` are used deliberately (Chrome/Edge 111+, Safari 15.4+, Firefox 113+).
Do not "fix" them into `rgba()` — the whole palette and the theme's customisation story depend on
them. If a fallback palette is ever needed, add it in `10-tokens.css` as a first declaration and
keep the `oklch()` values as the override.

## 6. Definition of done

Before you report a change:

1. `npm run lint` passes.
2. `npm run build` was run (the diff contains `cascade.css` and possibly `header.ut`'s `assetver`).
3. The change was looked at on a real device or against a live router (`tools/deploy.sh`), in
   **both** light and dark mode, at ≥ 1280 px and at ≤ 480 px.
4. No page-level selector, no hard-coded colour, no inline style was added.
5. If the change is user-visible, add or refresh the screenshots under `docs/screenshots/`
   (see `README.md` for the list) and keep both READMEs in sync.

## 7. Documentation contract

`README.md` (简体中文) and `README.en.md` (English) are mirrors. Any change to one must be applied to
the other in the same commit: same headings, same order, same screenshots, same commands.

---

## 中文摘要

- `src/` 是样式的唯一来源；`cascade.css` 是产物，不手改。
- 分层编号即加载顺序；令牌集中在 `10-tokens.css`，组件层只消费令牌。
- 禁止页面级选择器、写死尺寸、模板内联样式；`npm run lint` 会拦截。
- LuCI 模块允许顶层 `return`，`node --check` 需包一层函数再校验。
- 菜单必须用 `ui.menu.getChildren()`，不要自己遍历 `children`，否则会出现 404 菜单项。
- 改完必须 `npm run lint` + `npm run build`，并在明暗两种模式、宽窄两种视口下实机确认。
- 用户可见的改动需要同步更新 `docs/screenshots/`，并同时修改中英文两份 README。
