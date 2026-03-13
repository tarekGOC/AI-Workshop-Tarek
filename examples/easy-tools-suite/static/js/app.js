/* ======================================================================
   ToolSuite — Single-Page App (Vanilla JS)
   All 10 easy-level productivity tools in one polished UI.
   ====================================================================== */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const h = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') el.className = v;
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'innerHTML') el.innerHTML = v;
        else if (k === 'htmlFor') el.htmlFor = v;
        else el.setAttribute(k, v);
    }
    for (const c of children) {
        if (typeof c === 'string') el.appendChild(document.createTextNode(c));
        else if (c) el.appendChild(c);
    }
    return el;
};

async function api(url, opts = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...opts.headers },
        ...opts,
        body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
    });
    if (url.endsWith('/export')) return res;
    return res.json();
}

async function createTemplate(tool, refreshFn) {
    const data = await api(`/api/templates/${tool}`, { method: 'POST' });
    if (data?.error) {
        toast(data.error, 'error');
        return;
    }
    toast(data?.message || 'Template created', 'success');
    if (typeof refreshFn === 'function') {
        await refreshFn(data);
    }
}

function toast(msg, type = 'success') {
    const t = h('div', { className: `toast toast-${type}` }, msg);
    $('#toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function showModal(title, bodyEl, footerEl) {
    $('#modal-title').textContent = title;
    const body = $('#modal-body');
    body.innerHTML = '';
    body.appendChild(bodyEl);
    const footer = $('#modal-footer');
    footer.innerHTML = '';
    if (footerEl) footer.appendChild(footerEl);
    $('#modal-overlay').classList.remove('hidden');
}

function closeModal() {
    $('#modal-overlay').classList.add('hidden');
}

function confirmDialog(msg) {
    return new Promise(resolve => {
        const body = h('p', {}, msg);
        const footer = h('div', { className: 'flex gap-sm' },
            h('button', { className: 'btn btn-ghost', onClick: () => { closeModal(); resolve(false); } }, 'Cancel'),
            h('button', { className: 'btn btn-danger', onClick: () => { closeModal(); resolve(true); } }, 'Delete'),
        );
        showModal('Confirm', body, footer);
    });
}

function emptyState(icon, text) {
    return h('div', { className: 'empty-state' },
        h('div', { className: 'empty-icon' }, icon),
        h('p', {}, text),
    );
}

function debounce(fn, ms = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const container = () => $('#app-container');
let currentTool = 'home';

document.addEventListener('DOMContentLoaded', () => {
    $$('.nav-item').forEach(el => el.addEventListener('click', () => {
        switchTool(el.dataset.tool);
    }));
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
    $('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
    switchTool('home');
});

function switchTool(name) {
    currentTool = name;
    $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.tool === name));
    const titles = {
        home: 'AI Workshop',
        todos: 'Todo List', temperature: 'Temperature Converter', password: 'Password Strength Checker',
        expenses: 'Expense Tracker', quotes: 'Quote of the Day', contacts: 'Contact Book',
        notes: 'Markdown Notes', habits: 'Habit Tracker', units: 'Unit Converter', flashcards: 'Flashcards',
        architecture: 'Architecture',
    };
    $('#page-title').textContent = titles[name] || name;
    $('#sidebar').classList.remove('open');
    const renderers = {
        home: renderHome,
        todos: renderTodos, temperature: renderTemperature, password: renderPassword,
        expenses: renderExpenses, quotes: renderQuotes, contacts: renderContacts,
        notes: renderNotes, habits: renderHabits, units: renderUnits, flashcards: renderFlashcards,
        architecture: renderArchitecture,
    };
    container().innerHTML = '';
    renderers[name]();
}

// =========================================================================
// COMMAND PALETTE (Ctrl+K)
// =========================================================================
let cmdPaletteOpen = false;

function openCommandPalette() {
    if (cmdPaletteOpen) return;
    cmdPaletteOpen = true;
    const overlay = h('div', { className: 'cmd-overlay', id: 'cmd-overlay', onClick: (e) => { if (e.target === overlay) closeCmdPalette(); } },
        h('div', { className: 'cmd-palette' },
            h('div', { className: 'cmd-header' },
                h('span', { className: 'cmd-icon' }, '⌘'),
                h('input', { className: 'cmd-input', id: 'cmd-input', placeholder: 'Search across all tools…', autocomplete: 'off' }),
                h('kbd', { className: 'cmd-shortcut' }, 'ESC'),
            ),
            h('div', { className: 'cmd-results', id: 'cmd-results' },
                h('div', { className: 'cmd-section-label' }, 'Quick Navigation'),
                ...['todos', 'notes', 'expenses', 'contacts', 'habits', 'flashcards', 'temperature', 'password', 'units', 'quotes'].map(tool => {
                    const icons = { todos: '☑', notes: '📝', expenses: '💰', contacts: '👤', habits: '🎯', flashcards: '🃏', temperature: '🌡', password: '🔒', units: '📏', quotes: '💬' };
                    const titles = { todos: 'Todo List', notes: 'Markdown Notes', expenses: 'Expense Tracker', contacts: 'Contact Book', habits: 'Habit Tracker', flashcards: 'Flashcards', temperature: 'Temperature Converter', password: 'Password Checker', units: 'Unit Converter', quotes: 'Quote of the Day' };
                    return h('div', { className: 'cmd-result cmd-nav', 'data-tool': tool, onClick: () => { closeCmdPalette(); switchTool(tool); } },
                        h('span', { className: 'cmd-result-icon' }, icons[tool] || '→'),
                        h('span', { className: 'cmd-result-title' }, titles[tool]),
                        h('span', { className: 'cmd-result-badge' }, 'Navigate'),
                    );
                }),
            ),
        ),
    );
    document.body.appendChild(overlay);
    setTimeout(() => { const inp = $('#cmd-input'); if(inp) inp.focus(); }, 50);

    const input = $('#cmd-input');
    let searchTimer;
    input.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const q = input.value.trim();
        if (q.length < 2) {
            filterNavResults(q);
            return;
        }
        searchTimer = setTimeout(async () => {
            const data = await api(`/api/search?q=${encodeURIComponent(q)}`);
            renderCmdResults(data.results, q);
        }, 200);
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCmdPalette();
        if (e.key === 'Enter') {
            const first = $('#cmd-results .cmd-result.visible, #cmd-results .cmd-result.cmd-search-result');
            if (first) first.click();
        }
    });
}

function filterNavResults(q) {
    const results = document.querySelectorAll('#cmd-results .cmd-nav');
    const searchResults = document.querySelectorAll('#cmd-results .cmd-search-result');
    searchResults.forEach(el => el.remove());
    const label = document.querySelector('#cmd-results .cmd-section-label');
    if (label) label.style.display = '';
    results.forEach(el => {
        const tool = el.getAttribute('data-tool');
        if (!q || tool.includes(q.toLowerCase()) || el.textContent.toLowerCase().includes(q.toLowerCase())) {
            el.classList.add('visible');
            el.style.display = '';
        } else {
            el.classList.remove('visible');
            el.style.display = 'none';
        }
    });
}

function renderCmdResults(results, q) {
    const container = $('#cmd-results');
    // Hide nav items and label
    container.querySelectorAll('.cmd-nav').forEach(el => el.style.display = 'none');
    container.querySelectorAll('.cmd-section-label').forEach(el => el.style.display = 'none');
    container.querySelectorAll('.cmd-search-result, .cmd-search-label').forEach(el => el.remove());

    if (!results.length) {
        container.appendChild(h('div', { className: 'cmd-search-label' }, `No results for "${q}"`));
        return;
    }
    const typeIcons = { todo: '☑', note: '📝', contact: '👤', flashcard: '🃏', expense: '💰', habit: '🎯' };
    container.appendChild(h('div', { className: 'cmd-search-label' }, `${results.length} result${results.length > 1 ? 's' : ''}`));
    results.forEach(r => {
        container.appendChild(h('div', { className: 'cmd-result cmd-search-result', onClick: () => { closeCmdPalette(); switchTool(r.tool); } },
            h('span', { className: 'cmd-result-icon' }, typeIcons[r.type] || '→'),
            h('div', { style: 'flex:1;min-width:0' },
                h('div', { className: 'cmd-result-title' }, r.title),
                r.subtitle ? h('div', { className: 'cmd-result-sub' }, r.subtitle) : null,
            ),
            h('span', { className: 'cmd-result-badge' }, r.type),
        ));
    });
}

function closeCmdPalette() {
    const overlay = $('#cmd-overlay');
    if (overlay) overlay.remove();
    cmdPaletteOpen = false;
}

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
    }
});

// =========================================================================
// GUIDED TOUR
// =========================================================================
let tourActive = false;
let tourStep = 0;
const tourSteps = [
    { tool: 'home', title: 'Welcome to AI Workshop', text: 'This is the live dashboard. It shows real-time stats from all 10 tools — todos, expenses, habits, notes, and more.', target: '.dash-grid' },
    { tool: 'todos', title: '1. Todo List', text: 'Create, edit, search, and complete tasks with optimistic locking. Supports pagination and full audit logging.', target: '.search-bar' },
    { tool: 'temperature', title: '2. Temperature Converter', text: 'Convert between Celsius, Fahrenheit, and Kelvin — supports batch conversion with absolute-zero validation.', target: '.card' },
    { tool: 'password', title: '3. Password Strength Checker', text: 'Real-time scoring with feedback on length, character classes, keyboard patterns, and common password detection. Passwords are never stored.', target: '.card' },
    { tool: 'expenses', title: '4. Expense Tracker', text: 'Track spending with categories, monthly summaries with bar charts, date filtering, and CSV export.', target: '.tabs' },
    { tool: 'quotes', title: '5. Quote of the Day', text: 'A new quote every day from a curated collection. Favorite quotes, browse by date, and search by text or author.', target: '.card' },
    { tool: 'contacts', title: '6. Contact Book', text: 'Manage contacts with search, sorting, duplicate detection, CSV import/export, and email validation.', target: '.search-bar' },
    { tool: 'notes', title: '7. Markdown Notes', text: 'Write notes in Markdown with live preview, tagging, full-text search, and safe HTML rendering.', target: '#note-list, .card' },
    { tool: 'habits', title: '8. Habit Tracker', text: 'Build daily habits with streak tracking, calendar heatmap view, and completion rate statistics.', target: '.tabs' },
    { tool: 'units', title: '9. Unit Converter', text: 'Convert across 5 categories — length, weight, volume, area, and speed — with batch input and conversion history.', target: '.card' },
    { tool: 'flashcards', title: '10. Flashcard Study', text: 'Create decks, add cards, and study with a spaced-repetition system. Rate cards easy/medium/hard to schedule reviews.', target: '#deck-list, .card' },
    { tool: 'home', title: 'Command Palette', text: 'Press Ctrl+K (or ⌘K) anywhere to open the command palette — search across all tools instantly.', target: '#cmd-palette-btn' },
    { tool: 'home', title: 'Tour Complete!', text: 'You\'ve explored all 10 tools plus the dashboard and command palette. Every tool supports templates, CRUD operations, and audit logging. Start building!', target: '.dash-grid' },
];

function startTour() {
    tourActive = true;
    tourStep = 0;
    showTourStep();
}

function showTourStep() {
    removeTourOverlay();
    if (tourStep >= tourSteps.length) { endTour(); return; }
    const step = tourSteps[tourStep];
    if (currentTool !== step.tool) { switchTool(step.tool); }
    setTimeout(() => {
        const overlay = h('div', { className: 'tour-overlay', id: 'tour-overlay' },
            h('div', { className: 'tour-card' },
                h('div', { className: 'tour-step-badge' }, `Step ${tourStep + 1} / ${tourSteps.length}`),
                h('h3', { className: 'tour-title' }, step.title),
                h('p', { className: 'tour-text' }, step.text),
                h('div', { className: 'tour-actions' },
                    tourStep > 0 ? h('button', { className: 'btn btn-ghost btn-sm', onClick: () => { tourStep--; showTourStep(); } }, '← Back') : h('span'),
                    h('div', { className: 'flex gap-sm' },
                        h('button', { className: 'btn btn-ghost btn-sm', onClick: endTour }, 'Exit Tour'),
                        h('button', { className: 'btn btn-primary btn-sm', onClick: () => { tourStep++; showTourStep(); } }, tourStep < tourSteps.length - 1 ? 'Next →' : 'Finish'),
                    ),
                ),
            ),
        );
        document.body.appendChild(overlay);
        // Highlight target
        if (step.target) {
            const targets = step.target.split(', ');
            for (const sel of targets) {
                const el = document.querySelector(sel);
                if (el) { el.classList.add('tour-highlight'); break; }
            }
        }
    }, 300);
}

function removeTourOverlay() {
    const ov = $('#tour-overlay');
    if (ov) ov.remove();
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
}

function endTour() {
    tourActive = false;
    removeTourOverlay();
}

// =========================================================================
// HOME — LIVE DASHBOARD
// =========================================================================
async function renderHome() {
    const c = container();
    c.innerHTML = '';

    // Hero — compact version
    const hero = h('section', { className: 'home-hero home-hero-compact' },
        h('div', { className: 'home-orb home-orb-a' }),
        h('div', { className: 'home-orb home-orb-b' }),
        h('div', { className: 'home-grid' }),
        h('div', { className: 'home-hero-content' },
            h('h1', { className: 'home-title' }, 'AI Workshop'),
            h('p', { className: 'home-subtitle' }, 'Your unified productivity dashboard — live data across 10 tools.'),
            h('div', { className: 'home-actions' },
                h('button', { className: 'btn btn-primary', id: 'cmd-palette-btn', onClick: openCommandPalette }, '⌘K  Search Everything'),
                h('button', { className: 'btn btn-ghost', onClick: startTour }, '▶ Guided Tour'),
            ),
        ),
    );

    // Loading placeholder
    const dashContent = h('div', { className: 'dash-loading' }, 'Loading dashboard…');
    c.append(hero, dashContent);

    // Fetch live stats
    let data;
    try {
        data = await api('/api/dashboard');
    } catch (e) {
        dashContent.textContent = 'Could not load dashboard.';
        return;
    }
    dashContent.remove();

    // Stat cards
    const statCards = [
        { label: 'Open Todos', value: data.todos.open, total: data.todos.total, icon: '☑', color: 'var(--primary)', tool: 'todos' },
        { label: 'Month Expenses', value: `$${data.expenses.month_total}`, total: `${data.expenses.count} total`, icon: '💰', color: 'var(--warning)', tool: 'expenses' },
        { label: 'Habits Today', value: `${data.habits.done_today}/${data.habits.total}`, icon: '🎯', color: 'var(--success)', tool: 'habits' },
        { label: 'Notes', value: data.notes.count, icon: '📝', color: '#a78bfa', tool: 'notes' },
        { label: 'Contacts', value: data.contacts.count, icon: '👤', color: '#60a5fa', tool: 'contacts' },
        { label: 'Flashcards Due', value: data.flashcards.due, total: `${data.flashcards.cards} cards, ${data.flashcards.mastered} mastered`, icon: '🃏', color: '#f472b6', tool: 'flashcards' },
        { label: 'Conversions Today', value: data.conversions.today, icon: '🔄', color: '#34d399', tool: 'units' },
    ];

    const dashGrid = h('div', { className: 'dash-grid' },
        ...statCards.map(s => h('div', { className: 'dash-card', onClick: () => switchTool(s.tool), style: `--card-accent:${s.color}` },
            h('div', { className: 'dash-card-icon' }, s.icon),
            h('div', { className: 'dash-card-body' },
                h('div', { className: 'dash-card-value' }, String(s.value)),
                h('div', { className: 'dash-card-label' }, s.label),
                s.total ? h('div', { className: 'dash-card-sub' }, typeof s.total === 'number' ? `${s.total} total` : s.total) : null,
            ),
        )),
    );

    // Quote of the Day card
    const quoteCard = data.quote ? h('div', { className: 'dash-quote' },
        h('div', { className: 'dash-quote-icon' }, '💬'),
        h('div', {},
            h('div', { className: 'dash-quote-text' }, `"${data.quote.text}"`),
            h('div', { className: 'dash-quote-author' }, `— ${data.quote.author}`),
        ),
    ) : null;

    // Recent Activity feed
    const activitySection = data.recent_activity.length > 0 ? h('div', { className: 'dash-section' },
        h('h2', { className: 'dash-section-title' }, 'Recent Activity'),
        h('div', { className: 'dash-activity' },
            ...data.recent_activity.map(a => h('div', { className: 'dash-activity-item' },
                h('span', { className: 'dash-activity-dot' }),
                h('span', { className: 'dash-activity-type' }, a.entity_type),
                h('span', { className: 'dash-activity-action' }, a.action),
                a.details ? h('span', { className: 'dash-activity-detail' }, a.details) : null,
                h('span', { className: 'dash-activity-time' }, new Date(a.created_at).toLocaleString()),
            )),
        ),
    ) : null;

    // Quick actions
    const quickActions = h('div', { className: 'dash-section' },
        h('h2', { className: 'dash-section-title' }, 'Quick Actions'),
        h('div', { className: 'dash-actions' },
            h('button', { className: 'dash-action-btn', onClick: () => { switchTool('todos'); setTimeout(() => todoAddModal && todoAddModal(), 200); } },
                h('span', {}, '☑'), h('span', {}, 'New Todo')),
            h('button', { className: 'dash-action-btn', onClick: () => { switchTool('notes'); } },
                h('span', {}, '📝'), h('span', {}, 'New Note')),
            h('button', { className: 'dash-action-btn', onClick: () => { switchTool('expenses'); } },
                h('span', {}, '💰'), h('span', {}, 'Add Expense')),
            h('button', { className: 'dash-action-btn', onClick: () => { switchTool('habits'); } },
                h('span', {}, '🎯'), h('span', {}, 'Log Habit')),
            h('button', { className: 'dash-action-btn', onClick: openCommandPalette },
                h('span', {}, '⌘'), h('span', {}, 'Search All')),
        ),
    );

    // Flashcard mastery progress
    const masteryPct = data.flashcards.cards > 0 ? Math.round(data.flashcards.mastered / data.flashcards.cards * 100) : 0;
    const flashcardProgress = data.flashcards.cards > 0 ? h('div', { className: 'dash-section' },
        h('h2', { className: 'dash-section-title' }, 'Flashcard Mastery'),
        h('div', { className: 'dash-progress-wrap' },
            h('div', { className: 'dash-progress-bar' },
                h('div', { className: 'dash-progress-fill', style: `width:${masteryPct}%` }),
            ),
            h('span', { className: 'dash-progress-label' }, `${masteryPct}% mastered (${data.flashcards.mastered}/${data.flashcards.cards})`),
        ),
    ) : null;

    c.append(dashGrid);
    if (quoteCard) c.appendChild(quoteCard);
    c.append(quickActions);
    if (flashcardProgress) c.appendChild(flashcardProgress);
    if (activitySection) c.appendChild(activitySection);
}

// =========================================================================
// 1. TODO LIST
// =========================================================================
async function renderTodos() {
    const c = container();
    c.innerHTML = '';
    const searchRow = h('div', { className: 'search-bar' },
        h('input', { className: 'form-control', placeholder: 'Search todos...', id: 'todo-search' }),
        h('button', { className: 'btn btn-ghost', onClick: () => createTemplate('todos', () => load($('#todo-search').value)) }, 'Use Template'),
        h('button', { className: 'btn btn-primary', onClick: () => todoAddModal() }, '+ New Todo'),
    );
    const listEl = h('div', { id: 'todo-list' });
    c.append(searchRow, listEl);

    const load = async (q = '', page = 1) => {
        const data = await api(`/api/todos?q=${encodeURIComponent(q)}&page=${page}`);
        listEl.innerHTML = '';
        if (!data.items.length) { listEl.appendChild(emptyState('☑', 'No todos yet. Create one!')); return; }
        data.items.forEach(t => {
            const row = h('div', { className: 'card flex items-center gap-md' },
                h('div', {
                    className: `checkbox-custom ${t.completed ? 'checked' : ''}`,
                    innerHTML: t.completed ? '✓' : '',
                    onClick: async () => {
                        await api(`/api/todos/${t.id}`, { method: 'PUT', body: { completed: !t.completed, version: t.version } });
                        load($('#todo-search').value);
                    }
                }),
                h('div', { className: 'flex-col', style: 'flex:1;min-width:0' },
                    h('div', { className: `truncate ${t.completed ? 'todo-done' : ''}`, style: 'font-weight:600' }, t.title),
                    t.description ? h('div', { className: 'text-sm text-secondary truncate mt-1' }, t.description) : null,
                ),
                h('div', { className: 'text-sm text-secondary', style: 'white-space:nowrap' }, new Date(t.created_at).toLocaleDateString()),
                h('button', { className: 'btn-icon', title: 'Edit', onClick: () => todoAddModal(t) }, '✎'),
                h('button', { className: 'btn-icon', title: 'Delete', onClick: async () => {
                    if (await confirmDialog('Delete this todo?')) {
                        await api(`/api/todos/${t.id}`, { method: 'DELETE' });
                        toast('Todo deleted');
                        load($('#todo-search').value);
                    }
                } }, '🗑'),
            );
            listEl.appendChild(row);
        });
        if (data.total > data.per_page) {
            const pg = h('div', { className: 'pagination' });
            const pages = Math.ceil(data.total / data.per_page);
            for (let i = 1; i <= pages; i++) {
                pg.appendChild(h('button', {
                    className: `btn btn-sm ${i === data.page ? 'btn-primary' : 'btn-ghost'}`,
                    onClick: async () => { load(q, i); }
                }, String(i)));
            }
            listEl.appendChild(pg);
        }
    };
    load();
    $('#todo-search').addEventListener('input', debounce(e => load(e.target.value)));
}

function todoAddModal(existing = null) {
    const body = h('div', {},
        h('div', { className: 'form-group' },
            h('label', { htmlFor: 'todo-title' }, 'Title'),
            h('input', { className: 'form-control', id: 'todo-title', maxLength: '100', value: existing?.title || '' }),
        ),
        h('div', { className: 'form-group' },
            h('label', { htmlFor: 'todo-desc' }, 'Description'),
            h('textarea', { className: 'form-control', id: 'todo-desc', maxLength: '500' }, existing?.description || ''),
        ),
    );
    const footer = h('div', { className: 'flex gap-sm' },
        h('button', { className: 'btn btn-ghost', onClick: closeModal }, 'Cancel'),
        h('button', { className: 'btn btn-primary', onClick: async () => {
            const title = $('#todo-title').value.trim();
            if (!title) { toast('Title is required', 'error'); return; }
            const payload = { title, description: $('#todo-desc').value.trim() };
            if (existing) {
                payload.version = existing.version;
                await api(`/api/todos/${existing.id}`, { method: 'PUT', body: payload });
                toast('Todo updated');
            } else {
                await api('/api/todos', { method: 'POST', body: payload });
                toast('Todo created');
            }
            closeModal();
            renderTodos();
        } }, existing ? 'Update' : 'Create'),
    );
    showModal(existing ? 'Edit Todo' : 'New Todo', body, footer);
    setTimeout(() => $('#todo-title').focus(), 100);
}

// =========================================================================
// 2. TEMPERATURE CONVERTER
// =========================================================================
async function renderTemperature() {
    const c = container();
    c.innerHTML = '';
    const scales = ['C', 'F', 'K'];
    const scaleNames = { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' };

    const card = h('div', { className: 'card' },
        h('div', { className: 'card-header' },
            h('h2', {}, 'Convert Temperature'),
            h('button', {
                className: 'btn btn-ghost btn-sm',
                onClick: () => createTemplate('temperature', () => loadHistory()),
            }, 'Use Template')
        ),
        h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
                h('label', {}, 'Value(s)'),
                h('input', { className: 'form-control', id: 'temp-input', placeholder: 'e.g. 100 or 32, 212, 0' }),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'From'),
                h('select', { className: 'form-control', id: 'temp-from' }, ...scales.map(s => h('option', { value: s }, scaleNames[s]))),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'To'),
                h('select', { className: 'form-control', id: 'temp-to' }, ...scales.map((s, i) => h('option', { value: s, ...(i === 1 ? { selected: 'selected' } : {}) }, scaleNames[s]))),
            ),
        ),
        h('button', { className: 'btn btn-primary', id: 'temp-convert' }, 'Convert'),
        h('div', { id: 'temp-results', className: 'mt-2' }),
    );

    const historyCard = h('div', { className: 'card mt-2' },
        h('div', { className: 'card-header' },
            h('h2', {}, 'History'),
            h('button', { className: 'btn btn-sm btn-ghost', onClick: async () => { await api('/api/temperature/history', { method: 'DELETE' }); loadHistory(); } }, 'Clear'),
        ),
        h('div', { id: 'temp-history' }),
    );

    c.append(card, historyCard);

    $('#temp-convert').addEventListener('click', async () => {
        const raw = $('#temp-input').value.trim();
        if (!raw) { toast('Enter a value', 'error'); return; }
        const values = raw.split(',').map(v => v.trim()).filter(Boolean);
        const data = await api('/api/temperature/convert', {
            method: 'POST',
            body: { values, source: $('#temp-from').value, target: $('#temp-to').value },
        });
        const results = $('#temp-results');
        results.innerHTML = '';
        if (data.error) { toast(data.error, 'error'); return; }
        const table = h('table', {},
            h('thead', {}, h('tr', {}, h('th', {}, 'Input'), h('th', {}, 'Result'), h('th', {}, 'Status'))),
            h('tbody', {}, ...data.results.map(r =>
                h('tr', {},
                    h('td', {}, `${r.input}° ${r.source || ''}`),
                    h('td', { style: 'font-weight:600' }, r.error ? '—' : `${r.result}° ${r.target || ''}`),
                    h('td', {}, r.error ? h('span', { className: 'badge badge-danger' }, r.error) : h('span', { className: 'badge badge-success' }, 'OK')),
                )
            )),
        );
        results.appendChild(table);
        loadHistory();
    });

    async function loadHistory() {
        const data = await api('/api/temperature/history');
        const el = $('#temp-history');
        el.innerHTML = '';
        if (!data.items.length) { el.appendChild(emptyState('🌡', 'No conversions yet')); return; }
        const table = h('table', {},
            h('thead', {}, h('tr', {}, h('th', {}, 'From'), h('th', {}, 'To'), h('th', {}, 'Date'))),
            h('tbody', {}, ...data.items.slice(0, 20).map(r =>
                h('tr', {},
                    h('td', {}, `${r.source_value}° ${r.source_scale}`),
                    h('td', {}, `${r.result_value}° ${r.target_scale}`),
                    h('td', { className: 'text-sm text-secondary' }, new Date(r.created_at).toLocaleString()),
                )
            )),
        );
        el.appendChild(table);
    }
    loadHistory();
}

// =========================================================================
// 3. PASSWORD STRENGTH CHECKER
// =========================================================================
function renderPassword() {
    const c = container();
    c.innerHTML = '';
    const card = h('div', { className: 'card', style: 'max-width:600px' },
        h('div', { className: 'card-header' },
            h('h2', {}, 'Check Password Strength'),
            h('button', {
                className: 'btn btn-ghost btn-sm',
                onClick: async () => {
                    const tpl = await api('/api/templates/password', { method: 'POST' });
                    if (tpl?.sample_password) {
                        $('#pw-input').value = tpl.sample_password;
                        $('#pw-input').dispatchEvent(new Event('input'));
                        toast('Password template loaded');
                    }
                }
            }, 'Use Template')
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Password'),
            h('input', { className: 'form-control', id: 'pw-input', type: 'password', placeholder: 'Type a password...' }),
        ),
        h('div', { className: 'flex items-center gap-sm mb-1' },
            h('label', { className: 'text-sm text-secondary', style: 'cursor:pointer' },
                h('input', { type: 'checkbox', id: 'pw-show', style: 'margin-right:.3rem' }), 'Show password'),
        ),
        h('div', { className: 'strength-bar' }, h('div', { className: 'strength-fill', id: 'pw-bar' })),
        h('div', { id: 'pw-level', className: 'text-sm mb-1', style: 'font-weight:600' }),
        h('div', { id: 'pw-score', className: 'text-sm text-secondary mb-2' }),
        h('div', { id: 'pw-criteria' }),
        h('div', { id: 'pw-feedback', className: 'mt-2' }),
        h('div', { id: 'pw-warnings', className: 'mt-1' }),
    );
    c.appendChild(card);

    const colors = { weak: '#ef4444', moderate: '#f59e0b', strong: '#3b82f6', 'very strong': '#10b981' };

    const check = debounce(async () => {
        const pw = $('#pw-input').value;
        if (!pw) {
            $('#pw-bar').style.width = '0%';
            $('#pw-level').textContent = '';
            $('#pw-score').textContent = '';
            $('#pw-criteria').innerHTML = '';
            $('#pw-feedback').innerHTML = '';
            $('#pw-warnings').innerHTML = '';
            return;
        }
        const data = await api('/api/password/check', { method: 'POST', body: { password: pw } });
        const bar = $('#pw-bar');
        bar.style.width = data.score + '%';
        bar.style.background = colors[data.level] || '#6b7280';
        $('#pw-level').textContent = data.level.charAt(0).toUpperCase() + data.level.slice(1);
        $('#pw-level').style.color = colors[data.level];
        $('#pw-score').textContent = `Score: ${data.score}/100`;

        const criteria = $('#pw-criteria');
        criteria.innerHTML = '';
        const cl = h('ul', { className: 'criteria-list' });
        for (const [k, v] of Object.entries(data.criteria)) {
            cl.appendChild(h('li', { className: `criteria-item ${v ? 'met' : ''}` }, `${v ? '✓' : '✗'} ${k}`));
        }
        criteria.appendChild(cl);

        const fb = $('#pw-feedback');
        fb.innerHTML = '';
        if (data.feedback.length) {
            fb.appendChild(h('div', { className: 'text-sm', style: 'font-weight:600;margin-bottom:.3rem' }, 'Suggestions:'));
            data.feedback.forEach(f => fb.appendChild(h('div', { className: 'text-sm text-secondary' }, `• ${f}`)));
        }

        const warn = $('#pw-warnings');
        warn.innerHTML = '';
        if (data.warnings.length) {
            data.warnings.forEach(w => warn.appendChild(h('div', { className: 'text-sm', style: 'color:var(--danger)' }, `⚠ ${w}`)));
        }
    }, 100);

    $('#pw-input').addEventListener('input', check);
    $('#pw-show').addEventListener('change', e => {
        $('#pw-input').type = e.target.checked ? 'text' : 'password';
    });
}

// =========================================================================
// 4. EXPENSE TRACKER
// =========================================================================
let expenseTab = 'list';
let expenseCategories = [];

async function renderExpenses() {
    const c = container();
    c.innerHTML = '';
    const tabs = h('div', { className: 'tabs' },
        h('div', { className: `tab ${expenseTab === 'list' ? 'active' : ''}`, onClick: () => { expenseTab = 'list'; renderExpenses(); } }, 'Expenses'),
        h('div', { className: `tab ${expenseTab === 'summary' ? 'active' : ''}`, onClick: () => { expenseTab = 'summary'; renderExpenses(); } }, 'Summary'),
    );
    c.appendChild(tabs);

    if (expenseTab === 'summary') return renderExpenseSummary(c);

    const cats = await api('/api/expenses/categories');
    expenseCategories = cats.items;
    const toolbar = h('div', { className: 'flex items-center gap-sm flex-wrap mb-2' },
        h('input', { type: 'date', className: 'form-control', id: 'exp-start', style: 'width:160px' }),
        h('span', { className: 'text-sm text-secondary' }, 'to'),
        h('input', { type: 'date', className: 'form-control', id: 'exp-end', style: 'width:160px' }),
        h('select', { className: 'form-control', id: 'exp-cat-filter', style: 'width:160px' },
            h('option', { value: '' }, 'All Categories'),
            ...cats.items.map(ct => h('option', { value: ct.id }, ct.name)),
        ),
        h('button', { className: 'btn btn-ghost btn-sm', onClick: loadExpenses }, 'Filter'),
        h('div', { style: 'flex:1' }),
        h('button', { className: 'btn btn-ghost btn-sm', onClick: async () => {
            const res = await api('/api/expenses/export');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = h('a', { href: url, download: 'expenses.csv' });
            a.click(); URL.revokeObjectURL(url);
        } }, '↓ Export CSV'),
        h('button', { className: 'btn btn-ghost btn-sm', onClick: () => createTemplate('expenses', () => loadExpenses()) }, 'Use Template'),
        h('button', { className: 'btn btn-primary btn-sm', onClick: () => expenseModal(cats.items) }, '+ Add Expense'),
    );
    const listEl = h('div', { id: 'expense-list' });
    c.append(toolbar, listEl);
    loadExpenses();
}

async function loadExpenses() {
    const start = $('#exp-start')?.value || '';
    const end = $('#exp-end')?.value || '';
    const cat = $('#exp-cat-filter')?.value || '';
    const data = await api(`/api/expenses?start=${start}&end=${end}&category=${cat}`);
    const el = $('#expense-list');
    el.innerHTML = '';
    if (!data.items.length) { el.appendChild(emptyState('💰', 'No expenses found')); return; }

    const total = data.items.reduce((s, i) => s + i.amount, 0);
    el.appendChild(h('div', { className: 'flex justify-between items-center mb-1' },
        h('span', { className: 'text-sm text-secondary' }, `${data.total} expense(s)`),
        h('span', { style: 'font-weight:700;font-size:1.1rem' }, `Total: $${total.toFixed(2)}`),
    ));

    const table = h('table', {},
        h('thead', {}, h('tr', {},
            h('th', {}, 'Date'), h('th', {}, 'Category'), h('th', {}, 'Description'),
            h('th', { style: 'text-align:right' }, 'Amount'), h('th', {}, ''),
        )),
        h('tbody', {}, ...data.items.map(e =>
            h('tr', {},
                h('td', {}, e.expense_date),
                h('td', {}, h('span', { className: 'badge badge-info' }, e.category_name)),
                h('td', { className: 'text-secondary' }, e.description || '—'),
                h('td', { style: 'text-align:right;font-weight:600' }, `${e.currency} ${e.amount.toFixed(2)}`),
                h('td', {},
                    h('button', { className: 'btn-icon', title: 'Edit', onClick: () => expenseModal(expenseCategories, e) }, '✎'),
                    h('button', { className: 'btn-icon', title: 'Delete', onClick: async () => {
                        if (await confirmDialog('Delete this expense?')) {
                            await api(`/api/expenses/${e.id}`, { method: 'DELETE' });
                            toast('Expense deleted'); renderExpenses();
                        }
                    } }, '🗑'),
                ),
            )
        )),
    );
    el.appendChild(h('div', { className: 'table-wrap' }, table));
}

function expenseModal(categories, existing = null) {
    const today = new Date().toISOString().slice(0, 10);
    const body = h('div', {},
        h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
                h('label', {}, 'Amount'),
                h('input', { className: 'form-control', id: 'exp-amount', type: 'number', step: '0.01', min: '0.01', value: existing?.amount || '' }),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'Currency'),
                h('select', { className: 'form-control', id: 'exp-currency' },
                    ...['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].map(cur =>
                        h('option', { value: cur, ...(cur === (existing?.currency || 'USD') ? { selected: 'selected' } : {}) }, cur)
                    ),
                ),
            ),
        ),
        h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
                h('label', {}, 'Category'),
                h('select', { className: 'form-control', id: 'exp-category' },
                    ...categories.map(ct => h('option', { value: ct.id, ...(ct.id === existing?.category_id ? { selected: 'selected' } : {}) }, ct.name)),
                ),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'Date'),
                h('input', { className: 'form-control', id: 'exp-date', type: 'date', value: existing?.expense_date || today }),
            ),
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Description'),
            h('input', { className: 'form-control', id: 'exp-desc', maxLength: '200', value: existing?.description || '' }),
        ),
    );
    const footer = h('div', { className: 'flex gap-sm' },
        h('button', { className: 'btn btn-ghost', onClick: closeModal }, 'Cancel'),
        h('button', { className: 'btn btn-primary', onClick: async () => {
            const amount = parseFloat($('#exp-amount').value);
            if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
            const payload = {
                amount,
                currency: $('#exp-currency').value,
                category_id: parseInt($('#exp-category').value),
                expense_date: $('#exp-date').value,
                description: $('#exp-desc').value.trim(),
            };
            if (existing) {
                await api(`/api/expenses/${existing.id}`, { method: 'PUT', body: payload });
                toast('Expense updated');
            } else {
                await api('/api/expenses', { method: 'POST', body: payload });
                toast('Expense added');
            }
            closeModal();
            renderExpenses();
        } }, existing ? 'Update' : 'Add'),
    );
    showModal(existing ? 'Edit Expense' : 'Add Expense', body, footer);
}

async function renderExpenseSummary(c) {
    const now = new Date();
    const month = now.toISOString().slice(0, 7);
    const toolbar = h('div', { className: 'flex items-center gap-sm mb-2' },
        h('input', { type: 'month', className: 'form-control', id: 'exp-month', value: month, style: 'width:200px' }),
        h('button', { className: 'btn btn-primary btn-sm', onClick: loadSummary }, 'Load'),
    );
    const content = h('div', { id: 'exp-summary-content' });
    c.append(toolbar, content);
    loadSummary();
}

async function loadSummary() {
    const month = $('#exp-month')?.value || new Date().toISOString().slice(0, 7);
    const data = await api(`/api/expenses/summary?month=${month}`);
    const el = $('#exp-summary-content');
    el.innerHTML = '';

    if (!data.items.length) { el.appendChild(emptyState('💰', 'No expenses for this month')); return; }

    const total = h('div', { className: 'stat-card mb-2', style: 'display:inline-block' },
        h('div', { className: 'stat-value' }, `$${data.total.toFixed(2)}`),
        h('div', { className: 'stat-label' }, `Total for ${data.month}`),
    );
    el.appendChild(total);

    // Bar chart
    const maxVal = Math.max(...data.items.map(i => i.total));
    const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    const chart = h('div', { className: 'card' });
    data.items.forEach((item, idx) => {
        const pct = maxVal > 0 ? (item.total / maxVal * 100) : 0;
        const row = h('div', { className: 'flex items-center gap-sm mb-1' },
            h('div', { style: 'width:120px;font-size:.85rem;font-weight:500;text-align:right' }, item.name),
            h('div', { style: 'flex:1;background:var(--border);border-radius:999px;height:24px;overflow:hidden' },
                h('div', { style: `width:${pct}%;background:${chartColors[idx % chartColors.length]};height:100%;border-radius:999px;transition:width 600ms ease;display:flex;align-items:center;padding:0 .5rem` },
                    h('span', { style: 'font-size:.72rem;color:#fff;font-weight:600' }, `$${item.total.toFixed(2)}`),
                ),
            ),
            h('div', { style: 'width:50px;text-align:right;font-size:.8rem;color:var(--text-secondary)' }, `${item.percentage}%`),
        );
        chart.appendChild(row);
    });
    el.appendChild(chart);
}

// =========================================================================
// 5. QUOTE OF THE DAY
// =========================================================================
let quoteTab = 'today';

async function renderQuotes() {
    const c = container();
    c.innerHTML = '';
    const tabs = h('div', { className: 'tabs' },
        h('div', { className: `tab ${quoteTab === 'today' ? 'active' : ''}`, onClick: () => { quoteTab = 'today'; renderQuotes(); } }, 'Today'),
        h('div', { className: `tab ${quoteTab === 'favorites' ? 'active' : ''}`, onClick: () => { quoteTab = 'favorites'; renderQuotes(); } }, 'Favorites'),
        h('div', { className: `tab ${quoteTab === 'search' ? 'active' : ''}`, onClick: () => { quoteTab = 'search'; renderQuotes(); } }, 'Search'),
    );
    c.appendChild(tabs);

    if (quoteTab === 'favorites') return renderQuoteFavorites(c);
    if (quoteTab === 'search') return renderQuoteSearch(c);

    const quoteActions = h('div', { className: 'flex justify-between items-center mb-2' },
        h('div', { className: 'text-sm text-secondary' }, 'Create a sample favorite quote with one click.'),
        h('button', { className: 'btn btn-ghost btn-sm', onClick: () => createTemplate('quotes', () => loadQuote($('#q-date').value)) }, 'Use Template'),
    );

    const content = h('div', { id: 'quote-content' });
    const nav = h('div', { className: 'flex items-center justify-between', style: 'max-width:600px;margin:0 auto' },
        h('button', { className: 'btn btn-ghost', id: 'q-prev' }, '← Previous Day'),
        h('input', { type: 'date', className: 'form-control', id: 'q-date', style: 'width:180px',
            value: new Date().toISOString().slice(0, 10) }),
        h('button', { className: 'btn btn-ghost', id: 'q-next' }, 'Next Day →'),
    );
    c.append(quoteActions, content, nav);

    async function loadQuote(dt) {
        const data = dt ? await api(`/api/quotes/date/${dt}`) : await api('/api/quotes/today');
        content.innerHTML = '';
        if (data.error) { content.appendChild(emptyState('💬', data.error)); return; }
        content.appendChild(h('div', { className: 'quote-display' },
            h('div', { className: 'quote-text' }, `"${data.text}"`),
            h('div', { className: 'quote-author' }, `— ${data.author}`),
            h('button', {
                className: `favorite-btn ${data.is_favorite ? 'active' : ''}`,
                innerHTML: data.is_favorite ? '★' : '☆',
                onClick: async (e) => {
                    const res = await api('/api/quotes/favorite', { method: 'POST', body: { quote_id: data.id } });
                    e.target.className = `favorite-btn ${res.is_favorite ? 'active' : ''}`;
                    e.target.innerHTML = res.is_favorite ? '★' : '☆';
                    toast(res.is_favorite ? 'Added to favorites' : 'Removed from favorites');
                }
            }),
        ));
    }

    loadQuote();

    $('#q-date').addEventListener('change', e => loadQuote(e.target.value));
    $('#q-prev').addEventListener('click', () => {
        const d = new Date($('#q-date').value);
        d.setDate(d.getDate() - 1);
        $('#q-date').value = d.toISOString().slice(0, 10);
        loadQuote($('#q-date').value);
    });
    $('#q-next').addEventListener('click', () => {
        const d = new Date($('#q-date').value);
        d.setDate(d.getDate() + 1);
        $('#q-date').value = d.toISOString().slice(0, 10);
        loadQuote($('#q-date').value);
    });
}

async function renderQuoteFavorites(c) {
    const sortBar = h('div', { className: 'flex items-center gap-sm mb-2' },
        h('select', { className: 'form-control', id: 'fav-sort', style: 'width:180px' },
            h('option', { value: 'date' }, 'Date Added'),
            h('option', { value: 'author' }, 'Author'),
            h('option', { value: 'text' }, 'Quote Text'),
        ),
    );
    const listEl = h('div', { id: 'fav-list' });
    c.append(sortBar, listEl);

    async function load() {
        const sort = $('#fav-sort').value;
        const data = await api(`/api/quotes/favorites?sort=${sort}`);
        listEl.innerHTML = '';
        if (!data.items.length) { listEl.appendChild(emptyState('★', 'No favorites yet')); return; }
        listEl.appendChild(h('div', { className: 'text-sm text-secondary mb-1' }, `${data.items.length} favorite(s)`));
        data.items.forEach(q => {
            listEl.appendChild(h('div', { className: 'card' },
                h('div', { style: 'font-style:italic;margin-bottom:.3rem' }, `"${q.text}"`),
                h('div', { className: 'flex justify-between items-center' },
                    h('span', { className: 'text-sm', style: 'font-weight:600' }, `— ${q.author}`),
                    h('span', { className: 'text-sm text-secondary' }, new Date(q.favorited_at).toLocaleDateString()),
                ),
            ));
        });
    }
    load();
    $('#fav-sort').addEventListener('change', load);
}

async function renderQuoteSearch(c) {
    const searchBar = h('div', { className: 'search-bar' },
        h('input', { className: 'form-control', id: 'q-search', placeholder: 'Search by keyword or author...' }),
    );
    const results = h('div', { id: 'q-results' });
    c.append(searchBar, results);

    const search = debounce(async () => {
        const q = $('#q-search').value.trim();
        if (!q) { results.innerHTML = ''; return; }
        const data = await api(`/api/quotes/search?q=${encodeURIComponent(q)}`);
        results.innerHTML = '';
        if (!data.items.length) { results.appendChild(emptyState('🔍', 'No matching quotes')); return; }
        data.items.forEach(item => {
            results.appendChild(h('div', { className: 'card' },
                h('div', { style: 'font-style:italic;margin-bottom:.3rem' }, `"${item.text}"`),
                h('div', { className: 'text-sm', style: 'font-weight:600' }, `— ${item.author}`),
            ));
        });
    });
    $('#q-search').addEventListener('input', search);
}

// =========================================================================
// 6. CONTACT BOOK
// =========================================================================
async function renderContacts() {
    const c = container();
    c.innerHTML = '';
    const toolbar = h('div', { className: 'flex items-center gap-sm flex-wrap mb-2' },
        h('input', { className: 'form-control', id: 'contact-search', placeholder: 'Search contacts...', style: 'flex:1;min-width:200px' }),
        h('select', { className: 'form-control', id: 'contact-sort', style: 'width:160px' },
            h('option', { value: 'last_name' }, 'Sort: Last Name'),
            h('option', { value: 'first_name' }, 'Sort: First Name'),
            h('option', { value: 'created_at' }, 'Sort: Date Added'),
        ),
        h('button', { className: 'btn btn-ghost btn-sm', onClick: async () => {
            const res = await api('/api/contacts/export');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = h('a', { href: url, download: 'contacts.csv' }); a.click(); URL.revokeObjectURL(url);
        } }, '↓ Export'),
        h('label', { className: 'btn btn-ghost btn-sm', style: 'cursor:pointer' },
            '↑ Import',
            h('input', { type: 'file', accept: '.csv', className: 'hidden', onChange: async (e) => {
                const file = e.target.files[0]; if (!file) return;
                const fd = new FormData(); fd.append('file', file);
                const res = await fetch('/api/contacts/import', { method: 'POST', body: fd });
                const data = await res.json();
                toast(`Imported ${data.imported} contacts`);
                loadContacts();
            } }),
        ),
        h('button', { className: 'btn btn-ghost btn-sm', onClick: () => createTemplate('contacts', () => loadContacts()) }, 'Use Template'),
        h('button', { className: 'btn btn-primary btn-sm', onClick: () => contactModal() }, '+ Add Contact'),
    );
    const listEl = h('div', { id: 'contact-list' });
    c.append(toolbar, listEl);

    window.loadContacts = async function () {
        const q = $('#contact-search')?.value || '';
        const sort = $('#contact-sort')?.value || 'last_name';
        const data = await api(`/api/contacts?q=${encodeURIComponent(q)}&sort=${sort}`);
        const el = $('#contact-list'); el.innerHTML = '';
        if (!data.items.length) { el.appendChild(emptyState('👤', 'No contacts yet')); return; }
        el.appendChild(h('div', { className: 'text-sm text-secondary mb-1' }, `${data.total} contact(s)`));
        const table = h('table', {},
            h('thead', {}, h('tr', {},
                h('th', {}, 'Name'), h('th', {}, 'Phone'), h('th', {}, 'Email'), h('th', {}, ''),
            )),
            h('tbody', {}, ...data.items.map(ct =>
                h('tr', {},
                    h('td', { style: 'font-weight:600' }, `${ct.last_name}, ${ct.first_name}`),
                    h('td', {}, ct.phone || '—'),
                    h('td', {}, ct.email || '—'),
                    h('td', {},
                        h('div', { className: 'flex gap-sm' },
                            h('button', { className: 'btn-icon', title: 'Edit', onClick: () => contactModal(ct) }, '✎'),
                            h('button', { className: 'btn-icon', title: 'Delete', onClick: async () => {
                                if (await confirmDialog(`Delete ${ct.first_name} ${ct.last_name}?`)) {
                                    await api(`/api/contacts/${ct.id}`, { method: 'DELETE' });
                                    toast('Contact deleted'); loadContacts();
                                }
                            } }, '🗑'),
                        ),
                    ),
                )
            )),
        );
        el.appendChild(h('div', { className: 'table-wrap' }, table));
    };
    loadContacts();
    $('#contact-search').addEventListener('input', debounce(loadContacts));
    $('#contact-sort').addEventListener('change', loadContacts);
}

function contactModal(existing = null) {
    const body = h('div', {},
        h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
                h('label', {}, 'First Name *'),
                h('input', { className: 'form-control', id: 'ct-first', maxLength: '50', value: existing?.first_name || '' }),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'Last Name *'),
                h('input', { className: 'form-control', id: 'ct-last', maxLength: '50', value: existing?.last_name || '' }),
            ),
        ),
        h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
                h('label', {}, 'Phone'),
                h('input', { className: 'form-control', id: 'ct-phone', maxLength: '20', value: existing?.phone || '' }),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'Email'),
                h('input', { className: 'form-control', id: 'ct-email', type: 'email', maxLength: '100', value: existing?.email || '' }),
            ),
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Address'),
            h('input', { className: 'form-control', id: 'ct-address', maxLength: '300', value: existing?.address || '' }),
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Notes'),
            h('textarea', { className: 'form-control', id: 'ct-notes', maxLength: '500' }, existing?.notes || ''),
        ),
    );
    const footer = h('div', { className: 'flex gap-sm' },
        h('button', { className: 'btn btn-ghost', onClick: closeModal }, 'Cancel'),
        h('button', { className: 'btn btn-primary', onClick: async () => {
            const first = $('#ct-first').value.trim();
            const last = $('#ct-last').value.trim();
            if (!first || !last) { toast('First and last name required', 'error'); return; }
            const payload = {
                first_name: first, last_name: last,
                phone: $('#ct-phone').value.trim(), email: $('#ct-email').value.trim(),
                address: $('#ct-address').value.trim(), notes: $('#ct-notes').value.trim(),
            };
            if (existing) {
                await api(`/api/contacts/${existing.id}`, { method: 'PUT', body: payload });
                toast('Contact updated');
            } else {
                const res = await api('/api/contacts', { method: 'POST', body: payload });
                if (res.warning) toast(res.warning, 'info');
                else toast('Contact added');
            }
            closeModal(); loadContacts();
        } }, existing ? 'Update' : 'Add'),
    );
    showModal(existing ? 'Edit Contact' : 'Add Contact', body, footer);
}

// =========================================================================
// 7. MARKDOWN NOTES
// =========================================================================
let notesView = 'list';
let editingNoteId = null;

async function renderNotes() {
    const c = container();
    c.innerHTML = '';
    if (notesView === 'edit') return renderNoteEditor(c);

    const toolbar = h('div', { className: 'flex items-center gap-sm flex-wrap mb-2' },
        h('input', { className: 'form-control', id: 'note-search', placeholder: 'Search notes...', style: 'flex:1;min-width:200px' }),
        h('select', { className: 'form-control', id: 'note-tag-filter', style: 'width:160px' },
            h('option', { value: '' }, 'All Tags'),
        ),
        h('button', { className: 'btn btn-ghost btn-sm', onClick: () => createTemplate('notes', () => load()) }, 'Use Template'),
        h('button', { className: 'btn btn-primary btn-sm', onClick: () => { editingNoteId = null; notesView = 'edit'; renderNotes(); } }, '+ New Note'),
    );
    const listEl = h('div', { id: 'note-list' });
    c.append(toolbar, listEl);

    // Load tags
    const tagData = await api('/api/notes/tags');
    const sel = $('#note-tag-filter');
    tagData.items.forEach(t => sel.appendChild(h('option', { value: t.name }, `${t.name} (${t.count})`)));

    async function load() {
        const q = $('#note-search')?.value || '';
        const tag = $('#note-tag-filter')?.value || '';
        const data = await api(`/api/notes?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`);
        listEl.innerHTML = '';
        if (!data.items.length) { listEl.appendChild(emptyState('📝', 'No notes yet. Create one!')); return; }
        data.items.forEach(n => {
            const snippet = n.content?.substring(0, 120) || '';
            listEl.appendChild(h('div', { className: 'card', style: 'cursor:pointer', onClick: () => {
                editingNoteId = n.id; notesView = 'edit'; renderNotes();
            } },
                h('div', { className: 'flex justify-between items-center' },
                    h('div', { style: 'font-weight:600;font-size:1rem' }, n.title),
                    h('div', { className: 'text-sm text-secondary' }, new Date(n.updated_at).toLocaleDateString()),
                ),
                h('div', { className: 'text-sm text-secondary mt-1 truncate' }, snippet),
                n.tags.length ? h('div', { className: 'flex gap-sm flex-wrap mt-1' },
                    ...n.tags.map(t => h('span', { className: 'tag' }, t))
                ) : null,
            ));
        });
    }
    load();
    $('#note-search').addEventListener('input', debounce(load));
    $('#note-tag-filter').addEventListener('change', load);
}

async function renderNoteEditor(c) {
    c.innerHTML = '';
    let noteData = { title: '', content: '', tags: [] };
    if (editingNoteId) {
        noteData = await api(`/api/notes/${editingNoteId}`);
    }

    const header = h('div', { className: 'flex items-center gap-sm mb-2' },
        h('button', { className: 'btn btn-ghost btn-sm', onClick: () => { notesView = 'list'; renderNotes(); } }, '← Back'),
        h('input', { className: 'form-control', id: 'note-title', placeholder: 'Note title...', value: noteData.title,
            style: 'flex:1;font-size:1.1rem;font-weight:600' }),
        h('button', { className: 'btn btn-primary btn-sm', id: 'note-save' }, 'Save'),
        editingNoteId ? h('button', { className: 'btn btn-danger btn-sm', onClick: async () => {
            if (await confirmDialog('Delete this note?')) {
                await api(`/api/notes/${editingNoteId}`, { method: 'DELETE' });
                toast('Note deleted'); notesView = 'list'; renderNotes();
            }
        } }, 'Delete') : null,
    );

    const tagInput = h('div', { className: 'flex items-center gap-sm flex-wrap mb-2' },
        h('span', { className: 'text-sm text-secondary' }, 'Tags:'),
        h('div', { id: 'note-tags', className: 'flex gap-sm flex-wrap' }),
        h('input', { className: 'form-control', id: 'note-tag-input', placeholder: 'Add tag...', style: 'width:120px;font-size:.8rem' }),
    );

    const editor = h('div', { className: 'md-editor' },
        h('textarea', { className: 'form-control', id: 'note-content', style: 'min-height:400px;font-family:monospace;resize:vertical' }, noteData.content),
        h('div', { className: 'md-preview', id: 'note-preview' }),
    );

    c.append(header, tagInput, editor);

    // Render existing tags
    let currentTags = [...noteData.tags];
    function renderTags() {
        const el = $('#note-tags'); el.innerHTML = '';
        currentTags.forEach(t => {
            el.appendChild(h('span', { className: 'tag' }, t,
                h('span', { className: 'tag-remove', onClick: () => { currentTags = currentTags.filter(x => x !== t); renderTags(); } }, '×'),
            ));
        });
    }
    renderTags();

    $('#note-tag-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val && !currentTags.includes(val)) {
                currentTags.push(val);
                renderTags();
            }
            e.target.value = '';
        }
    });

    // Live preview
    let previewTimer;
    async function updatePreview() {
        const content = $('#note-content').value;
        const data = await api('/api/notes/render', { method: 'POST', body: { content } });
        $('#note-preview').innerHTML = data.html || '';
    }
    updatePreview();
    $('#note-content').addEventListener('input', () => {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(updatePreview, 200);
    });

    // Save
    $('#note-save').addEventListener('click', async () => {
        const title = $('#note-title').value.trim();
        if (!title) { toast('Title required', 'error'); return; }
        const payload = { title, content: $('#note-content').value, tags: currentTags };
        if (editingNoteId) {
            await api(`/api/notes/${editingNoteId}`, { method: 'PUT', body: payload });
            toast('Note saved');
        } else {
            const res = await api('/api/notes', { method: 'POST', body: payload });
            editingNoteId = res.id;
            toast('Note created');
        }
    });
}

// =========================================================================
// 8. HABIT TRACKER
// =========================================================================
let habitTab = 'habits';

async function renderHabits() {
    const c = container();
    c.innerHTML = '';
    const tabs = h('div', { className: 'tabs' },
        h('div', { className: `tab ${habitTab === 'habits' ? 'active' : ''}`, onClick: () => { habitTab = 'habits'; renderHabits(); } }, 'Habits'),
        h('div', { className: `tab ${habitTab === 'stats' ? 'active' : ''}`, onClick: () => { habitTab = 'stats'; renderHabits(); } }, 'Statistics'),
    );
    c.appendChild(tabs);

    if (habitTab === 'stats') return renderHabitStats(c);

    const addBtn = h('div', { className: 'flex justify-between items-center mb-2' },
        h('div', { className: 'text-sm text-secondary' }, 'Use a sample habit template to preview streaks and calendar.'),
        h('div', { className: 'flex gap-sm' },
            h('button', { className: 'btn btn-ghost btn-sm', onClick: () => createTemplate('habits', () => loadHabits()) }, 'Use Template'),
        h('button', { className: 'btn btn-primary btn-sm', onClick: () => habitModal() }, '+ New Habit'),
        ),
    );
    const listEl = h('div', { id: 'habit-list' });
    c.append(addBtn, listEl);
    loadHabits();
}

async function loadHabits() {
    const data = await api('/api/habits');
    const el = $('#habit-list'); el.innerHTML = '';
    if (!data.items.length) { el.appendChild(emptyState('🎯', 'No habits yet. Start tracking!')); return; }

    data.items.forEach(hab => {
        const card = h('div', { className: 'card' },
            h('div', { className: 'flex items-center gap-md' },
                h('div', {
                    className: `checkbox-custom ${hab.completed_today ? 'checked' : ''}`,
                    innerHTML: hab.completed_today ? '✓' : '',
                    style: 'width:32px;height:32px;font-size:1.1rem',
                    onClick: async () => {
                        await api(`/api/habits/${hab.id}/toggle`, { method: 'POST' });
                        loadHabits();
                    }
                }),
                h('div', { style: 'flex:1' },
                    h('div', { style: 'font-weight:600' }, hab.name),
                    hab.description ? h('div', { className: 'text-sm text-secondary' }, hab.description) : null,
                ),
                h('div', { className: 'flex gap-md items-center' },
                    h('div', { className: 'text-center' },
                        h('div', { style: 'font-size:1.3rem;font-weight:700;color:var(--primary)' }, String(hab.current_streak)),
                        h('div', { className: 'text-sm text-secondary' }, 'Streak'),
                    ),
                    h('div', { className: 'text-center' },
                        h('div', { style: 'font-size:1.3rem;font-weight:700;color:var(--success)' }, String(hab.longest_streak)),
                        h('div', { className: 'text-sm text-secondary' }, 'Best'),
                    ),
                    h('button', { className: 'btn btn-ghost btn-sm', onClick: () => showHabitCalendar(hab) }, '📅'),
                    h('button', { className: 'btn-icon', onClick: () => habitModal(hab) }, '✎'),
                    h('button', { className: 'btn-icon', onClick: async () => {
                        if (await confirmDialog(`Delete "${hab.name}"?`)) {
                            await api(`/api/habits/${hab.id}`, { method: 'DELETE' });
                            toast('Habit deleted'); loadHabits();
                        }
                    } }, '🗑'),
                ),
            ),
            h('div', { className: 'flex gap-sm mt-1' },
                h('span', { className: 'badge badge-neutral' }, hab.frequency),
            ),
        );
        el.appendChild(card);
    });
}

function habitModal(existing = null) {
    const body = h('div', {},
        h('div', { className: 'form-group' },
            h('label', {}, 'Habit Name'),
            h('input', { className: 'form-control', id: 'hab-name', maxLength: '80', value: existing?.name || '' }),
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Description'),
            h('textarea', { className: 'form-control', id: 'hab-desc', maxLength: '300' }, existing?.description || ''),
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Frequency'),
            h('select', { className: 'form-control', id: 'hab-freq' },
                h('option', { value: 'daily', ...(existing?.frequency === 'daily' ? { selected: 'selected' } : {}) }, 'Daily'),
                h('option', { value: 'weekdays', ...(existing?.frequency === 'weekdays' ? { selected: 'selected' } : {}) }, 'Weekdays Only'),
            ),
        ),
    );
    const footer = h('div', { className: 'flex gap-sm' },
        h('button', { className: 'btn btn-ghost', onClick: closeModal }, 'Cancel'),
        h('button', { className: 'btn btn-primary', onClick: async () => {
            const name = $('#hab-name').value.trim();
            if (!name) { toast('Name required', 'error'); return; }
            const payload = { name, description: $('#hab-desc').value.trim(), frequency: $('#hab-freq').value };
            if (existing) {
                await api(`/api/habits/${existing.id}`, { method: 'PUT', body: payload });
                toast('Habit updated');
            } else {
                await api('/api/habits', { method: 'POST', body: payload });
                toast('Habit created');
            }
            closeModal(); loadHabits();
        } }, existing ? 'Update' : 'Create'),
    );
    showModal(existing ? 'Edit Habit' : 'New Habit', body, footer);
}

async function showHabitCalendar(habit) {
    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth();

    async function render() {
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        const data = await api(`/api/habits/${habit.id}/calendar?month=${monthStr}`);
        const completedSet = new Set(data.dates);

        const body = h('div', {});
        const nav = h('div', { className: 'flex justify-between items-center mb-1' },
            h('button', { className: 'btn btn-ghost btn-sm', onClick: () => { month--; if (month < 0) { month = 11; year--; } render(); } }, '←'),
            h('span', { style: 'font-weight:600' }, `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`),
            h('button', { className: 'btn btn-ghost btn-sm', onClick: () => { month++; if (month > 11) { month = 0; year++; } render(); } }, '→'),
        );
        const pct = h('div', { className: 'text-center text-sm text-secondary mb-1' }, `${data.completion_pct}% complete`);

        const grid = h('div', { className: 'calendar-grid' });
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => grid.appendChild(h('div', { className: 'cal-day-header' }, d)));

        const firstDay = new Date(year, month, 1);
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;
        for (let i = 0; i < startDay; i++) grid.appendChild(h('div', { className: 'cal-day empty' }));

        const today = new Date().toISOString().slice(0, 10);
        for (let d = 1; d <= data.days_in_month; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isCompleted = completedSet.has(dateStr);
            const isToday = dateStr === today;
            let cls = 'cal-day';
            if (isCompleted) cls += ' completed';
            if (isToday) cls += ' today';
            grid.appendChild(h('div', { className: cls }, String(d)));
        }

        body.append(nav, pct, grid);
        const modalBody = $('#modal-body');
        modalBody.innerHTML = '';
        modalBody.appendChild(body);
    }

    showModal(`${habit.name} — Calendar`, h('div', {}), null);
    render();
}

async function renderHabitStats(c) {
    const data = await api('/api/habits/stats');
    if (!data.items.length) { c.appendChild(emptyState('📊', 'No habit data yet')); return; }

    const grid = h('div', { className: 'stats-grid' });
    const totalCompletions = data.items.reduce((s, i) => s + i.total_completions, 0);
    const avgRate = data.items.length > 0 ? (data.items.reduce((s, i) => s + i.completion_rate, 0) / data.items.length).toFixed(1) : 0;

    grid.append(
        h('div', { className: 'stat-card' }, h('div', { className: 'stat-value' }, String(data.items.length)), h('div', { className: 'stat-label' }, 'Active Habits')),
        h('div', { className: 'stat-card' }, h('div', { className: 'stat-value' }, String(totalCompletions)), h('div', { className: 'stat-label' }, 'Total Check-ins')),
        h('div', { className: 'stat-card' }, h('div', { className: 'stat-value' }, `${avgRate}%`), h('div', { className: 'stat-label' }, 'Avg Completion')),
    );
    c.appendChild(grid);

    // Per-habit stats table
    const table = h('div', { className: 'card table-wrap' },
        h('table', {},
            h('thead', {}, h('tr', {},
                h('th', {}, 'Habit'), h('th', {}, 'Completions'), h('th', {}, 'Days Tracked'),
                h('th', {}, 'Rate'), h('th', {}, 'Current Streak'), h('th', {}, 'Best Streak'),
            )),
            h('tbody', {}, ...data.items.map(i =>
                h('tr', {},
                    h('td', { style: 'font-weight:600' }, i.name),
                    h('td', {}, String(i.total_completions)),
                    h('td', {}, String(i.days_tracked)),
                    h('td', {}, h('span', { className: `badge ${i.completion_rate >= 70 ? 'badge-success' : i.completion_rate >= 40 ? 'badge-warning' : 'badge-danger'}` }, `${i.completion_rate}%`)),
                    h('td', {}, String(i.current_streak)),
                    h('td', {}, String(i.longest_streak)),
                )
            )),
        ),
    );
    c.appendChild(table);
}

// =========================================================================
// 9. UNIT CONVERTER
// =========================================================================
let unitCategories = {};

async function renderUnits() {
    const c = container();
    c.innerHTML = '';
    unitCategories = await api('/api/units/categories');

    const catNames = Object.keys(unitCategories);
    const card = h('div', { className: 'card' },
        h('div', { className: 'card-header' },
            h('h2', {}, 'Convert Units'),
            h('button', { className: 'btn btn-ghost btn-sm', onClick: () => createTemplate('units', () => loadUnitHistory()) }, 'Use Template')
        ),
        h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
                h('label', {}, 'Category'),
                h('select', { className: 'form-control', id: 'unit-cat' },
                    ...catNames.map(c => h('option', { value: c }, c.charAt(0).toUpperCase() + c.slice(1))),
                ),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'Value(s)'),
                h('input', { className: 'form-control', id: 'unit-input', placeholder: 'e.g. 100 or 2.5, 10, 50' }),
            ),
        ),
        h('div', { className: 'form-row' },
            h('div', { className: 'form-group' },
                h('label', {}, 'From'),
                h('select', { className: 'form-control', id: 'unit-from' }),
            ),
            h('div', { className: 'form-group' },
                h('label', {}, 'To'),
                h('select', { className: 'form-control', id: 'unit-to' }),
            ),
        ),
        h('button', { className: 'btn btn-primary', id: 'unit-convert' }, 'Convert'),
        h('div', { id: 'unit-results', className: 'mt-2' }),
    );

    const historyCard = h('div', { className: 'card mt-2' },
        h('div', { className: 'card-header' },
            h('h2', {}, 'History'),
            h('button', { className: 'btn btn-sm btn-ghost', onClick: async () => { await api('/api/units/history', { method: 'DELETE' }); loadUnitHistory(); } }, 'Clear'),
        ),
        h('div', { id: 'unit-history' }),
    );

    c.append(card, historyCard);

    function updateUnits() {
        const cat = $('#unit-cat').value;
        const units = unitCategories[cat] || [];
        ['unit-from', 'unit-to'].forEach((id, idx) => {
            const sel = $(`#${id}`);
            sel.innerHTML = '';
            units.forEach((u, i) => {
                const opt = h('option', { value: u }, u);
                if (idx === 1 && i === 1) opt.selected = true;
                sel.appendChild(opt);
            });
        });
    }
    updateUnits();
    $('#unit-cat').addEventListener('change', updateUnits);

    $('#unit-convert').addEventListener('click', async () => {
        const raw = $('#unit-input').value.trim();
        if (!raw) { toast('Enter a value', 'error'); return; }
        const values = raw.split(',').map(v => v.trim()).filter(Boolean);
        const data = await api('/api/units/convert', {
            method: 'POST',
            body: { category: $('#unit-cat').value, source_unit: $('#unit-from').value, target_unit: $('#unit-to').value, values },
        });
        const results = $('#unit-results');
        results.innerHTML = '';
        if (data.error) { toast(data.error, 'error'); return; }
        const table = h('table', {},
            h('thead', {}, h('tr', {}, h('th', {}, 'Input'), h('th', {}, 'Result'), h('th', {}, 'Status'))),
            h('tbody', {}, ...data.results.map(r =>
                h('tr', {},
                    h('td', {}, `${r.input} ${r.source_unit || ''}`),
                    h('td', { style: 'font-weight:600' }, r.error ? '—' : `${r.result} ${r.target_unit || ''}`),
                    h('td', {}, r.error ? h('span', { className: 'badge badge-danger' }, r.error) : h('span', { className: 'badge badge-success' }, 'OK')),
                )
            )),
        );
        results.appendChild(table);
        loadUnitHistory();
    });

    loadUnitHistory();
}

async function loadUnitHistory() {
    const data = await api('/api/units/history');
    const el = $('#unit-history'); el.innerHTML = '';
    if (!data.items.length) { el.appendChild(emptyState('📏', 'No conversions yet')); return; }
    const table = h('table', {},
        h('thead', {}, h('tr', {}, h('th', {}, 'Category'), h('th', {}, 'From'), h('th', {}, 'To'), h('th', {}, 'Date'))),
        h('tbody', {}, ...data.items.slice(0, 20).map(r =>
            h('tr', {},
                h('td', {}, h('span', { className: 'badge badge-info' }, r.category)),
                h('td', {}, `${r.source_value} ${r.source_unit}`),
                h('td', {}, `${r.result_value} ${r.target_unit}`),
                h('td', { className: 'text-sm text-secondary' }, new Date(r.created_at).toLocaleString()),
            )
        )),
    );
    el.appendChild(table);
}

// =========================================================================
// 10. FLASHCARD STUDY APP
// =========================================================================
let flashcardView = 'decks';
let selectedDeckId = null;

async function renderFlashcards() {
    const c = container();
    c.innerHTML = '';
    if (flashcardView === 'cards') return renderDeckCards(c);
    if (flashcardView === 'study') return renderStudyMode(c);

    const addBtn = h('div', { className: 'flex justify-between items-center mb-2' },
        h('h2', { style: 'font-size:1rem;font-weight:600' }, 'Your Decks'),
        h('div', { className: 'flex gap-sm' },
            h('button', { className: 'btn btn-ghost btn-sm', onClick: () => createTemplate('flashcards', () => renderFlashcards()) }, 'Use Template'),
            h('button', { className: 'btn btn-primary btn-sm', onClick: () => deckModal() }, '+ New Deck'),
        ),
    );
    const listEl = h('div', { id: 'deck-list' });
    c.append(addBtn, listEl);

    const data = await api('/api/decks');
    if (!data.items.length) { listEl.appendChild(emptyState('🎓', 'No decks yet. Create one to start studying!')); return; }

    data.items.forEach(d => {
        const total = d.total || 0;
        const mastered = d.mastered || 0;
        const pct = total > 0 ? Math.round(mastered / total * 100) : 0;

        listEl.appendChild(h('div', { className: 'card' },
            h('div', { className: 'flex justify-between items-center' },
                h('div', {},
                    h('div', { style: 'font-weight:700;font-size:1.05rem' }, d.name),
                    d.description ? h('div', { className: 'text-sm text-secondary mt-1' }, d.description) : null,
                ),
                h('div', { className: 'flex gap-sm items-center' },
                    h('button', { className: 'btn btn-primary btn-sm', onClick: () => {
                        selectedDeckId = d.id; flashcardView = 'study'; renderFlashcards();
                    } }, '▶ Study'),
                    h('button', { className: 'btn btn-ghost btn-sm', onClick: () => {
                        selectedDeckId = d.id; flashcardView = 'cards'; renderFlashcards();
                    } }, 'Cards'),
                    h('button', { className: 'btn-icon', onClick: () => deckModal(d) }, '✎'),
                    h('button', { className: 'btn-icon', onClick: async () => {
                        if (await confirmDialog(`Delete deck "${d.name}" and all its cards?`)) {
                            await api(`/api/decks/${d.id}`, { method: 'DELETE' });
                            toast('Deck deleted'); renderFlashcards();
                        }
                    } }, '🗑'),
                ),
            ),
            h('div', { className: 'flex gap-md mt-2' },
                h('span', { className: 'badge badge-neutral' }, `${total} cards`),
                h('span', { className: 'badge badge-success' }, `${mastered} mastered`),
                h('span', { className: 'badge badge-warning' }, `${d.learning || 0} learning`),
                h('span', { className: 'badge badge-info' }, `${d.new_cards || 0} new`),
            ),
            total > 0 ? h('div', { className: 'strength-bar mt-1' },
                h('div', { className: 'strength-fill', style: `width:${pct}%;background:var(--success)` }),
            ) : null,
        ));
    });
}

function deckModal(existing = null) {
    const body = h('div', {},
        h('div', { className: 'form-group' },
            h('label', {}, 'Deck Name'),
            h('input', { className: 'form-control', id: 'deck-name', maxLength: '80', value: existing?.name || '' }),
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Description'),
            h('textarea', { className: 'form-control', id: 'deck-desc', maxLength: '300' }, existing?.description || ''),
        ),
    );
    const footer = h('div', { className: 'flex gap-sm' },
        h('button', { className: 'btn btn-ghost', onClick: closeModal }, 'Cancel'),
        h('button', { className: 'btn btn-primary', onClick: async () => {
            const name = $('#deck-name').value.trim();
            if (!name) { toast('Name required', 'error'); return; }
            const payload = { name, description: $('#deck-desc').value.trim() };
            if (existing) {
                await api(`/api/decks/${existing.id}`, { method: 'PUT', body: payload });
                toast('Deck updated');
            } else {
                const res = await api('/api/decks', { method: 'POST', body: payload });
                if (res.error) { toast(res.error, 'error'); return; }
                toast('Deck created');
            }
            closeModal(); renderFlashcards();
        } }, existing ? 'Update' : 'Create'),
    );
    showModal(existing ? 'Edit Deck' : 'New Deck', body, footer);
}

async function renderDeckCards(c) {
    c.innerHTML = '';
    const header = h('div', { className: 'flex items-center gap-sm mb-2' },
        h('button', { className: 'btn btn-ghost btn-sm', onClick: () => { flashcardView = 'decks'; renderFlashcards(); } }, '← Back'),
        h('input', { className: 'form-control', id: 'card-search', placeholder: 'Search cards...', style: 'flex:1' }),
        h('button', { className: 'btn btn-primary btn-sm', onClick: () => cardModal(selectedDeckId) }, '+ Add Card'),
    );
    const listEl = h('div', { id: 'card-list' });
    c.append(header, listEl);

    async function load() {
        const q = $('#card-search')?.value || '';
        const data = await api(`/api/decks/${selectedDeckId}/cards?q=${encodeURIComponent(q)}`);
        listEl.innerHTML = '';
        if (!data.items.length) { listEl.appendChild(emptyState('🎓', 'No cards. Add some!')); return; }
        data.items.forEach(card => {
            const confBadge = { new: 'badge-info', learning: 'badge-warning', mastered: 'badge-success' };
            listEl.appendChild(h('div', { className: 'card' },
                h('div', { className: 'flex justify-between items-center' },
                    h('div', { style: 'flex:1' },
                        h('div', { style: 'font-weight:600' }, card.front),
                        h('div', { className: 'text-sm text-secondary mt-1' }, card.back),
                    ),
                    h('div', { className: 'flex gap-sm items-center' },
                        h('span', { className: `badge ${confBadge[card.confidence] || 'badge-neutral'}` }, card.confidence),
                        h('button', { className: 'btn-icon', onClick: () => cardModal(selectedDeckId, card) }, '✎'),
                        h('button', { className: 'btn-icon', onClick: async () => {
                            if (await confirmDialog('Delete this card?')) {
                                await api(`/api/cards/${card.id}`, { method: 'DELETE' });
                                toast('Card deleted'); load();
                            }
                        } }, '🗑'),
                    ),
                ),
            ));
        });
    }
    load();
    $('#card-search').addEventListener('input', debounce(load));
}

function cardModal(deckId, existing = null) {
    const body = h('div', {},
        h('div', { className: 'form-group' },
            h('label', {}, 'Question (Front)'),
            h('textarea', { className: 'form-control', id: 'card-front', maxLength: '500' }, existing?.front || ''),
        ),
        h('div', { className: 'form-group' },
            h('label', {}, 'Answer (Back)'),
            h('textarea', { className: 'form-control', id: 'card-back', maxLength: '1000' }, existing?.back || ''),
        ),
    );
    const footer = h('div', { className: 'flex gap-sm' },
        h('button', { className: 'btn btn-ghost', onClick: closeModal }, 'Cancel'),
        h('button', { className: 'btn btn-primary', onClick: async () => {
            const front = $('#card-front').value.trim();
            const back = $('#card-back').value.trim();
            if (!front || !back) { toast('Both sides required', 'error'); return; }
            if (existing) {
                await api(`/api/cards/${existing.id}`, { method: 'PUT', body: { front, back } });
                toast('Card updated');
            } else {
                await api(`/api/decks/${deckId}/cards`, { method: 'POST', body: { front, back } });
                toast('Card added');
            }
            closeModal();
            renderDeckCards(container()); // re-render — slight hack
        } }, existing ? 'Update' : 'Add'),
    );
    showModal(existing ? 'Edit Card' : 'Add Card', body, footer);
}

async function renderStudyMode(c) {
    c.innerHTML = '';
    const header = h('div', { className: 'flex items-center gap-sm mb-2' },
        h('button', { className: 'btn btn-ghost btn-sm', onClick: () => { flashcardView = 'decks'; renderFlashcards(); } }, '← Back to Decks'),
        h('div', { style: 'flex:1' }),
        h('span', { id: 'study-progress', className: 'text-sm text-secondary' }),
    );
    const cardArea = h('div', { id: 'study-area' });
    c.append(header, cardArea);

    const data = await api(`/api/decks/${selectedDeckId}/study`);
    if (!data.items.length) { cardArea.appendChild(emptyState('🎓', 'No cards in this deck. Add some first!')); return; }

    // Shuffle for study
    const cards = data.items.sort(() => Math.random() - 0.5);
    let idx = 0;
    let revealed = false;

    function showCard() {
        const card = cards[idx];
        $('#study-progress').textContent = `Card ${idx + 1} of ${cards.length}`;
        cardArea.innerHTML = '';
        revealed = false;

        const display = h('div', { className: 'flashcard-display' },
            h('div', { className: 'flashcard-inner', id: 'fc-inner', onClick: () => {
                if (!revealed) {
                    revealed = true;
                    const lbl = $('#fc-label');
                    const txt = $('#fc-text');
                    lbl.textContent = 'ANSWER';
                    txt.textContent = card.back;
                    document.getElementById('fc-actions').classList.remove('hidden');
                }
            } },
                h('div', { className: 'flashcard-label', id: 'fc-label' }, 'QUESTION'),
                h('div', { className: 'flashcard-text', id: 'fc-text' }, card.front),
                h('div', { className: 'text-sm text-secondary mt-2' }, revealed ? '' : 'Click to reveal answer'),
            ),
        );

        const actions = h('div', { className: 'flashcard-actions hidden', id: 'fc-actions' },
            h('button', { className: 'rate-btn rate-hard', onClick: async () => { await rate(card.id, 'hard'); next(); } }, '😓 Hard'),
            h('button', { className: 'rate-btn rate-medium', onClick: async () => { await rate(card.id, 'medium'); next(); } }, '🤔 Medium'),
            h('button', { className: 'rate-btn rate-easy', onClick: async () => { await rate(card.id, 'easy'); next(); } }, '😎 Easy'),
        );

        cardArea.append(display, actions);
    }

    async function rate(cardId, rating) {
        await api(`/api/cards/${cardId}/rate`, { method: 'POST', body: { rating } });
    }

    function next() {
        idx++;
        if (idx >= cards.length) {
            cardArea.innerHTML = '';
            cardArea.appendChild(h('div', { className: 'text-center', style: 'padding:3rem' },
                h('div', { style: 'font-size:3rem;margin-bottom:1rem' }, '🎉'),
                h('h2', {}, 'Session Complete!'),
                h('p', { className: 'text-secondary mt-1' }, `You reviewed ${cards.length} cards.`),
                h('button', { className: 'btn btn-primary mt-2', onClick: () => { idx = 0; showCard(); } }, 'Study Again'),
            ));
            return;
        }
        showCard();
    }

    showCard();
}


// =========================================================================
// ARCHITECTURE — Deep Dive
// =========================================================================
async function renderArchitecture() {
    const c = container();
    c.innerHTML = '';

    // Hero header
    const hero = h('section', { className: 'arch-hero' },
        h('div', { className: 'arch-hero-bg' }),
        h('div', { className: 'arch-hero-content' },
            h('div', { style: 'font-size: 2.5rem; margin-bottom: .5rem' }, '🏗️'),
            h('h1', { className: 'arch-hero-title' }, 'Architecture Deep Dive'),
            h('p', { className: 'arch-hero-sub' }, 'A complete technical walkthrough — from the pixels in your browser down to the bytes on disk.'),
        ),
    );

    const content = h('div', { className: 'arch-content', id: 'arch-content' }, 'Loading…');
    const tocSidebar = h('aside', { className: 'arch-toc', id: 'arch-toc' });
    const layout = h('div', { className: 'arch-layout' }, tocSidebar, content);

    c.append(hero, layout);

    let data;
    try {
        data = await api('/api/architecture');
    } catch (e) {
        content.textContent = 'Could not load architecture documentation.';
        return;
    }
    if (data.error) {
        content.textContent = data.error;
        return;
    }

    // Render HTML content
    content.innerHTML = data.html;

    // Convert mermaid code blocks to visual diagrams (rendered as styled code blocks)
    content.querySelectorAll('pre code').forEach(block => {
        const text = block.textContent;
        if (text.trim().startsWith('graph ') || text.trim().startsWith('sequenceDiagram') ||
            text.trim().startsWith('erDiagram') || text.trim().startsWith('flowchart')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'arch-diagram';
            wrapper.innerHTML = '<div class="arch-diagram-label">📊 Diagram (see ARCHITECTURE.md on GitHub for rendered Mermaid)</div>';
            const pre = block.closest('pre');
            // Show as styled code
            block.className = 'arch-mermaid-src';
            wrapper.appendChild(pre.cloneNode(true));
            pre.replaceWith(wrapper);
        }
    });

    // Build table of contents from rendered headings
    const headings = content.querySelectorAll('h1, h2, h3');
    if (headings.length > 0) {
        const tocTitle = h('div', { className: 'arch-toc-title' }, '📑 Contents');
        tocSidebar.appendChild(tocTitle);
        headings.forEach((heading, i) => {
            const id = 'arch-heading-' + i;
            heading.id = id;
            const level = heading.tagName.toLowerCase();
            const link = h('a', {
                className: `arch-toc-link arch-toc-${level}`,
                href: '#' + id,
                onClick: (e) => {
                    e.preventDefault();
                    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // highlight active
                    tocSidebar.querySelectorAll('.arch-toc-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }, heading.textContent);
            tocSidebar.appendChild(link);
        });
    }

    // Scroll spy for TOC
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocSidebar.querySelectorAll('.arch-toc-link').forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-80px 0px -70% 0px' });
    headings.forEach(h => observer.observe(h));
}
