(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- interactive floor plan ---- */
  var plan = $('#plan');
  if (plan) {
    var beds = $$('.bed.free', plan), title = $('#pi-title'), sub = $('#pi-sub'), pill = $('#pi-pill');
    var touched = false, timer = null, i = 0;
    function select(b) {
      beds.forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('sel'); b.setAttribute('aria-pressed', 'true');
      title.textContent = b.getAttribute('data-bed');
      sub.textContent = b.getAttribute('data-pos');
      pill.textContent = 'Available';
    }
    beds.forEach(function (b) { b.addEventListener('click', function () { touched = true; stop(); select(b); }); });
    select(beds[Math.min(3, beds.length - 1)]);
    function step() { i = (i + 1) % beds.length; select(beds[i]); }
    function start() { if (!timer && !touched && !reduce) timer = setInterval(step, 2200); }
    function stop() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: 0.4 }).observe(plan);
    }
  }

  /* ---- count-up numbers, donut, bars, ledger: start when visible ---- */
  function fmt(n) { return Math.round(n).toLocaleString('en-IN'); }
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = pre + fmt(to) + suf; return; }
    var t0 = null, dur = 1400;
    function f(t) { if (t0 === null) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(to * e) + suf; if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  function activate(card) {
    card.classList.add('in');
    $$('[data-count]', card).forEach(countUp);
    $$('.arc', card).forEach(function (a) { a.setAttribute('stroke-dasharray', a.getAttribute('data-v') + ' 100'); });
  }
  var cards = $$('#ledger, #dash');
  if (!('IntersectionObserver' in window) || reduce) { cards.forEach(function (c) { activate(c); }); return; }
  $$('.js #ledger [data-count], #dash [data-count]').forEach(function (el) { el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || ''); });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.35 });
  cards.forEach(function (c) { io.observe(c); });
})();
