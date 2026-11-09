'use strict';
'require baseclass';
'require ui';

/**
 * luci-theme-beautiful — navigation controller.
 *
 * Renders the sidebar tree, the breadcrumb, the page tab menu and wires
 * the shell interactions (colour scheme toggle, off-canvas sidebar,
 * collapsible navigation groups).
 */

const STORE_KEY = 'luci-theme-beautiful:nav';
const MODE_KEY = 'luci-theme-beautiful:mode';

const ICONS = {
	overview: '<circle cx="12" cy="12" r="9"/><path d="M12 12l4.5-4.5"/><path d="M3.5 16.5a9 9 0 0 1 17 0"/>',
	status: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 1.5"/>',
	firewall: '<path d="M12 3.5 19.5 6v5.5c0 4.6-3.2 7.2-7.5 9-4.3-1.8-7.5-4.4-7.5-9V6Z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
	routes: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M9 19h7.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H15"/>',
	routing: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M9 19h7.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H15"/>',
	dhcp: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
	dns: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
	hosts: '<rect x="3" y="4.5" width="18" height="11" rx="2"/><path d="M8 20h8M12 15.5V20"/>',
	leases: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
	interfaces: '<rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M7 9V6M12 9V6M17 9V6"/>',
	network: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',
	switch: '<rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M7 9V6M12 9V6M17 9V6"/>',
	wireless: '<path d="M4.5 11.5a11 11 0 0 1 15 0"/><path d="M8 15.2a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1"/>',
	diagnostics: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-3"/><circle cx="20" cy="11" r="2"/>',
	nftables: '<path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-2 1-3 2-4 1 2 2 2 2 2s-1-3 2-8Z"/>',
	realtime: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-7"/>',
	bandwidth: '<path d="M4 20V10M10 20V4M16 20v-7M22 20v-4"/>',
	connections: '<circle cx="18" cy="5" r="2.75"/><circle cx="6" cy="12" r="2.75"/><circle cx="18" cy="19" r="2.75"/><path d="m8.6 13.4 6.9 4.2M15.5 6.4l-6.9 4.2"/>',
	processes: '<path d="M22 12h-4l-3 8-6-16-3 8H2"/>',
	system: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
	admin: '<circle cx="8" cy="15" r="3.75"/><path d="m10.8 12.2 7.7-7.7"/><path d="m16.5 3.5 3 3"/><path d="m14.5 5.5 3 3"/>',
	software: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M12 12l8-4.5M12 12v9M12 12 4 7.5"/>',
	packages: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M12 12l8-4.5M12 12v9M12 12 4 7.5"/>',
	startup: '<path d="M12 3v9"/><path d="M6.4 6.4a8 8 0 1 0 11.2 0"/>',
	reboot: '<path d="M12 3v9"/><path d="M6.4 6.4a8 8 0 1 0 11.2 0"/>',
	cron: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.75"/>',
	leds: '<path d="M9.5 18h5"/><path d="M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4.9 1 .9 1.7V17h5.2v-1.4c0-.7.3-1.3.9-1.7A6 6 0 0 0 12 3Z"/>',
	logs: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
	mount: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 12h18"/><path d="M7 16h.01"/>',
	storage: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
	backup: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
	flash: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/>',
	time: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.75"/>',
	language: '<path d="M4 6h9M8.5 4v2c0 4-2 7-4.5 8"/><path d="M6 12c1.5 4 4.5 6 8 7"/><path d="m13 20 4.5-10L22 20"/><path d="M15 16h5"/>',
	theme: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',

	/* routing table (the JSON variant shares the same glyph) */
	routesj: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M9 19h7.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H15"/>',
	iptables: '<path d="M4 6h16M4 11h16M4 16h10"/><path d="M17.5 18.5 21 15"/>',

	/* wireless survey */
	channel_analysis: '<path d="M4 20V13M9.3 20V8M14.6 20v-9M20 20V4"/>',

	/* package manager / software */
	'package-manager': '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',

	crontab: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10.5h18"/><path d="M12 14v2.4l1.6 1"/>',

	attendedsysupgrade: '<path d="M6.5 18a4.5 4.5 0 0 1-.4-9 6 6 0 0 1 11.3-1.4A3.8 3.8 0 0 1 18 18"/><path d="M12 21v-7"/><path d="m9 17 3-3 3 3"/>',
	'argon-config': '<path d="M12 3.2a8.8 8.8 0 1 0 0 17.6h1.6a2.4 2.4 0 0 0 0-4.8h-.7a1.9 1.9 0 0 1 0-3.8h4.4a3.2 3.2 0 0 0 3.2-3.2A8.2 8.2 0 0 0 12 3.2Z"/><circle cx="8.2" cy="9.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="8.2" cy="14" r="1.15" fill="currentColor" stroke="none"/>',

	ttyd: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="m7.5 9.5 3 3-3 3"/><path d="M13 15.5h3.5"/>',
	openclash: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',
	mihomo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',
	vpn: '<rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',

	/* generic module — used when a plugin has no dedicated glyph */
	_default: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>'
};

/**
 * Resolve a glyph for a menu node. Plugins are named freely, so fall back
 * through a few normalisations before giving up on the generic module mark.
 */
function iconFor(name) {
	if (!name)
		return ICONS._default;

	if (ICONS[name])
		return ICONS[name];

	const trimmed = String(name).replace(/j$/, '');

	if (ICONS[trimmed])
		return ICONS[trimmed];

	const head = String(name).split(/[-_.]/)[0];

	if (ICONS[head])
		return ICONS[head];

	return ICONS._default;
}

function navIcon(name) {
	const span = E('span', { 'class': 'nav-icon', 'aria-hidden': 'true' });
	span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
		stroke-linecap="round" stroke-linejoin="round" focusable="false">${iconFor(name)}</svg>`;
	return span;
}

function loadState() {
	try {
		return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') ?? {};
	}
	catch (e) {
		return {};
	}
}

function saveState(state) {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(state));
	}
	catch (e) { /* private mode — ignore */ }
}

return baseclass.extend({
	__init__() {
		this.state = loadState();

		ui.menu.load().then((tree) => {
			this.tree = tree;

			/* never let a menu rendering problem break the page itself */
			try { this.render(tree); }
			catch (e) { if (window.console) console.warn('menu-beautiful:', e); }

			try { this.initShell(); }
			catch (e) { if (window.console) console.warn('menu-beautiful:', e); }
		}).catch((e) => {
			if (window.console) console.warn('menu-beautiful: menu load failed', e);
		});
	},

	resolvePath(tree) {
		const dispatch = L.env.dispatchpath ?? [];
		const request = L.env.requestpath ?? [];
		const modes = ui.menu.getChildren(tree);
		let mode = null;

		for (let i = 0; i < modes.length; i++) {
			if (request.length ? modes[i].name === request[0] : i === 0) {
				mode = modes[i];
				break;
			}
		}

		mode ??= modes[0] ?? null;

		const groups = mode ? ui.menu.getChildren(mode) : [];
		let group = null, item = null;

		if (dispatch.length > 1)
			group = groups.find((g) => g.name === dispatch[1]) ?? null;

		if (group && group.children && dispatch.length > 2)
			item = ui.menu.getChildren(group).find((i) => i.name === dispatch[2]) ?? null;

		return { modes, mode, groups, group, item };
	},

	render(tree) {
		const path = this.resolvePath(tree);

		this.renderModeMenu(path.modes, path.mode);
		this.renderSidebar(path.groups, path.group, path.item, path.mode?.name ?? '');
		this.renderBreadcrumb(path);

		/*
		 * Pass the dispatch *segments*, never a rendered URL: L.url() runs every
		 * part through a sanitiser that silently drops anything starting with a
		 * slash, so feeding it an absolute URL keeps only the leaf name and
		 * yields /cgi-bin/luci/<leaf> — which is not a registered node.
		 *
		 * Segments are passed as separate arguments: array support in L.path()
		 * only landed in LuCI 24.10, on 21.02/23.05 an array is stringified to
		 * "a,b,c" (commas pass the sanitiser) and produces a bogus node name.
		 */
		if (path.item)
			this.renderTabMenu(path.item, [ path.mode.name, path.group.name, path.item.name ]);
	},

	/* ---------------------------------------------------------------- */
	renderModeMenu(modes, active) {
		const ul = document.querySelector('#modemenu');

		if (!ul)
			return;

		modes.forEach((mode) => {
			ul.appendChild(E('li', { 'class': (mode === active) ? 'active' : '' }, [
				E('a', { 'href': L.url(mode.name) }, [ _(mode.title) ])
			]));
		});

		if (ul.children.length > 1)
			ul.style.display = '';
	},

	/* ---------------------------------------------------------------- */
	renderSidebar(groups, activeGroup, activeItem, modeName) {
		const ul = document.querySelector('#topmenu');

		if (!ul)
			return;

		groups.forEach((group) => {
			const children = ui.menu.getChildren(group);
			const groupLi = E('li', { 'class': 'nav-group', 'data-group': group.name });
			const collapsed = this.state[group.name] === false;

			if (collapsed && group !== activeGroup)
				groupLi.setAttribute('data-collapsed', 'true');

			if (children.length === 0) {
				groupLi.appendChild(E('ul', { 'class': 'nav-items' }, [
					E('li', {}, E('a', {
						'class': 'nav-link' + ((group === activeGroup) ? ' active' : ''),
						/* the mode segment is mandatory: /cgi-bin/luci/<group> is not a node */
						'href': L.url(modeName, group.name)
					}, [ navIcon(group.name), E('span', { 'class': 'nav-text' }, [ _(group.title) ]) ]))
				]));
				ul.appendChild(groupLi);
				return;
			}

			const label = E('button', {
				'class': 'nav-group-label',
				'type': 'button',
				'aria-expanded': collapsed && group !== activeGroup ? 'false' : 'true'
			}, [
				E('span', { 'class': 'nav-group-text' }, [ _(group.title) ]),
				(() => {
					const chev = E('span', { 'class': 'nav-group-chevron', 'aria-hidden': 'true' });
					chev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';
					return chev;
				})()
			]);

			const items = E('ul', { 'class': 'nav-items' });

			children.forEach((child) => {
				const active = (child === activeItem) ||
					(activeItem == null && activeGroup === group && children.length === 1);
				const link = E('a', {
					'class': 'nav-link' + (active ? ' active' : ''),
					'href': L.url(modeName, group.name, child.name)
				}, [ navIcon(child.name), E('span', { 'class': 'nav-text' }, [ _(child.title) ]) ]);

				if (active)
					link.setAttribute('aria-current', 'page');

				items.appendChild(E('li', {}, link));
			});

			label.addEventListener('click', () => {
				const isCollapsed = groupLi.getAttribute('data-collapsed') === 'true';

				if (isCollapsed) {
					groupLi.removeAttribute('data-collapsed');
					label.setAttribute('aria-expanded', 'true');
					this.state[group.name] = true;
				}
				else {
					groupLi.setAttribute('data-collapsed', 'true');
					label.setAttribute('aria-expanded', 'false');
					this.state[group.name] = false;
				}

				saveState(this.state);
			});

			groupLi.appendChild(label);
			groupLi.appendChild(items);
			ul.appendChild(groupLi);
		});

		ul.style.display = '';

		const active = ul.querySelector('.nav-link.active');
		if (active && active.scrollIntoView)
			try { active.scrollIntoView({ block: 'nearest' }); } catch (e) {}
	},

	/* ---------------------------------------------------------------- */
	renderBreadcrumb(path) {
		const ol = document.querySelector('#breadcrumb');

		if (!ol || !path.mode)
			return;

		const crumbs = [];
		const heading = (document.querySelector('.topbar-title')?.textContent ?? '').trim();

		if (path.modes.length > 1)
			crumbs.push(E('li', {}, E('a', { 'href': L.url(path.mode.name) }, [ _(path.mode.title) ])));

		if (path.group) {
			/* the ancestor crumb leads to the group root, not to the page we are on */
			const groupUrl = L.url(path.mode.name, path.group.name);

			crumbs.push(E('li', {}, E('a', { 'href': groupUrl }, [ _(path.group.title) ])));
		}

		/* the trail lists ancestors only: the current page is already the heading */
		if (path.item) {
			const itemTitle = _(path.item.title);

			if (!heading || itemTitle.trim() !== heading)
				crumbs.push(E('li', { 'class': 'active' }, E('span', {}, [ itemTitle ])));
		}

		/* LuCI reuses the group title for its default page — never repeat the heading */
		while (heading && crumbs.length && crumbs[crumbs.length - 1].textContent.trim() === heading)
			crumbs.pop();

		crumbs.forEach((li) => ol.appendChild(li));
	},

	/* ---------------------------------------------------------------- */
	renderTabMenu(node, base, level) {
		const container = document.querySelector('#tabmenu');

		if (!container)
			return E([]);

		const segments = Array.isArray(base) ? base : [ base ];
		const dispatch = L.env.dispatchpath ?? [];
		const ul = E('ul', { 'class': 'tabs' });
		const children = ui.menu.getChildren(node);
		let activeNode = null;

		children.forEach((child) => {
			const isActive = (dispatch[segments.length] == child.name);
			const li = E('li', { 'class': (isActive ? 'active' : '') }, [
				E('a', { 'href': L.url(...segments, child.name) }, [ _(child.title) ])
			]);

			ul.appendChild(li);

			if (isActive)
				activeNode = child;
		});

		if (ul.children.length === 0)
			return E([]);

		container.appendChild(ul);
		container.style.display = '';

		if (activeNode)
			this.renderTabMenu(activeNode, segments.concat(activeNode.name), (level || 0) + 1);

		return ul;
	},

	/* ---------------------------------------------------------------- */
	initShell() {
		const body = document.body;
		const scrim = document.querySelector('#sidebar-scrim');
		const opener = document.querySelector('#sidebar-open');
		const closer = document.querySelector('#sidebar-close');

		const openSidebar = () => {
			body.classList.add('sidebar-open');
			if (scrim)
				scrim.hidden = false;
			if (opener)
				opener.setAttribute('aria-expanded', 'true');
		};

		const closeSidebar = () => {
			body.classList.remove('sidebar-open');
			if (scrim)
				scrim.hidden = true;
			if (opener)
				opener.setAttribute('aria-expanded', 'false');
		};

		opener?.addEventListener('click', openSidebar);
		closer?.addEventListener('click', closeSidebar);
		scrim?.addEventListener('click', closeSidebar);

		document.addEventListener('keydown', (ev) => {
			if (ev.key === 'Escape' && body.classList.contains('sidebar-open'))
				closeSidebar();
		});

		document.querySelector('#topmenu')?.addEventListener('click', (ev) => {
			if (ev.target.closest('a'))
				closeSidebar();
		});

		const toggle = document.querySelector('#theme-toggle');

		toggle?.addEventListener('click', () => {
			const root = document.documentElement;
			const dark = root.getAttribute('data-darkmode') === 'true';

			root.setAttribute('data-darkmode', dark ? 'false' : 'true');

			try {
				localStorage.setItem(MODE_KEY, dark ? 'light' : 'dark');
			}
			catch (e) { /* ignore */ }
		});
	}
});
