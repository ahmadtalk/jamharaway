/**
 * jamhara embed.js — include once per page to enable auto-height iframes
 * <script src="https://jamhara.vercel.app/embed.js" async></script>
 */
(function () {
  'use strict';

  function resize(e) {
    if (!e.data || typeof e.data !== 'object') return;
    var h = e.data.jamhara_embed_height;
    if (!h || typeof h !== 'number' || h < 50) return;

    var frames = document.querySelectorAll('iframe[src*="jamhara.vercel.app/embed/"]');
    for (var i = 0; i < frames.length; i++) {
      try {
        if (frames[i].contentWindow === e.source) {
          frames[i].style.height = h + 'px';
          frames[i].style.overflow = 'hidden';
        }
      } catch (_) { /* cross-origin guard */ }
    }
  }

  if (window.addEventListener) {
    window.addEventListener('message', resize, false);
  }
})();
