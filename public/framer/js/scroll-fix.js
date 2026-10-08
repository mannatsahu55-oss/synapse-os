(function () {
  'use strict';

  // ─── 1. Inject CSS that kills Framer's scroll-linked appear animations ───────
  // Framer starts elements at opacity:0. We override to force them visible
  // immediately so fast scrolling never shows blank sections.
  var style = document.createElement('style');
  style.id = 'scroll-fix-override';
  style.textContent = [
    /* Kill initial hidden state on all Framer appear targets */
    '[data-framer-appear-id] {',
    '  opacity: 1 !important;',
    '  transform: none !important;',
    '  filter: none !important;',
    '  visibility: visible !important;',
    '}',
    /* Also target common Framer motion wrapper patterns */
    '[data-framer-component-type] {',
    '  opacity: 1 !important;',
    '  visibility: visible !important;',
    '}',
  ].join('\n');

  // Inject as early as possible
  function injectStyle() {
    if (!document.head && !document.body) {
      requestAnimationFrame(injectStyle);
      return;
    }
    var target = document.head || document.body;
    if (!document.getElementById('scroll-fix-override')) {
      target.appendChild(style);
    }
  }
  injectStyle();

  // ─── 2. Continuously poll and force-reveal any stuck elements ────────────────
  // Framer may re-apply opacity:0 via inline styles when animations initialise.
  // We watch for this and override inline styles on every frame.
  var scanCount = 0;
  var maxScans = 600; // run for ~10 seconds after load, then reduce frequency

  function scanAndReveal() {
    try {
      // Target all elements that Framer might hide via inline style
      var candidates = document.querySelectorAll('[data-framer-appear-id], [style*="opacity: 0"], [style*="opacity:0"]');
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        // Force visible via inline style override
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        // Only clear transforms that Framer uses for appear (translateY/X)
        var currentTransform = el.style.transform;
        if (currentTransform && currentTransform !== 'none' &&
            (currentTransform.includes('translateY') || currentTransform.includes('translateX') || currentTransform.includes('scale'))) {
          el.style.setProperty('transform', 'none', 'important');
        }
      }
    } catch (e) {}

    scanCount++;
    if (scanCount < maxScans) {
      requestAnimationFrame(scanAndReveal);
    } else {
      // After initial burst, switch to slower interval polling
      setInterval(function () {
        try {
          var els = document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]');
          for (var i = 0; i < els.length; i++) {
            els[i].style.setProperty('opacity', '1', 'important');
            els[i].style.setProperty('visibility', 'visible', 'important');
          }
        } catch (e) {}
      }, 200);
    }
  }

  // ─── 3. MutationObserver – catch any element Framer hides after render ───────
  function startMutationObserver() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        var mutation = mutations[m];
        // Check attribute changes (Framer sets style attr with opacity:0)
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          var el = mutation.target;
          var opacity = el.style.opacity;
          if (opacity === '0' || opacity === '0 ') {
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
          }
        }
        // Check newly added nodes
        if (mutation.addedNodes && mutation.addedNodes.length) {
          for (var n = 0; n < mutation.addedNodes.length; n++) {
            var node = mutation.addedNodes[n];
            if (node.style && (node.style.opacity === '0' || node.style.opacity === '0 ')) {
              node.style.setProperty('opacity', '1', 'important');
            }
          }
        }
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style'],
        childList: true,
        subtree: true,
      });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['style'],
          childList: true,
          subtree: true,
        });
      });
    }
  }

  // ─── 4. Init ──────────────────────────────────────────────────────────────────
  function init() {
    injectStyle();
    startMutationObserver();
    requestAnimationFrame(scanAndReveal);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also re-run on window load (after all JS has executed)
  window.addEventListener('load', function () {
    // Re-inject style in case Framer removed it
    injectStyle();
    // One final hard pass
    setTimeout(function () {
      var els = document.querySelectorAll('[data-framer-appear-id]');
      for (var i = 0; i < els.length; i++) {
        els[i].style.setProperty('opacity', '1', 'important');
        els[i].style.setProperty('transform', 'none', 'important');
        els[i].style.setProperty('visibility', 'visible', 'important');
      }
    }, 500);
  });

})();
