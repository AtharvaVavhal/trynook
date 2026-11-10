import { platforms, categories } from './platforms.js';

const paths = {
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M8 16h8"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
  book: '<path d="M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/>',
  pulse: '<path d="M2 12h4l3-8 6 16 3-8h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
const icon = (key) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key]}</svg>`;
const $ = (id) => document.getElementById(id);
const known = platforms.filter((p) => p.url);
const categoryName = (id) => categories.find((c) => c.id === id)?.label;
const makeLink = (p, text) => { const a = document.createElement('a'); a.href = p.url; a.textContent = text; return a; };

// Content is created from a trusted, checked-in configuration. User input is
// used only for comparison and never inserted into markup.
const cards = platforms.map((p, i) => {
  const card = document.createElement('article');
  card.className = `platform-card${p.url ? '' : ' pending-card'}`;
  card.id = `platform-${p.id}`;
  card.setAttribute('aria-labelledby', `title-${p.id}`);
  card.innerHTML = `<div class="card-top"><span class="platform-icon">${icon(p.icon)}</span><span class="status"><span class="status-dot"></span>${p.status}</span></div><p class="card-category">${categoryName(p.category) || 'AWAITING DETAILS'}<span>${String(i + 1).padStart(2, '0')}</span></p><h3 id="title-${p.id}">${p.name}</h3><p class="card-description">${p.description}</p>`;
  const bottom = document.createElement('div'); bottom.className = 'card-bottom';
  if (p.url) {
    const link = makeLink(p, '');
    link.className = 'platform-link';
    link.setAttribute('aria-label', `Explore ${p.name} — ${new URL(p.url).hostname}`);
    const host = document.createElement('span'); host.textContent = new URL(p.url).hostname;
    link.append(host); const arrow = document.createElement('span'); arrow.className = 'card-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); link.append(arrow); bottom.append(link);
  } else { bottom.textContent = 'Destination not yet configured'; }
  if (p.note) { const note = document.createElement('p'); note.className = 'access-note'; note.textContent = p.note; card.append(note); }
  card.append(bottom); $('platform-grid').append(card);
  return { p, card };
});

let category = 'all';
const filterButtons = categories.map((c) => {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = c.label;
  b.setAttribute('aria-pressed', String(c.id === category));
  b.addEventListener('click', () => { category = c.id; update(); }); $('filters').append(b);
  return { c, b };
});
function update() {
  const query = $('search').value.trim().toLocaleLowerCase();
  let visible = 0;
  cards.forEach(({ p, card }) => {
    const matches = (category === 'all' || p.category === category) && `${p.name} ${p.description} ${p.url || ''} ${categoryName(p.category) || ''}`.toLocaleLowerCase().includes(query);
    card.hidden = !matches; if (matches) visible++;
  });
  filterButtons.forEach(({ c, b }) => b.setAttribute('aria-pressed', String(category === c.id)));
  $('result-count').textContent = query || category !== 'all' ? `${visible} ${visible === 1 ? 'platform' : 'platforms'} found` : `${known.length} platforms to explore · ${platforms.length - known.length} awaiting details`;
  $('empty').hidden = visible !== 0;
}
$('search').addEventListener('input', update);
$('reset').addEventListener('click', () => { $('search').value = ''; category = 'all'; update(); $('search').focus(); });
$('discovery').hidden = false; update();

known.forEach((p) => {
  const node = makeLink(p, ''); node.className = `atlas-node node-${p.id}`;
  node.innerHTML = `${icon(p.icon)}<span>${p.short}</span><span class="node-arrow" aria-hidden="true">↗</span>`;
  node.setAttribute('aria-label', `Explore ${p.name}`); $('atlas-nodes').append(node);
  $('footer-links').append(makeLink(p, p.name));
});
categories.filter((c) => c.id !== 'all').forEach((c, i) => {
  const group = document.createElement('div'); group.className = 'tree-group';
  const label = document.createElement('h3'); label.innerHTML = `<span>0${i + 1}</span>${c.label}`; group.append(label);
  known.filter((p) => p.category === c.id).forEach((p) => { const a = makeLink(p, ''); a.innerHTML = `${icon(p.icon)}<span>${p.name}</span><span aria-hidden="true">↗</span>`; group.append(a); });
  $('tree-groups').append(group);
});
$('year').textContent = new Date().getFullYear();
const menu = document.querySelector('.menu-toggle');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); $('navigation').classList.remove('is-open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); $('navigation').classList.toggle('is-open', open); });
$('navigation').addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.addEventListener('click', (e) => { if (!e.target.closest('.header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
const sentinel = document.createElement('div'); sentinel.className = 'scroll-sentinel'; document.body.prepend(sentinel);
if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => $('header').classList.toggle('scrolled', !entry.isIntersecting)).observe(sentinel);
