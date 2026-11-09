#!/usr/bin/env node
/**
 * Build the distributable stylesheet.
 *
 * Concatenates the layering sources in src/ into a single cascade.css so
 * the router only performs one CSS request. The vendored structure layer
 * is kept verbatim: it carries the functional rules (dropdown visibility,
 * table cell display, modal mechanics) that every LuCI widget depends on,
 * while the theme layers on top provide all visual styling.
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const outDir = join(root, 'htdocs', 'luci-static', 'beautiful');

const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

async function buildCascade() {
	/* the vendored structure layer always comes first */
	const sources = [join('vendor', '00-structure.css')];

	for (const file of (await readdir(srcDir)).filter((f) => f.endsWith('.css') && f !== 'mobile.css').sort())
		sources.push(file);

	const stamp = new Date().toISOString().slice(0, 10);
	const banner = `/*! luci-theme-beautiful — built ${stamp} — do not edit, see src/ */\n`;

	const parts = [banner];
	let lines = 0;

	for (const file of sources) {
		const css = await readFile(join(srcDir, file), 'utf8');
		lines += css.split('\n').length;
		parts.push(`\n/* ===== src/${file} ===== */\n${css.trim()}\n`);
	}

	const out = parts.join('');
	await writeFile(join(outDir, 'cascade.css'), out, 'utf8');

	/* keep the stylesheet cache-busting token in sync with the built bytes */
	const hash = createHash('sha1').update(out).digest('hex').slice(0, 8);
	const headerPath = join(root, 'ucode', 'template', 'themes', 'beautiful', 'header.ut');
	const header = await readFile(headerPath, 'utf8');
	const patched = header.replace(/const assetver = '[^']*';/, `const assetver = '${hash}';`);

	if (patched !== header)
		await writeFile(headerPath, patched, 'utf8');

	console.log(`${green('✓')} assetver     ${dim(hash)}`);
	console.log(`${green('✓')} cascade.css  ${dim(`${(out.length / 1024).toFixed(1)} KiB, ${lines} lines, ${sources.length} sources`)}`);
}

async function buildMobile() {
	const css = await readFile(join(srcDir, 'mobile.css'), 'utf8');
	await writeFile(join(outDir, 'mobile.css'), css, 'utf8');
	console.log(`${green('✓')} mobile.css   ${dim(`${(css.length / 1024).toFixed(1)} KiB`)}`);
}

await mkdir(outDir, { recursive: true });
await buildCascade();
await buildMobile();
