/* Ayat Ahmed Osman portfolio: interactions */
(function () {
  'use strict';

  /* ---- Configuration: fill these in when the real assets are supplied ---- */
  var CONFIG = {
    cvUrl: '',            // e.g. 'assets/cv/Ayat-Ahmed-Osman-CV.pdf'. Opens in a new tab (view only).
    links: { email: '', linkedin: '', behance: '', other: '' }, // verified URLs; email as 'mailto:name@example.com'
    formEndpoint: ''      // e.g. a Formspree/Getform URL. Until set, nothing is sent and no success is shown.
  };

  var doc = document.documentElement;
  var T = window.TRANSLATIONS || { en: {}, ar: {} };
  var lang = 'en';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function t(key) { return (T[lang] && T[lang][key]) || (T.en && T.en[key]) || key; }

  /* ---- Toast ---- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---- Language ---- */
  function applyLang(l, persist) {
    lang = l === 'ar' ? 'ar' : 'en';
    doc.lang = lang; doc.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length === 2) el.setAttribute(p[0], t(p[1]));
      });
    });
    $$('[data-i18n-title]').forEach(function (el) { document.title = t(el.getAttribute('data-i18n-title')); });
    $$('[data-i18n-meta]').forEach(function (el) { el.setAttribute('content', t(el.getAttribute('data-i18n-meta'))); });
    var lt = $('#lang-toggle');
    if (lt) lt.setAttribute('aria-label', lang === 'ar' ? 'Switch language to English' : 'Switch language to Arabic');
    var menu = $('#menu-toggle');
    if (menu) menu.setAttribute('aria-label', t(menu.getAttribute('data-i18n-attr') ? 'a11y.menu' : 'a11y.menu'));
    if (persist) { try { localStorage.setItem('ayat-lang', lang); } catch (e) {} }
    updateErrors();
  }
  var saved = null;
  try { saved = localStorage.getItem('ayat-lang'); } catch (e) {}
  applyLang(saved === 'ar' ? 'ar' : 'en', false);
  var langBtn = $('#lang-toggle');
  if (langBtn) langBtn.addEventListener('click', function () { applyLang(lang === 'en' ? 'ar' : 'en', true); });

  /* ---- Mobile menu ---- */
  var menuBtn = $('#menu-toggle'), nav = $('#main-nav');
  if (nav && !$('.nav-cv', nav)) {
    var cvLi = document.createElement('a');
    cvLi.className = 'btn btn-primary nav-cv'; cvLi.href = '#cv'; cvLi.setAttribute('data-cv', '');
    cvLi.setAttribute('data-i18n', 'cv.btn'); cvLi.textContent = t('cv.btn');
    cvLi.style.display = 'none'; nav.appendChild(cvLi);
  }
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    var cv = $('.nav-cv', nav); if (cv) cv.style.display = open ? '' : 'none';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); } });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) setMenu(false); });
  }

  /* ---- Header state, back to top ---- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var topBtn = $('#to-top');
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- Active nav link ---- */
  var sections = $$('[data-section]');
  if ('IntersectionObserver' in window && sections.length) {
    var navLinks = $$('.main-nav a[data-nav]');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          var map = { education: 'about', experience: 'about', skills: 'about', testimonials: 'projects', cv: 'contact' };
          var target = map[id] || id;
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === target); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- CV (view only, opens in new tab) ---- */
  $$('[data-cv]').forEach(function (a) {
    if (CONFIG.cvUrl) {
      a.href = CONFIG.cvUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
    } else {
      a.classList.add('is-placeholder'); a.setAttribute('aria-disabled', 'true');
      a.addEventListener('click', function (e) { e.preventDefault(); toast(t('toast.cv')); });
    }
  });

  /* ---- Social / contact links ---- */
  $$('[data-link]').forEach(function (a) {
    var url = CONFIG.links[a.getAttribute('data-link')];
    if (url) {
      a.href = url; a.classList.remove('is-placeholder'); a.removeAttribute('aria-disabled'); a.removeAttribute('role'); a.removeAttribute('tabindex');
      if (!/^mailto:/.test(url)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      if (a.hasAttribute('data-link-text')) { a.textContent = url.replace(/^mailto:/, '').replace(/^https?:\/\//, ''); a.removeAttribute('data-i18n'); }
    } else {
      a.addEventListener('click', function (e) { e.preventDefault(); toast(t('toast.link')); });
      a.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); toast(t('toast.link')); } });
    }
  });

  /* ---- Contact form ---- */
  var form = $('#contact-form'), status = $('#form-status');
  var rules = [
    { id: 'f-name', err: 'e-name', test: function (v) { return v.trim().length > 1; }, key: 'form.err.req' },
    { id: 'f-email', err: 'e-email', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, key: 'form.err.email' },
    { id: 'f-type', err: 'e-type', test: function (v) { return !!v; }, key: 'form.err.type' },
    { id: 'f-msg', err: 'e-msg', test: function (v) { return v.trim().length > 4; }, key: 'form.err.req' }
  ];
  function check(r, show) {
    var el = document.getElementById(r.id), er = document.getElementById(r.err);
    var ok = r.test(el.value);
    el.closest('.field').classList.toggle('invalid', !ok && show);
    el.setAttribute('aria-invalid', String(!ok && show));
    er.textContent = (!ok && show) ? t(r.key) : '';
    er.setAttribute('data-key', (!ok && show) ? r.key : '');
    return ok;
  }
  function updateErrors() {
    $$('.err').forEach(function (er) { var k = er.getAttribute('data-key'); if (k) er.textContent = t(k); });
    if (status && status.getAttribute('data-key')) status.textContent = t(status.getAttribute('data-key'));
  }
  function setStatus(key, ok) { status.setAttribute('data-key', key); status.textContent = t(key); status.classList.toggle('ok', !!ok); }
  if (form) {
    rules.forEach(function (r) { document.getElementById(r.id).addEventListener('blur', function () { check(r, true); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allOk = true, firstBad = null;
      rules.forEach(function (r) { if (!check(r, true)) { allOk = false; if (!firstBad) firstBad = document.getElementById(r.id); } });
      if (!allOk) { status.textContent = ''; status.removeAttribute('data-key'); firstBad.focus(); return; }
      if (!CONFIG.formEndpoint) { setStatus('form.notconfigured', false); return; }
      setStatus('form.sending', false);
      fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (res) { if (!res.ok) throw new Error('bad'); setStatus('form.sent', true); form.reset(); })
        .catch(function () { setStatus('form.failed', false); });
    });
  }
})();
