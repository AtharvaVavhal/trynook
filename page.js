(function () {
  'use strict';

  /* mobile menu */
  var nav = document.querySelector('.nav'), btn = document.querySelector('.menu');
  if (nav && btn) {
    function set(open) { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('nav a')) set(false); });
  }

  /* FAQ search */
  var input = document.getElementById('fsearch');
  if (input) {
    var items = Array.prototype.slice.call(document.querySelectorAll('.qa')), none = document.getElementById('fnone');
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-g]'));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
        d.hidden = !hit; if (hit) shown++;
        if (q && hit) d.open = true; else if (!q) d.open = false;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('.qa:not([hidden])'); });
      none.hidden = shown !== 0;
    });
  }

  /* table-of-contents highlight */
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) map[s.id] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
        var a = map[e.target.id]; if (a) { a.classList.add('on'); a.setAttribute('aria-current', 'true'); }
      }
    });
  }, { rootMargin: '-20% 0px -65% 0px' });
  Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
})();
