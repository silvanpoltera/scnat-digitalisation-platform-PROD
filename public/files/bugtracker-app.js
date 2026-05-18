const toastEl = document.getElementById('toast');
const tbody = document.getElementById('tbody');
const searchInput = document.getElementById('search');
const filterStatus = document.getElementById('filterStatus');
const filterKat = document.getElementById('filterKat');
const filterAlter = document.getElementById('filterAlter');
const filterTag = document.getElementById('filterTag');
const filterClosed = document.getElementById('filterClosed');
const clearBtn = document.getElementById('clearBtn');
const resultsCount = document.getElementById('resultsCount');
const pagination = document.getElementById('pagination');
const kpiGrid = document.getElementById('kpiGrid');
const catGrid = document.getElementById('catGrid');
const bulkBar = document.getElementById('bulkBar');
const bulkCount = document.getElementById('bulkCount');
const cbAll = document.getElementById('cbAll');

const closeDialog = document.getElementById('closeDialog');
const closeReason = document.getElementById('closeReason');
const closeCancel = document.getElementById('closeCancel');
const closeConfirm = document.getElementById('closeConfirm');

const notizDialog = document.getElementById('notizDialog');
const notizTitel = document.getElementById('notizTitel');
const notizText = document.getElementById('notizText');
const notizCancel = document.getElementById('notizCancel');
const notizConfirm = document.getElementById('notizConfirm');

const STATUS_OPTIONS = [
  'Neu', 'Bestätigt', 'Bereit zum Testen', 'Zusatzinformationen angefordert',
  'Wird getestet', 'Wird bearbeitet', 'In Überarbeitung', 'Geprüft',
  'Umsetzung geplant', 'Parkplatz / nicht zugewiesen', 'Won\'t fix', 'Geschlossen',
];

const state = {
  all: [],
  filtered: [],
  sortKey: 'alter_d',
  sortDir: 'desc',
  page: 1,
  perPage: 25,
  selected: new Set(),
  pendingCloseIds: [],
  activeNotizId: null,
};

function applyThemeFromQuery() {
  const params = new URLSearchParams(window.location.search);
  let theme = params.get('theme');

  // Fallback: derive theme from parent document class
  try {
    const parentRoot = window.parent?.document?.documentElement;
    if (parentRoot?.classList?.contains('theme-bright')) theme = 'light';
    if (parentRoot?.classList?.contains('theme-dark')) theme = 'dark';
  } catch {
    // ignore cross-context access errors
  }
  const root = document.documentElement;

  if (theme === 'light' || theme === 'bright') {
    const lightVars = {
      '--bg': '#F4F6F8',
      '--surface': '#FFFFFF',
      '--elevated': '#F8FAFC',
      '--subtle': '#E9EDF2',
      '--b-faint': '#E5EAF0',
      '--b-def': '#D6DEE8',
      '--b-strong': '#9AA8B8',
      '--text': '#1B2530',
      '--text2': '#4D5D6E',
      '--text3': '#7A8998',
      '--red': '#D64550',
      '--red-dim': 'rgba(214,69,80,0.12)',
      '--red-mid': 'rgba(214,69,80,0.28)',
      '--ok': '#2A8B5F',
      '--warn': '#B26E17',
      '--info': '#2E74C2',
      '--purple': '#6A4BB0',
      '--anth': '#8A97A8',
    };
    Object.entries(lightVars).forEach(([k, v]) => root.style.setProperty(k, v));
  }
}

function showToast(msg, isError = false) {
  toastEl.textContent = msg;
  toastEl.className = `toast ${isError ? 'error' : ''} show`;
  setTimeout(() => { toastEl.className = 'toast'; }, 1800);
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function statusClass(s) {
  return 's-' + (s || '').toLowerCase().replace(/[äöü]/g, m => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[m])).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function alterClass(d) {
  if (d === null || d === undefined) return 'alter-mid';
  if (d > 1825) return 'alter-anc';
  if (d > 1095) return 'alter-st';
  if (d > 365) return 'alter-mid';
  return 'alter-new';
}

function alterText(d) {
  if (d === null || d === undefined) return '?';
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}mo`;
  return `${(d / 365).toFixed(1)}j`;
}

function tagPill(t) {
  const cls = {
    REPRO: 't-repro', BLOCKER: 't-blocker', STÖREND: 't-stoerend',
    KOSMETISCH: 't-kosmetisch', ANCIENT: 't-ancient', STALE: 't-stale',
  }[t] || '';
  const label = {
    REPRO: 'REPRO', BLOCKER: 'BLOCKER', STÖREND: 'STÖR', KOSMETISCH: 'KOSM', ANCIENT: '5J+', STALE: '3J+',
  }[t] || t;
  return `<span class="tag-mini ${cls}">${label}</span>`;
}

function isClosed(t) {
  return t.geschlossen === true || t.status === 'Geschlossen' || t.status === "Won't fix";
}

function sortData() {
  const k = state.sortKey;
  const dir = state.sortDir === 'asc' ? 1 : -1;
  state.filtered.sort((a, b) => {
    let av = a[k]; let bv = b[k];
    if (k === 'tags') { av = (a.tags || []).join(','); bv = (b.tags || []).join(','); }
    if (av === null || av === undefined) av = '';
    if (bv === null || bv === undefined) bv = '';
    if (typeof av === 'number' || typeof bv === 'number') { av = Number(av) || 0; bv = Number(bv) || 0; }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const fs = filterStatus.value;
  const fk = filterKat.value;
  const fa = filterAlter.value;
  const ft = filterTag.value;
  const fc = filterClosed.value;

  state.filtered = state.all.filter(t => {
    if (q && !(String(t.titel || '').toLowerCase().includes(q) || String(t.id).includes(q))) return false;
    if (fs && t.status !== fs) return false;
    if (fk && t.haupt !== fk) return false;
    if (ft && !(t.tags || []).includes(ft)) return false;
    if (fc === 'open' && isClosed(t)) return false;
    if (fc === 'closed' && !isClosed(t)) return false;
    if (fa) {
      const a = t.alter_d;
      if (a === null || a === undefined) return false;
      if (fa === 'lt30' && a >= 30) return false;
      if (fa === 'lt90' && a >= 90) return false;
      if (fa === 'lt365' && a >= 365) return false;
      if (fa === 'gt1y' && a <= 365) return false;
      if (fa === 'gt3y' && a <= 1095) return false;
      if (fa === 'gt5y' && a <= 1825) return false;
    }
    return true;
  });

  sortData();
  state.page = 1;
  render();
}

function updateBulkBar() {
  bulkCount.textContent = `${state.selected.size} ausgewählt`;
  bulkBar.classList.toggle('hidden', state.selected.size === 0);
}

function render() {
  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;
  const page = state.filtered.slice(start, end);

  tbody.innerHTML = page.map(t => `
    <tr class="${isClosed(t) ? 'closed' : ''}">
      <td><input type="checkbox" class="row-cb cb-row" data-id="${t.id}" ${state.selected.has(String(t.id)) ? 'checked' : ''}></td>
      <td class="id">#${t.id}</td>
      <td class="titel">${escapeHtml(t.titel)}</td>
      <td>
        <select class="status-select ${statusClass(t.status)}" data-status-id="${t.id}">
          ${STATUS_OPTIONS.map(s => `<option value="${escapeHtml(s)}" ${t.status === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
        </select>
      </td>
      <td class="zuw-cell ${!t.zuw ? 'zuw-none' : ''}">${escapeHtml(t.zuw || '–')}</td>
      <td class="alter ${alterClass(t.alter_d)}">${alterText(t.alter_d)}</td>
      <td>${(t.tags || []).map(tagPill).join('')}</td>
      <td class="notiz-cell" title="${escapeHtml(t.notiz || '')}">${escapeHtml(t.notiz || '–')}</td>
      <td>
        <div class="row-actions">
          <button class="row-btn" data-notiz-id="${t.id}">Notiz</button>
          ${isClosed(t) ? `<button class="row-btn reopen" data-reopen-id="${t.id}">Reopen</button>` : `<button class="row-btn" data-close-id="${t.id}">Close</button>`}
        </div>
      </td>
    </tr>
  `).join('');

  resultsCount.textContent = `${state.filtered.length} Tickets`;
  renderPagination();
  updateBulkBar();

  document.querySelectorAll('.cb-row').forEach(el => {
    el.addEventListener('change', () => {
      const id = String(el.dataset.id);
      if (el.checked) state.selected.add(id); else state.selected.delete(id);
      updateBulkBar();
    });
  });

  document.querySelectorAll('[data-status-id]').forEach(el => {
    el.addEventListener('change', () => updateStatus(el.dataset.statusId, el.value));
  });
  document.querySelectorAll('[data-close-id]').forEach(el => {
    el.addEventListener('click', () => openCloseDialog([el.dataset.closeId]));
  });
  document.querySelectorAll('[data-reopen-id]').forEach(el => {
    el.addEventListener('click', () => reopenTickets([el.dataset.reopenId]));
  });
  document.querySelectorAll('[data-notiz-id]').forEach(el => {
    el.addEventListener('click', () => openNotizDialog(el.dataset.notizId));
  });
}

function renderPagination() {
  const total = state.filtered.length;
  const pages = Math.max(1, Math.ceil(total / state.perPage));
  if (state.page > pages) state.page = pages;
  pagination.innerHTML = `
    <button class="page-btn" ${state.page === 1 ? 'disabled' : ''} data-act="first">«</button>
    <button class="page-btn" ${state.page === 1 ? 'disabled' : ''} data-act="prev">‹</button>
    <span class="page-info">Seite ${state.page} / ${pages}</span>
    <button class="page-btn" ${state.page === pages ? 'disabled' : ''} data-act="next">›</button>
    <button class="page-btn" ${state.page === pages ? 'disabled' : ''} data-act="last">»</button>
  `;
  pagination.querySelectorAll('.page-btn').forEach(b => {
    b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'first') state.page = 1;
      else if (a === 'last') state.page = pages;
      else if (a === 'next') state.page = Math.min(state.page + 1, pages);
      else if (a === 'prev') state.page = Math.max(state.page - 1, 1);
      render();
    });
  });
}

async function api(path, body = null) {
  const r = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
  return r.json();
}

async function updateStatus(id, status) {
  try {
    if (status === 'Geschlossen' || status === "Won't fix") {
      await api(`/api/bugtracker/ticket/${id}/close`, { grund: status === "Won't fix" ? "Won't fix" : null });
    } else {
      await api(`/api/bugtracker/ticket/${id}/status`, { status });
    }
    await load();
    showToast('Status gespeichert');
  } catch (e) {
    showToast(e.message, true);
  }
}

function openCloseDialog(ids) {
  state.pendingCloseIds = ids.map(String);
  closeReason.value = '';
  closeDialog.showModal();
}

async function closeTickets(ids, grund) {
  try {
    if (ids.length === 1) {
      await api(`/api/bugtracker/ticket/${ids[0]}/close`, { grund });
    } else {
      await api('/api/bugtracker/bulk/close', { ids, grund });
    }
    ids.forEach(id => state.selected.delete(String(id)));
    await load();
    showToast(`${ids.length} Ticket(s) geschlossen`);
  } catch (e) {
    showToast(e.message, true);
  }
}

async function reopenTickets(ids) {
  try {
    if (ids.length === 1) {
      await api(`/api/bugtracker/ticket/${ids[0]}/reopen`, { status: 'Neu' });
    } else {
      await api('/api/bugtracker/bulk/reopen', { ids, status: 'Neu' });
    }
    ids.forEach(id => state.selected.delete(String(id)));
    await load();
    showToast(`${ids.length} Ticket(s) wieder geöffnet`);
  } catch (e) {
    showToast(e.message, true);
  }
}

function openNotizDialog(id) {
  const t = state.all.find(x => String(x.id) === String(id));
  if (!t) return;
  state.activeNotizId = String(id);
  notizTitel.textContent = `#${t.id}`;
  notizText.value = t.notiz || '';
  notizDialog.showModal();
}

async function saveNotiz() {
  if (!state.activeNotizId) return;
  try {
    await api(`/api/bugtracker/ticket/${state.activeNotizId}/notiz`, { notiz: notizText.value });
    await load();
    showToast('Notiz gespeichert');
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderBarChart(containerId, data, colorFn) {
  const container = document.getElementById(containerId);
  const entries = Object.entries(data);
  if (!entries.length) { container.innerHTML = ''; return; }
  const max = Math.max(...entries.map(([, v]) => v));
  container.innerHTML = entries.map(([label, val]) => {
    const pct = ((val / max) * 100).toFixed(1);
    const color = colorFn ? colorFn(label, val) : 'red';
    return `<div class="bar-row"><div class="bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</div><div class="bar-track"><div class="bar-fill ${color}" style="width:${pct}%"></div></div><div class="bar-val">${val}</div></div>`;
  }).join('');
}

function calcStats(openTickets) {
  const total = openTickets.length;
  const sortedAge = openTickets.map(t => t.alter_d).filter(v => typeof v === 'number').sort((a, b) => a - b);
  const median = sortedAge.length ? sortedAge[Math.floor(sortedAge.length / 2)] : 0;
  const max = sortedAge.length ? sortedAge[sortedAge.length - 1] : 0;
  const over1y = openTickets.filter(t => (t.alter_d || 0) > 365).length;
  const over3y = openTickets.filter(t => (t.alter_d || 0) > 1095).length;
  const over5y = openTickets.filter(t => (t.alter_d || 0) > 1825).length;
  const repro = openTickets.filter(t => (t.tags || []).includes('REPRO')).length;
  const aktiv = openTickets.filter(t => ['Wird bearbeitet', 'Wird getestet', 'Geprüft', 'Umsetzung geplant', 'In Überarbeitung'].includes(t.status)).length;

  const status = {};
  const haupt = {};
  const zuw = {};
  const jahre = {};
  const buckets = { '< 30 T': 0, '30-90 T': 0, '90-180 T': 0, '180-365 T': 0, '1-2 J': 0, '2-3 J': 0, '3-5 J': 0, '> 5 J': 0 };
  for (const t of openTickets) {
    status[t.status] = (status[t.status] || 0) + 1;
    if (t.haupt) haupt[t.haupt] = (haupt[t.haupt] || 0) + 1;
    const z = t.zuw || '(keine)';
    zuw[z] = (zuw[z] || 0) + 1;
    if (t.datum) {
      const y = String(t.datum).slice(0, 4);
      jahre[y] = (jahre[y] || 0) + 1;
    }
    const a = t.alter_d;
    if (typeof a !== 'number') continue;
    if (a < 30) buckets['< 30 T'] += 1;
    else if (a < 90) buckets['30-90 T'] += 1;
    else if (a < 180) buckets['90-180 T'] += 1;
    else if (a < 365) buckets['180-365 T'] += 1;
    else if (a < 730) buckets['1-2 J'] += 1;
    else if (a < 1095) buckets['2-3 J'] += 1;
    else if (a < 1825) buckets['3-5 J'] += 1;
    else buckets['> 5 J'] += 1;
  }

  return { total, median, max, over1y, over3y, over5y, repro, aktiv, status, haupt, zuw, jahre, buckets };
}

function renderKpis(stats) {
  kpiGrid.innerHTML = `
    <div class="kpi"><div class="kpi-label">Total offen</div><div class="kpi-value">${stats.total}</div><div class="kpi-sub">Tickets im System</div></div>
    <div class="kpi"><div class="kpi-label">Median-Alter</div><div class="kpi-value red">${(stats.median / 365).toFixed(1)} J</div><div class="kpi-sub">${stats.median} Tage</div></div>
    <div class="kpi"><div class="kpi-label">Ältester Eintrag</div><div class="kpi-value red">${(stats.max / 365).toFixed(1)} J</div><div class="kpi-sub">${stats.max} Tage</div></div>
    <div class="kpi"><div class="kpi-label">Über 1 Jahr alt</div><div class="kpi-value warn">${stats.over1y}</div><div class="kpi-sub">${Math.round((stats.over1y / (stats.total || 1)) * 100)}%</div></div>
    <div class="kpi"><div class="kpi-label">Über 3 Jahre alt</div><div class="kpi-value red">${stats.over3y}</div><div class="kpi-sub">${Math.round((stats.over3y / (stats.total || 1)) * 100)}%</div></div>
    <div class="kpi"><div class="kpi-label">Über 5 Jahre alt</div><div class="kpi-value red">${stats.over5y}</div><div class="kpi-sub">${Math.round((stats.over5y / (stats.total || 1)) * 100)}%</div></div>
    <div class="kpi"><div class="kpi-label">In Bearbeitung</div><div class="kpi-value ok">${stats.aktiv}</div><div class="kpi-sub">aktive Tickets</div></div>
    <div class="kpi"><div class="kpi-label">Repro-Bugs</div><div class="kpi-value warn">${stats.repro}</div><div class="kpi-sub">«Geschieht immer»</div></div>
  `;
}

function renderCategories(stats) {
  const defs = [
    ['VERGESSEN', 'Vergessen / Tot', 'Status «Bestätigt» und seit über drei Jahren nichts mehr passiert.'],
    ['TEST_BOTTLENECK', 'Test-Bottleneck', '«Bereit zum Testen» – aber seit mehr als 6 Monaten.'],
    ['TEST_NEU', 'Test offen (jung)', '«Bereit zum Testen» und unter 6 Monate alt.'],
    ['NIE_BEARBEITET', 'Nie bearbeitet', 'Status «Neu» und nie zugewiesen oder im Parkplatz.'],
    ['PING_PONG', 'Ping-Pong / Stuck', '«Zusatzinformationen angefordert» – Ball liegt beim Melder.'],
    ['BESTAETIGT_WARTET', 'Bestätigt (jünger)', 'Bestätigte Fehler, jünger als 3 Jahre.'],
    ['AKTIV', 'In Arbeit', 'Aktive Tickets in Bearbeitung / Test / Überarbeitung.'],
    ['TRIAGE', 'In Triage', '«Neu», aber bereits zugewiesen.'],
  ];
  catGrid.innerHTML = defs.map(([k, name, desc]) => {
    const count = stats.haupt[k] || 0;
    const pct = Math.round((count / (stats.total || 1)) * 100);
    return `<div class="cat-card" data-cat="${k}"><div class="cat-head"><div class="cat-name">${name}</div><div><span class="cat-count">${count}</span><span class="cat-pct">${pct}%</span></div></div><div class="cat-desc">${desc}</div><div class="cat-bar"><div class="cat-bar-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');

  catGrid.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      if (card.classList.contains('active')) {
        card.classList.remove('active');
        filterKat.value = '';
      } else {
        catGrid.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        filterKat.value = cat;
      }
      applyFilters();
      document.querySelector('.table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderCharts(stats) {
  const statusSorted = Object.fromEntries(Object.entries(stats.status).sort((a, b) => b[1] - a[1]));
  renderBarChart('chartStatus', statusSorted, (label) => {
    if (label === 'Bestätigt') return 'red';
    if (label === 'Bereit zum Testen') return 'warn';
    if (label === 'Neu') return 'info';
    if (label === 'Zusatzinformationen angefordert') return 'warn';
    if (['Wird bearbeitet', 'Wird getestet', 'Geprüft', 'Umsetzung geplant', 'In Überarbeitung'].includes(label)) return 'ok';
    return 'anth';
  });

  renderBarChart('chartAlter', stats.buckets, (label) => {
    if (label === '> 5 J' || label === '3-5 J') return 'red';
    if (label === '1-2 J' || label === '2-3 J') return 'warn';
    if (label === '180-365 T' || label === '90-180 T') return 'info';
    return 'ok';
  });

  const zuwTop = Object.fromEntries(Object.entries(stats.zuw).sort((a, b) => b[1] - a[1]).slice(0, 10));
  renderBarChart('chartZuw', zuwTop, (label) => ['(keine)', 'Parkplatz / nicht zugewiesen', 'Ticket Triage'].includes(label) ? 'red' : 'anth');

  const jahre = Object.fromEntries(Object.entries(stats.jahre).sort((a, b) => Number(a[0]) - Number(b[0])));
  const max = Math.max(...Object.values(jahre), 1);
  const tlEl = document.getElementById('chartJahre');
  tlEl.innerHTML = '<div class="timeline">' + Object.entries(jahre).map(([y, v]) => {
    const h = (v / max) * 100;
    return `<div class="tl-bar" style="height:${h}%" title="${y}: ${v}"><span class="tl-bar-val">${v}</span><span class="tl-bar-label">${y}</span></div>`;
  }).join('') + '</div>';
}

function initDropdowns() {
  const statusList = [...new Set(state.all.map(t => t.status))].sort((a, b) => a.localeCompare(b));
  filterStatus.innerHTML = '<option value="">Alle Status</option>' + statusList.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
}

async function load() {
  const data = await api('/api/bugtracker');
  state.all = (data.tickets || []).map(t => ({ ...t, tags: t.tags || [] }));
  initDropdowns();
  const openTickets = state.all.filter(t => !isClosed(t));
  const stats = calcStats(openTickets);
  renderKpis(stats);
  renderCategories(stats);
  renderCharts(stats);
  applyFilters();
}

searchInput.addEventListener('input', applyFilters);
filterStatus.addEventListener('change', applyFilters);
filterKat.addEventListener('change', applyFilters);
filterAlter.addEventListener('change', applyFilters);
filterTag.addEventListener('change', applyFilters);
filterClosed.addEventListener('change', applyFilters);

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterStatus.value = '';
  filterKat.value = '';
  filterAlter.value = '';
  filterTag.value = '';
  filterClosed.value = 'open';
  state.selected.clear();
  catGrid.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  applyFilters();
});

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (state.sortKey === k) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    else {
      state.sortKey = k;
      state.sortDir = (k === 'alter_d') ? 'desc' : 'asc';
    }
    document.querySelectorAll('th').forEach(x => x.classList.remove('sort-asc', 'sort-desc'));
    th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    sortData();
    render();
  });
});

cbAll.addEventListener('change', () => {
  const currentIds = state.filtered.slice((state.page - 1) * state.perPage, (state.page - 1) * state.perPage + state.perPage).map(t => String(t.id));
  if (cbAll.checked) currentIds.forEach(id => state.selected.add(id));
  else currentIds.forEach(id => state.selected.delete(id));
  render();
});

document.getElementById('bulkClose').addEventListener('click', () => openCloseDialog([...state.selected]));
document.getElementById('bulkReopen').addEventListener('click', () => reopenTickets([...state.selected]));
document.getElementById('bulkClear').addEventListener('click', () => { state.selected.clear(); render(); });

closeCancel.addEventListener('click', () => closeDialog.close());
closeConfirm.addEventListener('click', async () => {
  const ids = [...state.pendingCloseIds];
  closeDialog.close();
  await closeTickets(ids, closeReason.value.trim() || null);
});

notizCancel.addEventListener('click', () => notizDialog.close());
notizConfirm.addEventListener('click', async () => {
  notizDialog.close();
  await saveNotiz();
});

applyThemeFromQuery();
load().catch(e => showToast(e.message || 'Laden fehlgeschlagen', true));
