/* Warstwa analityczna (GA4): baner zgody, ścieżka użytkownika, konwersja formularza, błędy.
   Buduje się do assets/analytics.js (zminifikowany). */
(function () {
  'use strict';

  function lpSource() {
    var f = document.querySelector('form[action*="formspree.io"] input[name="source"]');
    if (f && f.value) return f.value;
    var m = document.querySelector('meta[name="kt:lp"]');
    if (m && m.content) return m.content;
    return 'root';
  }
  var LP = lpSource();

  function ev(name, params) {
    var p = params || {};
    p.source = LP;
    try { if (typeof gtag === 'function') gtag('event', name, p); } catch (e) {}
  }

  (function () {
    var KEY = 'kt-consent';
    var banner = document.getElementById('cookie-banner');
    var prefs = document.getElementById('cookie-prefs');
    var analyticsCb = document.getElementById('cookie-analytics');

    function apply(analyticsGranted) {
      var value = analyticsGranted ? 'granted' : 'denied';
      try { localStorage.setItem(KEY, value); } catch (e) {}
      try { if (typeof gtag === 'function') gtag('consent', 'update', { analytics_storage: value }); } catch (e) {}
      ev('cookie_consent', { choice: value });
      if (banner) banner.classList.add('hidden');
    }

    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (!stored && banner) banner.classList.remove('hidden');
    if (analyticsCb) analyticsCb.checked = (stored === 'granted');

    var settings = document.getElementById('cookie-settings');
    var accept = document.getElementById('cookie-accept');
    var reject = document.getElementById('cookie-reject');
    var save = document.getElementById('cookie-save');
    if (settings) settings.addEventListener('click', function () { if (prefs) prefs.classList.toggle('hidden'); });
    if (accept) accept.addEventListener('click', function () { apply(true); });
    if (reject) reject.addEventListener('click', function () { apply(false); });
    if (save) save.addEventListener('click', function () { apply(!!(analyticsCb && analyticsCb.checked)); });
  })();

  function linkText(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80); }
  document.querySelectorAll('a[href]').forEach(function (el) {
    var href = el.getAttribute('href') || '';
    el.addEventListener('click', function () {
      if (href.indexOf('tel:') === 0) ev('contact_click', { method: 'phone' });
      else if (href.indexOf('mailto:') === 0) ev('contact_click', { method: 'email' });
      else if (href.charAt(0) === '#') ev('navigation_click', { link_text: linkText(el), link_id: href });
      else if (/^https?:\/\//i.test(href) && href.indexOf(location.host) === -1) ev('outbound_click', { link_text: linkText(el), link_url: href });
    });
  });

  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.target.id && !seen[en.target.id]) {
          seen[en.target.id] = 1;
          ev('section_view', { section_id: en.target.id });
        }
      });
    }, { threshold: 0.1 }); // niski próg — sekcje wyższe niż viewport (mobile) też wyzwalają section_view
    document.querySelectorAll('section[id], header[id]').forEach(function (s) { io.observe(s); });
  }

  (function () {
    var marks = [25, 50, 75, 90], fired = {};
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      var pct = (h.scrollTop || window.pageYOffset) / max * 100;
      marks.forEach(function (m) { if (pct >= m && !fired[m]) { fired[m] = 1; ev('scroll_depth', { percent: m }); } });
      if (fired[90]) window.removeEventListener('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  var form = document.querySelector('form[action*="formspree.io"]');
  if (form) {
    var started = false;
    form.addEventListener('focusin', function () {
      if (!started) { started = true; ev('form_start', { form_id: 'kontakt' }); }
    });

    var status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.className = 'text-sm font-semibold hidden';
    form.appendChild(status);
    function showStatus(kind, msg) {
      status.textContent = msg;
      status.className = 'text-sm font-semibold ' + (kind === 'success' ? 'text-esAccent' : kind === 'error' ? 'text-red-600' : 'text-slate-500');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var oldLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Wysyłanie…'; }
      showStatus('pending', 'Wysyłanie…');

      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
        })
        .then(function (r) {
          if (r.ok) {
            ev('generate_lead', { form_id: 'kontakt', value: 1, currency: 'PLN' });
            showStatus('success', 'Dziękujemy! Wiadomość została wysłana — odezwę się wkrótce.');
            form.reset();
          } else {
            var msg = (r.data && r.data.errors && r.data.errors.map(function (x) { return x.message; }).join(', ')) || ('HTTP ' + r.status);
            ev('form_error', { form_id: 'kontakt', error: msg });
            if (typeof window.ktTrackError === 'function') window.ktTrackError('form_submit: ' + msg, false);
            showStatus('error', 'Nie udało się wysłać formularza. Spróbuj ponownie lub zadzwoń: +48 696 409 818.');
          }
        })
        .catch(function (err) {
          ev('form_error', { form_id: 'kontakt', error: String(err) });
          if (typeof window.ktTrackError === 'function') window.ktTrackError('form_network: ' + err, false);
          showStatus('error', 'Problem z połączeniem. Spróbuj ponownie lub zadzwoń: +48 696 409 818.');
        })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = oldLabel; } });
    });
  }
})();
