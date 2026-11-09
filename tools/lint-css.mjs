#!/usr/bin/env node
/**
 * Layout guard — keeps the theme on one layout system.
 *
 * The rule this enforces: base layout is defined once, in the token and
 * component layers. No page may invent its own geometry, and no template
 * may bypass the layers with inline layout styles.
 *
 * Checks
 *   1. no page-scoped selectors            [data-page="…"]
 *   2. no per-page element ids             #some-view-id
 *   3. no literal font sizes               font-size: 13px / 0.8rem
 *   4. no inline layout styles in .ut      style="width: …"
 *
 * Run through `npm run lint`.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');

/* selectors that address a shared component, not a page */
const ALLOWED_IDS = new Set(['#view', '#modal_overlay', '#indicators', '#applyreboot-section']);

/* inline styles that express state rather than layout */
const ALLOWED_INLINE = [/^display\s*:\s*none;?$/];

const errors = [];

const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */
for (const file of (await readdir(srcDir)).filter((f) => f.endsWith('.css'))) {
	/* the vendored bootstrap sheet is not ours to police */
	if (file === '00-structure.css')
		continue;

	const path = join(srcDir, file);
	const lines = strip(await readFile(path, 'utf8')).split('\n');

	lines.forEach((line, i) => {
		const at = `${relative(root, path)}:${i + 1}`;
		const isSelector = line.includes('{') || line.trimEnd().endsWith(',');

		if (line.includes('[data-page')) {
			errors.push(`${at}  page-scoped selector — pages must not style themselves\n           ${line.trim()}`);
			return;
		}

		if (isSelector) {
			for (const id of line.matchAll(/#[a-zA-Z][\w-]*/g)) {
				if (!ALLOWED_IDS.has(id[0]))
					errors.push(`${at}  id selector ${id[0]} — use a component class instead`);
			}
		}

		if (file !== '10-tokens.css' && /font-size:\s*[0-9.]+(px|rem)\b/.test(line)) {
			errors.push(`${at}  literal font size — use a --text-* token\n           ${line.trim()}`);
		}
	});
}

/* ------------------------------------------------------------------ */
/* ucode templates                                                     */
/* ------------------------------------------------------------------ */
async function walk(dir) {
	const out = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory())
			out.push(...await walk(path));
		else if (entry.name.endsWith('.ut'))
			out.push(path);
	}
	return out;
}

for (const path of await walk(join(root, 'ucode'))) {
	const lines = (await readFile(path, 'utf8')).split('\n');

	lines.forEach((line, i) => {
		for (const attr of line.matchAll(/style\s*=\s*"([^"]*)"/g)) {
			const value = attr[1].trim();
			if (!ALLOWED_INLINE.some((re) => re.test(value)))
				errors.push(`${relative(root, path)}:${i + 1}  inline layout style "${value}" — move it into a layer`);
		}
	});
}

/* ------------------------------------------------------------------ */
if (errors.length) {
	console.error(`layout guard: ${errors.length} violation(s)\n`);
	for (const e of errors)
		console.error(`  ${e}`);
	process.exit(1);
}

console.log('layout guard: clean — one layout system, no page-level styles');
