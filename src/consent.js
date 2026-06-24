/*
 * Bootstrap analityki — Google Consent Mode v2 + GA4 + przechwytywanie błędów.
 * Ładowany jak najwcześniej w <head>. Buduje się do assets/consent.js (zminifikowany).
 * Globalne (gtag/dataLayer/ktTrackError) trzymane na window, by przetrwały minifikację.
 */
window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };

gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
try {
  if (localStorage.getItem('kt-consent') === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  }
} catch (e) {}

window.ktTrackError = function (description, fatal) {
  try { gtag('event', 'exception', { description: String(description).slice(0, 480), fatal: !!fatal }); } catch (e) {}
};
window.addEventListener('error', function (e) {
  if (e && e.target && e.target !== window && /^(IMG|SCRIPT|LINK|SOURCE)$/.test(e.target.tagName || '')) {
    window.ktTrackError('resource_error: ' + (e.target.currentSrc || e.target.src || e.target.href || e.target.tagName), false);
  } else if (e && e.message) {
    window.ktTrackError('js_error: ' + e.message + ' @ ' + (e.filename || '') + ':' + (e.lineno || 0), false);
  }
}, true);
window.addEventListener('unhandledrejection', function (e) {
  var r = e && e.reason;
  window.ktTrackError('promise_rejection: ' + ((r && (r.message || r)) || 'unknown'), false);
});

var GA_ID = 'G-S7201YNKYS';
if (GA_ID) {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID);
}
