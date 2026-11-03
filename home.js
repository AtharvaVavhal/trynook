(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function inView(el, cb, th) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (e) { cb(e[0].isIntersecting); }, { threshold: th || 0.35 }).observe(el);
  }
  function fmt(n) { return Math.round(n).toLocaleString('en-IN'); }
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = pre + fmt(to) + suf; return; }
    var t0 = null;
    function f(t) { if (t0 === null) t0 = t; var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(to * e) + suf; if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }

  /* ---- scroll progress ---- */
  var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  var tick = false;
  function onScroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')'; tick = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- hero parallax tilt ---- */
  var stage = $('#stage');
  if (stage && !reduce && window.matchMedia('(hover: hover)').matches) {
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      stage.style.setProperty('--rx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      stage.style.setProperty('--ry', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    stage.addEventListener('pointerleave', function () { stage.style.setProperty('--rx', 0); stage.style.setProperty('--ry', 0); });
  }

  /* ---- card spotlight ---- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.mini,.mods li,.trio li,.jcard,.recs div,.people li');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---- compare slider ---- */
  var cmp = $('#cmp');
  if (cmp) {
    var range = $('.cmp-range', cmp), base = window.innerWidth < 560 ? 18 : 50;
    range.value = base; cmp.style.setProperty('--x', base + '%');
    range.addEventListener('input', function () { cmp.style.setProperty('--x', range.value + '%'); });
    inView(cmp, function (v) {
      if (!v || reduce || cmp.getAttribute('data-hint')) return;
      cmp.setAttribute('data-hint', '1');
      var t0 = null;
      (function step(t) { if (t0 === null) t0 = t; var p = Math.min(1, (t - t0) / 1600);
        var v2 = base + Math.sin(p * Math.PI * 2) * 22 * (1 - p * 0.3); range.value = v2; cmp.style.setProperty('--x', v2 + '%');
        if (p < 1) requestAnimationFrame(step); else { range.value = base; cmp.style.setProperty('--x', base + '%'); } })(performance.now());
    }, 0.6);
  }

  /* ---- product tour ---- */
  var tour = $('#tour');
  if (tour) {
    var tabs = $$('.tab', tour), panels = $$('.panel', tour), DUR = 7000, cur = 0, timer = null, paused = false, visible = false, plTimer = null, touched = false;
    var beds = $$('.tplan .bed.free', tour), tpT = $('#tp-title'), tpS = $('#tp-sub'), bi = 0;
    function selBed(b) { beds.forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); tpT.textContent = b.getAttribute('data-bed'); tpS.textContent = b.getAttribute('data-pos'); }
    beds.forEach(function (b) { b.addEventListener('click', function () { touched = true; clearInterval(plTimer); selBed(b); }); });
    selBed(beds[Math.min(3, beds.length - 1)]);

    var chk = $$('#chk li'), chTimers = [];
    function runChk() {
      chTimers.forEach(clearTimeout); chTimers = []; chk.forEach(function (li) { li.classList.remove('done'); });
      chk.forEach(function (li, i) { chTimers.push(setTimeout(function () { li.classList.add('done'); }, reduce ? 0 : 450 + i * 650)); });
    }
    $('#replay').addEventListener('click', runChk);

    function enter(i) {
      clearInterval(plTimer);
      if (i === 0 && !touched && !reduce) plTimer = setInterval(function () { bi = (bi + 1) % beds.length; selBed(beds[bi]); }, 1700);
      if (i === 1) runChk();
      if (i === 2 || i === 3) { $$('[data-count]', panels[i]).forEach(countUp); $$('.arc', panels[i]).forEach(function (a) { a.setAttribute('stroke-dasharray', '0 100'); setTimeout(function () { a.setAttribute('stroke-dasharray', a.getAttribute('data-v') + ' 100'); }, 60); }); }
      var bars = $('.bars', panels[i]); if (bars) { bars.classList.remove('go'); void bars.offsetWidth; bars.classList.add('go'); }
    }
    function show(i) {
      cur = i;
      tabs.forEach(function (t, k) { var on = k === i; t.classList.remove('on'); if (on) { void t.offsetWidth; t.classList.add('on'); } t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; p.classList.toggle('on', k === i); });
      enter(i); schedule();
    }
    function schedule() { clearTimeout(timer); if (reduce || paused || !visible) return; timer = setTimeout(function () { show((cur + 1) % tabs.length); }, DUR); }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { show(k); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (k + 1) % tabs.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (k + tabs.length - 1) % tabs.length;
        if (n !== null) { e.preventDefault(); show(n); tabs[n].focus(); }
      });
    });
    function pause(p) { paused = p; tour.classList.toggle('paused', p); if (p) clearTimeout(timer); else show(cur); }
    tour.addEventListener('pointerenter', function () { pause(true); });
    tour.addEventListener('pointerleave', function () { pause(false); });
    tour.addEventListener('focusin', function () { pause(true); });
    tour.addEventListener('focusout', function () { pause(false); });
    if (reduce) tour.classList.add('static');
    inView(tour, function (v) { visible = v; if (v) show(cur); else { clearTimeout(timer); clearInterval(plTimer); } }, 0.3);
  }

  /* ---- ledger playground ---- */
  var play = $('#play');
  if (play) {
    var rowsEl = $('#pl-rows'), balEl = $('#pl-bal'), pillEl = $('#pl-pill'), rcptEl = $('#pl-rcpt');
    var form = $('#pform'), msg = $('#pf-msg'), amt = $('#pf-amt'), meth = $('#pf-m'), refWrap = $('#pf-refwrap'), ref = $('#pf-ref');
    var entries, day, rc;
    function reset() {
      entries = [
        { k: 'c', d: '1 Oct', t: 'Rent · October', a: 8000 },
        { k: 'p', d: '3 Oct', t: 'Payment · UPI', a: 8000, r: 'R-0001', ref: 'UPI-48213' },
        { k: 'c', d: '1 Nov', t: 'Rent · November', a: 8000 }
      ]; day = 6; rc = 1; msg.textContent = ''; msg.className = 'form-msg'; amt.value = 5000; ref.value = ''; render();
    }
    function bal() { return entries.reduce(function (s, e) { return s + (e.k === 'c' ? e.a : e.k === 'p' ? -e.a : e.a); }, 0); }
    function render() {
      var html = '';
      entries.forEach(function (e, i) {
        var cls = e.k === 'c' ? 'dr' : e.k === 'p' ? 'cr' : 'dr', sign = e.k === 'p' ? '− ' : e.k === 'v' ? '+ ' : '';
        html += '<li class="' + (e.rev ? 'rev' : '') + (e.k === 'v' ? ' vv' : '') + '"><span class="dt">' + e.d + '</span><span class="ds">' + e.t + (e.r ? ' <small>' + e.r + (e.ref ? ' · ' + e.ref : '') + '</small>' : '') + '</span><span class="am ' + cls + '">' + sign + '₹ ' + fmt(e.a) + '</span>' +
          (e.k === 'p' && !e.rev ? '<button type="button" class="rv" data-i="' + i + '">Reverse</button>' : '<span></span>') + '</li>';
      });
      rowsEl.innerHTML = html;
      var b = bal(); balEl.textContent = '₹ ' + fmt(b);
      pillEl.textContent = b === 0 ? 'Settled' : (b < 8000 ? 'Partly paid' : 'Unpaid'); pillEl.className = 'pill ' + (b === 0 ? 'ok' : 'warn');
      var last = entries.filter(function (e) { return e.r && e.k === 'p' && !e.rev; }).pop(); rcptEl.textContent = last ? 'Latest receipt ' + last.r : '';
    }
    function say(t, ok) { msg.textContent = t; msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); }
    meth.addEventListener('change', function () { refWrap.hidden = meth.value === 'Cash'; });
    $$('.chips button').forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-amt'); amt.value = v === 'full' ? Math.max(bal(), 0) : v; }); });
    rowsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.rv'); if (!b) return;
      var o = entries[+b.getAttribute('data-i')]; o.rev = true;
      entries.push({ k: 'v', d: (day++) + ' Nov', t: 'Reversal of ' + o.r, a: o.a });
      render(); say('Reversed. The original stays visible and the balance is restored.', true);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = Math.round(parseFloat(amt.value)), m = meth.value, r = ref.value.trim(), b = bal();
      if (!a || a <= 0) return say('Enter an amount.', false);
      if (m !== 'Cash' && !r) return say('A reference is required for UPI and bank payments.', false);
      if (m !== 'Cash') { var dup = entries.filter(function (x) { return x.ref && x.ref.toLowerCase() === r.toLowerCase(); })[0]; if (dup) return say('Refused: that reference is already recorded on receipt ' + dup.r + '.', false); }
      if (b <= 0) return say('Nothing is owed right now.', false);
      if (a > b) return say('Refused: that is more than the ₹ ' + fmt(b) + ' still owed. A payment can’t be allocated beyond what remains.', false);
      var no = 'R-' + ('000' + (++rc)).slice(-4);
      entries.push({ k: 'p', d: (day++) + ' Nov', t: 'Payment · ' + (m === 'Bank transfer' ? 'Bank' : m), a: a, r: no, ref: m === 'Cash' ? '' : r });
      render(); ref.value = ''; say('Recorded. Receipt ' + no + ' issued.', true);
    });
    $('#pf-reset').addEventListener('click', reset);
    reset();
  }

  /* ---- building ---- */
  var bld = $('.bld');
  if (bld) {
    var data = { '3': ['Floor 3', 6, 24, 19, 1], '2': ['Floor 2', 8, 32, 29, 3], '1': ['Floor 1', 8, 32, 27, 4], 'G': ['Ground floor', 6, 24, 20, 2] };
    var floors = $$('.fl', bld), t = $('#fc-t'), pl = $('#fc-p'), mt = $('#fc-m'), r = $('#fc-r'), o = $('#fc-o'), d = $('#fc-d'), fi = 0, ft = null, ftouched = false;
    function pick(key) {
      var v = data[key], pct = Math.round(v[3] / v[2] * 100);
      floors.forEach(function (f) { f.classList.toggle('sel', f.getAttribute('data-f') === key); });
      bld.classList.add('has-sel');
      t.textContent = v[0]; r.textContent = v[1]; o.textContent = v[3] + ' of ' + v[2]; d.textContent = v[4]; mt.style.width = pct + '%';
      pl.textContent = pct >= 90 ? 'Almost full' : pct >= 80 ? 'Mostly full' : 'Space available';
    }
    floors.forEach(function (f, i) {
      function go() { ftouched = true; clearInterval(ft); pick(f.getAttribute('data-f')); }
      f.addEventListener('click', go); f.addEventListener('mouseenter', go);
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    pick('2');
    inView(bld, function (v) {
      bld.classList.toggle('lit', v || bld.classList.contains('lit'));
      clearInterval(ft);
      if (v && !ftouched && !reduce) ft = setInterval(function () { fi = (fi + 1) % floors.length; pick(floors[fi].getAttribute('data-f')); }, 2400);
    }, 0.4);
  }
})();
