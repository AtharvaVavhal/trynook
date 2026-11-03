(function () {
  'use strict';

  // Where the form posts. Create a free form at https://formspree.io (it emails you each
  // submission) and paste its URL here, e.g. 'https://formspree.io/f/abcdwxyz'.
  // While this is empty, the form falls back to opening the visitor's mail app.
  var FORM_ENDPOINT = '';
  var FALLBACK_EMAIL = 'hello@trynook.in';

  var dlg = document.getElementById('contact');
  var form = document.getElementById('contact-form');
  if (!dlg || !form || typeof dlg.showModal !== 'function') return; // old browser: mailto links still work

  var status = document.getElementById('cf-status');
  var submit = document.getElementById('cf-submit');
  var lastFocus = null;

  function open(e) {
    e.preventDefault();
    lastFocus = document.activeElement;
    status.textContent = '';
    status.className = 'form-msg';
    dlg.showModal();
    document.getElementById('cf-name').focus();
  }
  function close() { dlg.close(); if (lastFocus) lastFocus.focus(); }

  Array.prototype.forEach.call(document.querySelectorAll('a.btn[href^="mailto:"]'), function (a) {
    a.addEventListener('click', open);
  });
  document.getElementById('contact-close').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); }); // backdrop click

  function fail(msg) { status.textContent = msg; status.className = 'form-msg err'; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim(), email = f.email.value.trim(), message = f.message.value.trim();
    if (!name || !message) return fail('Please enter your name and a message.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Please enter a valid email address.');
    if (f._gotcha.value) return; // bot

    if (!FORM_ENDPOINT) { // not configured yet: hand off to the mail app
      var body = message + '\n\n— ' + name + ' (' + email + (f.phone.value ? ', ' + f.phone.value : '') + ')';
      window.location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent('Hello nook, from ' + name) +
        '&body=' + encodeURIComponent(body);
      return;
    }

    submit.disabled = true;
    status.className = 'form-msg';
    status.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      form.reset();
      status.className = 'form-msg ok';
      status.textContent = 'Thanks! We’ve got your message and will reply soon.';
    }).catch(function () {
      fail('Something went wrong. Please try again, or email ' + FALLBACK_EMAIL + '.');
    }).then(function () { submit.disabled = false; });
  });
})();
