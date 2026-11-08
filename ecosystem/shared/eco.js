/* Nook ecosystem — shared progressive enhancement.
   No routing happens here: each hostname is mapped to its page on the server
   (vercel.json). This only reveals content as it scrolls into view. */
(function () {
  'use strict';
  var els = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showAll() { for (var i = 0; i < els.length; i++) els[i].classList.add('in'); }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  for (var i = 0; i < els.length; i++) io.observe(els[i]);
  // Safety net: never leave content hidden (e.g. print, unusual viewports).
  window.addEventListener('beforeprint', showAll);
})();
