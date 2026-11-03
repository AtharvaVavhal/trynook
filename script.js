(function () {
  'use strict';

  // 4 November 2026, 12:00 PM Asia/Kolkata. IST is a fixed UTC+05:30 offset (no DST),
  // so this ISO string denotes one absolute instant regardless of the visitor's timezone.
  var LAUNCH_ISO = '2026-11-04T12:00:00+05:30';
  var LAUNCH_MS = Date.parse(LAUNCH_ISO);

  // Pure: remaining time split into units. Exposed for testing.
  function breakdown(remainingMs) {
    var total = Math.max(0, Math.floor(remainingMs / 1000));
    return {
      done: remainingMs <= 0,
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60
    };
  }

  // Optional preview override: ?now=2026-11-04T11:59:55+05:30 (use an explicit offset).
  // It only changes what this page displays; it never affects other visitors.
  function startOffset() {
    try {
      var p = new URLSearchParams(window.location.search).get('now');
      if (p) {
        var t = Date.parse(p);
        if (!isNaN(t)) return t - Date.now();
      }
    } catch (e) { /* ignore */ }
    return 0;
  }

  window.NookCountdown = { LAUNCH_MS: LAUNCH_MS, breakdown: breakdown };

  var els = {
    d: document.getElementById('d'),
    h: document.getElementById('h'),
    m: document.getElementById('m'),
    s: document.getElementById('s'),
    timer: document.getElementById('timer'),
    launched: document.getElementById('launched'),
    announce: document.getElementById('announce')
  };
  if (!els.d || !els.timer) return;

  var offset = startOffset();
  var lastAnnounced = -1;
  var timeoutId = null;

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  function now() { return Date.now() + offset; }

  // Only touch the DOM when a value changes; animate the change (never on first paint).
  var hasRendered = false;
  function setNum(el, text) {
    if (el.textContent === text) return;
    el.textContent = text;
    if (hasRendered) {
      el.classList.remove('tick');
      void el.offsetWidth;            // restart the animation
      el.classList.add('tick');
    }
  }

  function render() {
    var r = breakdown(LAUNCH_MS - now());

    if (r.done) {
      // Launch time reached: go to the full site (preserves ?now= previews for testing).
      try { window.location.replace('site.html' + window.location.search); return false; } catch (e) { /* fall through */ }
      els.timer.hidden = true;
      els.launched.hidden = false;
      if (lastAnnounced !== -2) {
        els.announce.textContent = 'nook has launched.';
        lastAnnounced = -2;
      }
      return false; // stop ticking
    }

    els.timer.hidden = false;
    els.launched.hidden = true;
    setNum(els.d, pad(r.days));
    setNum(els.h, pad(r.hours));
    setNum(els.m, pad(r.minutes));
    setNum(els.s, pad(r.seconds));
    hasRendered = true;

    // Screen readers: update once per minute, not every second.
    var minuteKey = r.days * 1440 + r.hours * 60 + r.minutes;
    if (minuteKey !== lastAnnounced) {
      lastAnnounced = minuteKey;
      els.announce.textContent = plural(r.days, 'day') + ', ' + plural(r.hours, 'hour') + ', ' +
        plural(r.minutes, 'minute') + ' until launch.';
    }
    return true;
  }

  // Align ticks to the real second boundary so the display never skips or lags.
  function tick() {
    if (!render()) return;
    var msIntoSecond = (LAUNCH_MS - now()) % 1000;
    var delay = msIntoSecond <= 0 ? 1000 + msIntoSecond : msIntoSecond;
    timeoutId = setTimeout(tick, Math.max(20, delay + 5));
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { clearTimeout(timeoutId); tick(); }
  });

  tick();
})();
