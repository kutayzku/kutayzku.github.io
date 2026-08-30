/* =========================================================
   main.js — dil, tema, gezinme, animasyonlar
   ========================================================= */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { /* gizli sekme vb. */ }
    return null;
  }

  /* =============== DİL =============== */
  var lang = store('ka-lang');
  if (lang !== 'tr' && lang !== 'en') lang = 'tr';   // varsayilan Turkce

  /* Anahtar sozlukte var mi? Yoksa HTML'deki hazir metne dokunmayiz --
     boylece eski bir i18n.js onbellekten gelse bile sayfada anahtar adi gorunmez. */
  function hasKey(key) {
    var d = window.I18N[lang];
    if (d && d[key] !== undefined) return true;
    return !!(window.I18N.tr && window.I18N.tr[key] !== undefined);
  }

  window.APP = {
    get lang() { return lang; },
    has: hasKey,
    t: function (key) {
      var d = window.I18N[lang];
      if (d && d[key] !== undefined) return d[key];
      var f = window.I18N.tr;
      return (f && f[key] !== undefined) ? f[key] : key;
    }
  };

  function applyI18n() {
    document.documentElement.lang = lang;

    $$('[data-i18n]').forEach(function (el) {
      var k = el.dataset.i18n;
      if (!hasKey(k)) return;
      var v = window.APP.t(k);
      if (typeof v === 'string') el.textContent = v;
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var k = el.dataset.i18nHtml;
      if (!hasKey(k)) return;
      var v = window.APP.t(k);
      if (typeof v === 'string') el.innerHTML = v;
    });

    document.title = window.APP.t('meta.title');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', window.APP.t('meta.desc'));

    var ll = $('#langLabel');
    if (ll) ll.textContent = lang === 'tr' ? 'EN' : 'TR';

    if (window.LAB && window.LAB.refresh) window.LAB.refresh();
    startTyping();
  }

  function setLang(next) {
    lang = next;
    store('ka-lang', lang);
    applyI18n();
  }

  /* =============== TEMA =============== */
  var theme = store('ka-theme') || 'dark';

  /* Koyu temada beyaz cizgili, acik temada siyah cizgili logo kullanilir. */
  function syncLogos() {
    var src = theme === 'light' ? 'assets/logo-clear.png' : 'assets/logo-dark.png';
    $$('img[data-logo]').forEach(function (img) {
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
  }

  function setTheme(next) {
    theme = next;
    document.documentElement.setAttribute('data-theme', theme);
    store('ka-theme', theme);
    var mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.setAttribute('content', theme === 'dark' ? '#08070E' : '#F4F2FA');
    syncLogos();
  }

  document.documentElement.setAttribute('data-theme', theme);

  /* =============== YAZI EFEKTİ =============== */
  var typeGen = 0;

  function startTyping() {
    var el = $('#typeTarget');
    if (!el) return;
    typeGen++;
    var gen = typeGen;
    var roles = window.APP.t('roles');
    if (!Array.isArray(roles) || !roles.length) return;

    if (reduceMotion) { el.textContent = roles[0]; return; }

    var i = 0, pos = 0, deleting = false;
    el.textContent = '';

    (function tick() {
      if (gen !== typeGen) return;                       // dil değişti, bu döngü iptal
      var word = roles[i % roles.length];
      pos += deleting ? -1 : 1;
      el.textContent = word.slice(0, pos);

      var wait = deleting ? 34 : 62;
      if (!deleting && pos === word.length) { deleting = true; wait = 1900; }
      else if (deleting && pos === 0) { deleting = false; i++; wait = 380; }

      setTimeout(tick, wait);
    })();
  }

  /* =============== GEZİNME =============== */
  function initNav() {
    var nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');

    function onScroll() {
      nav.classList.toggle('stuck', window.scrollY > 14);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      var bar = $('#scrollBar');
      if (bar) bar.style.width = p + '%';
      var tt = $('#toTop');
      if (tt) tt.classList.toggle('show', window.scrollY > 620);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function closeMenu() {
      links.classList.remove('open');
      burger.classList.remove('on');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }

    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('on', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });
    $$('#navLinks a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    /* aktif bölüm */
    var ids = ['about', 'lab', 'skills', 'projects', 'journey', 'contact'];
    var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          $$('#navLinks a').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      secs.forEach(function (s) { io.observe(s); });
    }

    var tt = $('#toTop');
    if (tt) tt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* =============== GÖRÜNÜRLÜK ANİMASYONU =============== */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('in'); }, Math.min(i, 5) * 70);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (e) { io.observe(e); });
  }

  /* =============== SAYAÇLAR =============== */
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      nums.forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = +el.dataset.count, suf = el.dataset.suffix || '', cur = 0;
        var step = Math.max(1, Math.round(target / 22));
        (function tick() {
          cur = Math.min(target, cur + step);
          el.textContent = cur + (cur === target ? suf : '');
          if (cur < target) setTimeout(tick, 45);
        })();
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* =============== ARKA PLAN — imlece tepki veren takimyildizi =============== */
  var bg = { mx: 0, my: 0, tx: 0, ty: 0, present: false, strength: 0, calm: 1 };

  function initBackground() {
    var c = $('#bgCanvas');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var glow = $('#cursorGlow');
    var pts = [], w = 0, h = 0;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var R = 200;     // imlecin ittigi alan
    var LINK = 132;  // imlece uzanan cizgilerin menzili

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth || document.documentElement.clientWidth || 1;
      h = window.innerHeight || document.documentElement.clientHeight || 1;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var n = Math.min(78, Math.max(26, Math.round((w * h) / 19000)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          r: Math.random() * 1.5 + 0.7,
          z: 0.35 + Math.random() * 0.65,   // derinlik: parallax siddeti
          ox: 0, oy: 0, sx: 0, sy: 0,
          bit: Math.random() < 0.22 ? (Math.random() < 0.5 ? '0' : '1') : null
        });
      }
      bg.mx = bg.tx = w / 2;
      bg.my = bg.ty = h / 2;
    }

    function palette() {
      return document.documentElement.getAttribute('data-theme') === 'light'
        ? 'rgba(78,44,178,' : 'rgba(155,123,240,';
    }

    function frame() {
      var col = palette();
      var i, j, p, q;

      /* pencere boyutu degistiyse (ya da sayfa gizliyken yuklendiyse) kendini toparla */
      if (w !== (window.innerWidth || w) || h !== (window.innerHeight || h)) resize();

      /* imleci yumusakca takip et; varligi da yumusakca artip azalsin */
      bg.mx += (bg.tx - bg.mx) * 0.10;
      bg.my += (bg.ty - bg.my) * 0.10;
      bg.strength += ((bg.present ? 1 : 0) - bg.strength) * 0.05;
      var S = bg.strength;

      /* hero'dan uzaklastikca arka plan sakinlesir, okumayi bolmez */
      var hero = document.getElementById('hero');
      var hh = (hero && hero.offsetHeight) || h;
      var f = Math.max(0, Math.min(1, 1 - window.scrollY / hh));
      bg.calm += ((0.40 + 0.55 * f) - bg.calm) * 0.06;

      /* tum alanin cok hafif parallax kaymasi */
      var pxB = (bg.mx - w / 2) * -0.016 * S;
      var pyB = (bg.my - h / 2) * -0.016 * S;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = bg.calm;
      ctx.lineWidth = 1;

      /* 1) konumlar */
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -30) p.x = w + 30; else if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30; else if (p.y > h + 30) p.y = -30;

        p.sx = p.x + pxB * p.z + p.ox;
        p.sy = p.y + pyB * p.z + p.oy;

        if (S > 0.01) {
          var dx = p.sx - bg.mx, dy = p.sy - bg.my;
          var d2 = dx * dx + dy * dy;
          if (d2 < R * R && d2 > 4) {
            var d = Math.sqrt(d2);
            var push = (1 - d / R) * 2.0 * S;
            p.ox += (dx / d) * push;
            p.oy += (dy / d) * push;
          }
        }
        p.ox *= 0.90; p.oy *= 0.90;
      }

      /* 2) noktalar arasi baglar */
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j];
          var ax = p.sx - q.sx, ay = p.sy - q.sy;
          var a2 = ax * ax + ay * ay;
          if (a2 < 16000) {
            ctx.strokeStyle = col + (0.15 * (1 - a2 / 16000)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); ctx.stroke();
          }
        }
      }

      /* 3) imlece uzanan baglar */
      if (S > 0.02) {
        for (i = 0; i < pts.length; i++) {
          p = pts[i];
          var bx = p.sx - bg.mx, by = p.sy - bg.my;
          var b2 = bx * bx + by * by;
          if (b2 < LINK * LINK) {
            var bd = Math.sqrt(b2);
            ctx.strokeStyle = col + (0.30 * (1 - bd / LINK) * S).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(bg.mx, bg.my); ctx.stroke();
          }
        }
      }

      /* 4) noktalar ve serpistirilmis bitler */
      ctx.font = '600 11px "JetBrains Mono", monospace';
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (p.bit) {
          ctx.fillStyle = col + '0.26)';
          ctx.fillText(p.bit, p.sx + 6, p.sy - 6);
        }
        ctx.fillStyle = col + (0.28 + 0.30 * p.z).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(p.sx, p.sy, p.r, 0, 6.284); ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (glow) glow.style.transform = 'translate3d(' + bg.mx + 'px,' + bg.my + 'px,0)';

      requestAnimationFrame(frame);
    }

    function staticDraw() {
      var col = palette();
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;
      pts.forEach(function (p) {
        ctx.fillStyle = col + '0.45)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.284); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    resize();
    if (reduceMotion) staticDraw(); else frame();

    if (canHover && !reduceMotion) {
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        bg.tx = e.clientX;
        bg.ty = e.clientY;
        if (!bg.present) {
          bg.present = true;
          bg.mx = bg.tx; bg.my = bg.ty;
          if (glow) glow.classList.add('on');
        }
      }, { passive: true });

      document.documentElement.addEventListener('pointerleave', function () {
        bg.present = false;
        if (glow) glow.classList.remove('on');
      });
      window.addEventListener('blur', function () {
        bg.present = false;
        if (glow) glow.classList.remove('on');
      });
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); if (reduceMotion) staticDraw(); }, 180);
    });
  }

  /* =============== E-POSTAYI KOPYALA =============== */
  function initCopyMail() {
    var btn = $('#copyMail');
    if (!btn) return;
    var label = $('#copyMailLabel');
    var timer;

    function done() {
      if (!label) return;
      label.textContent = window.APP.t('contact.copied');
      btn.classList.add('done');
      clearTimeout(timer);
      timer = setTimeout(function () {
        label.textContent = window.APP.t('contact.copy');
        btn.classList.remove('done');
      }, 1900);
    }

    function fallback(mail) {
      var ta = document.createElement('textarea');
      ta.value = mail;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* sessizce gec */ }
      document.body.removeChild(ta);
    }

    btn.addEventListener('click', function () {
      var mail = btn.dataset.mail || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail).then(done, function () { fallback(mail); });
      } else {
        fallback(mail);
      }
    });
  }

  /* =============== BİT ŞERİDİ =============== */
  function initBitStrip() {
    var el = $('#bitStrip');
    if (!el) return;
    function gen() {
      var s = '';
      for (var i = 0; i < 42; i++) s += Math.random() < 0.5 ? '0' : '1';
      el.textContent = s;
    }
    gen();
    if (!reduceMotion) setInterval(gen, 1400);
  }

  /* =============== PROJE KARTI IŞIĞI =============== */
  function initSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;
    $$('.proj').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* =============== BAŞLAT =============== */
  function boot() {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    $('#langBtn').addEventListener('click', function () { setLang(lang === 'tr' ? 'en' : 'tr'); });
    $('#themeBtn').addEventListener('click', function () { setTheme(theme === 'dark' ? 'light' : 'dark'); });

    syncLogos();
    if (window.LAB) window.LAB.init();
    applyI18n();

    initNav();
    initReveal();
    initCounters();
    initBackground();
    initCopyMail();
    initBitStrip();
    initSpotlight();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
