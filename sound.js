/* Ambient soundtrack for the Nook countdown page.
 *
 * Behaviour
 *  - Loaded synchronously from <head>: the Audio element is created and play() is called while the document
 *    is still being parsed, before the DOM, fonts, doorway SVG or countdown exist. The button is wired up
 *    afterwards, on DOMContentLoaded. Fades in over ~2.6 s once playback has actually begun.
 *  - If the browser blocks audible autoplay (NotAllowedError) the page waits for the visitor's first
 *    click / key press, retries exactly once, and never retries on its own again.
 *  - An explicit mute is remembered for the session (sessionStorage) and is never overridden.
 *  - One Audio element, created once. The countdown code is separate and never touches it.
 *  - If the file is missing or cannot be decoded, the sound button stays hidden and nothing else changes.
 */
(function () {
  'use strict';
  if (window.__nookSound) return;           // never create a second player
  window.__nookSound = true;

  var SRC = 'assets/audio/nook-ambient.mp3';
  var KEY = 'nook:sound';                    // 'on' | 'off' (explicit choice, this session only)
  var TARGET = 0.5;                          // playback level (the file itself is mastered quietly)
  var FADE_IN = 2600, FADE_OUT = 450;

  var btn = null, label = null, status = null;   // bound on DOMContentLoaded (the script runs before they exist)

  function mark(name) { try { performance.mark('nook-sound:' + name); } catch (e) { /* ignore */ } }
  mark('script-start');

  var LABELS = {
    playing: { text: 'Sound on',      aria: 'Sound on. Press to mute.' },
    off:     { text: 'Sound off',     aria: 'Sound off. Press to turn on.' },
    waiting: { text: 'Tap for sound', aria: 'Sound is ready. Your browser needs a click or key press to start it. Press to start.' }
  };

  var audio = null;
  var state = 'loading';                     // loading | playing | off | waiting | unavailable
  var fadeRaf = 0;
  var armed = false;                         // first-interaction listeners attached
  var retryUsed = false;                     // the single automatic retry has been spent
  var starting = false;
  var internalPause = false;
  var hiddenPause = false;

  function getPref() { try { return window.sessionStorage.getItem(KEY); } catch (e) { return null; } }
  function setPref(v) { try { window.sessionStorage.setItem(KEY, v); } catch (e) { /* storage unavailable: fine */ } }

  function render(announce) {
    if (!btn) return;                          // not bound yet; bind() renders the current state
    btn.dataset.state = state;
    if (state === 'unavailable' || state === 'loading') { btn.hidden = true; return; }
    var l = LABELS[state];
    btn.hidden = false;
    btn.setAttribute('aria-pressed', state === 'playing' ? 'true' : 'false');
    btn.setAttribute('aria-label', l.aria);
    if (label) label.textContent = l.text;
    if (announce && status) status.textContent = l.text;
  }
  function setState(s, announce) { state = s; render(announce); }

  /* ---------- volume ---------- */
  function fadeTo(target, ms, done) {
    cancelAnimationFrame(fadeRaf);
    if (!audio) return;
    var from = audio.volume, t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / ms);
      var e = k * k * (3 - 2 * k);           // smoothstep
      try { audio.volume = from + (target - from) * e; } catch (err) { /* iOS: volume is read-only */ }
      if (k < 1) fadeRaf = requestAnimationFrame(step);
      else if (done) done();
    })(t0);
  }

  /* ---------- playback ---------- */
  function makeAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    try { audio.volume = 0; } catch (e) { /* ignore */ }
    audio.addEventListener('error', unavailable);
    audio.addEventListener('loadedmetadata', function () { mark('loadedmetadata'); });
    audio.addEventListener('canplay', function () { mark('canplay'); });
    audio.addEventListener('playing', function () { mark('playing'); });
    audio.addEventListener('timeupdate', function onTime() {
      if (audio.currentTime > 0.05) { mark('audible-clock-advancing'); audio.removeEventListener('timeupdate', onTime); }
    });
    audio.addEventListener('pause', function () {
      // paused by something other than us (media keys, OS interruption): reflect it, keep the choice session-only
      if (!internalPause && !hiddenPause && state === 'playing') setState('off', true);
    });
    audio.src = SRC;
    return audio;
  }

  function unavailable() {
    if (state === 'unavailable') return;
    state = 'unavailable'; render();
    disarm();
    if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } }
    if (window.console && console.info) console.info('[nook] Soundtrack unavailable; continuing silently.');
  }

  function start(fromGesture) {
    if (starting || state === 'unavailable') return;
    starting = true;
    makeAudio();
    internalPause = false;
    var p;
    mark(fromGesture ? 'play-call-gesture' : 'play-call');
    try { p = audio.play(); } catch (e) { starting = false; unavailable(); return; }
    (p && p.then ? p : Promise.resolve()).then(function () {
      starting = false;
      mark('play-resolved');
      if (state === 'off') { stopNow(); return; }          // muted while the request was in flight
      setState('playing', !!fromGesture);
      fadeTo(TARGET, FADE_IN);
    }).catch(function (err) {
      starting = false;
      if (err && err.name === 'NotAllowedError') { blocked(fromGesture); }
      else if (err && err.name === 'AbortError') { /* interrupted by a pause(): ignore */ }
      else { unavailable(); }
    });
  }

  function stopNow() {
    cancelAnimationFrame(fadeRaf);
    internalPause = true;
    try { audio.pause(); } catch (e) { /* ignore */ }
  }

  function mute() {
    setPref('off'); disarm();
    setState('off', true);
    fadeTo(0, FADE_OUT, function () { if (state === 'off') stopNow(); });
  }

  /* ---------- blocked autoplay: wait for the first meaningful interaction ---------- */
  function blocked(fromGesture) {
    setState('waiting', false);
    if (fromGesture || retryUsed) return;      // a gesture-initiated attempt failed: stay waiting, no more retries
    arm();
  }
  function onFirstInteraction(e) {
    if (btn && btn.contains(e.target)) { disarm(); return; }       // the button handles itself
    if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Escape')) return;
    disarm();
    retryUsed = true;                                       // exactly one automatic retry
    if (getPref() === 'off' || state !== 'waiting') return;
    start(false);
  }
  function arm() {
    if (armed) return;
    armed = true;
    document.addEventListener('click', onFirstInteraction, true);
    document.addEventListener('keydown', onFirstInteraction, true);
  }
  function disarm() {
    if (!armed) return;
    armed = false;
    document.removeEventListener('click', onFirstInteraction, true);
    document.removeEventListener('keydown', onFirstInteraction, true);
  }

  /* ---------- the button (wired once the DOM exists) ---------- */
  function onButton() {
    if (state === 'playing') { mute(); return; }
    // off or waiting: the visitor asked for sound
    setPref('on'); disarm(); retryUsed = true;
    if (!audio) makeAudio();
    setState('waiting', false);
    start(true);
  }
  function bind() {
    btn = document.getElementById('sound');
    if (!btn) return;
    label = btn.querySelector('.sound-label');
    status = document.getElementById('sound-status');
    btn.addEventListener('click', onButton);
    render(false);
  }

  /* pause while the tab is hidden, resume when it returns (respecting mute) */
  document.addEventListener('visibilitychange', function () {
    if (!audio || state !== 'playing' && !hiddenPause) return;
    if (document.hidden) {
      if (state === 'playing') { hiddenPause = true; fadeTo(0, 300, function () { internalPause = true; audio.pause(); }); }
    } else if (hiddenPause) {
      hiddenPause = false;
      if (getPref() === 'off') return;
      internalPause = false;
      var p = audio.play();
      if (p && p.then) p.then(function () { fadeTo(TARGET, 1200); }).catch(function () { setState('waiting', false); });
    }
  });

  /* ---------- boot: runs immediately, not on load ---------- */
  if (getPref() === 'off') {
    state = 'off';                             // explicit mute from earlier in this session: no download, no playback
  } else {
    start(false);                              // first playback attempt, right now
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
