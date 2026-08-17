/* ============================================================
   Prerna Tyagi — site behaviour
   Progressive enhancement only: nothing here is required to
   read the page. Dependency-free, defensive, motion-aware.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mark the current page in the navbar ---------- */
  function markActiveNav() {
    var here = window.location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
    var links = document.querySelectorAll('.navbar-nav .nav-link[href]');
    var best = null;
    var bestLen = -1;

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var url;
      try {
        url = new URL(link.getAttribute('href'), window.location.href);
      } catch (e) {
        continue;
      }
      if (url.origin !== window.location.origin) continue;

      var path = url.pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
      var match = path === here || (path !== '' && here.indexOf(path.replace(/\.html$/, '')) === 0);

      /* a post lives under /posts/, which belongs to the ReadMe section */
      if (/\/posts\//.test(here) && /findings\.html$/.test(url.pathname)) match = true;

      if (match && path.length > bestLen) {
        best = link;
        bestLen = path.length;
      }
    }
    if (best) {
      best.classList.add('active');
      best.setAttribute('aria-current', 'page');
    }
  }

  /* ---------- reveal sections as they scroll into view ---------- */
  function setupReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-visible');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  /* ---------- scroll progress + back to top ---------- */
  function setupScrollChrome() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    var top = document.createElement('button');
    top.id = 'to-top';
    top.type = 'button';
    top.textContent = '↑';
    top.setAttribute('aria-label', 'Back to top');
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    document.body.appendChild(top);

    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var y = window.scrollY || doc.scrollTop || 0;
      var pct = Math.min(100, Math.max(0, (y / max) * 100));
      bar.style.width = pct + '%';
      top.classList.toggle('show', y > 600);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* ---------- copy-on-click for the email link ---------- */
  function setupCopyEmail() {
    var nodes = document.querySelectorAll('[data-copy]');
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        el.addEventListener('click', function (ev) {
          if (!navigator.clipboard) return; /* fall through to mailto: */
          ev.preventDefault();
          navigator.clipboard.writeText(el.getAttribute('data-copy')).then(function () {
            var original = el.textContent;
            el.textContent = 'copied ✓';
            setTimeout(function () { el.textContent = original; }, 1400);
          }, function () {
            window.location.href = el.getAttribute('href');
          });
        });
      })(nodes[i]);
    }
  }

  function init() {
    try { markActiveNav(); } catch (e) {}
    try { setupReveal(); } catch (e) {}
    try { setupScrollChrome(); } catch (e) {}
    try { setupCopyEmail(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
