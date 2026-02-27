(function () {
    // Don't run in iframes
    if (window.self !== window.top) return;

    // Trigger on:
    //   1. Reload/refresh
    //   2. Direct address-bar navigation (navigate type + no referrer)
    //      — this catches typing youtube.com, etc., but NOT link clicks within a page
    const navEntries = performance.getEntriesByType('navigation');
    if (!navEntries.length) return;

    const navType = navEntries[0].type;
    const isReload = navType === 'reload';
    const isDirectNav = navType === 'navigate' && !document.referrer;
    if (!isReload && !isDirectNav) return;

    // Build and inject the overlay
    const overlay = document.createElement('div');
    overlay.id = 'rd-pause-overlay';

    overlay.innerHTML = `
    <div class="rd-orb rd-orb1"></div>
    <div class="rd-orb rd-orb2"></div>

    <div class="rd-breath-wrap">
      <div class="rd-ring rd-ring1"></div>
      <div class="rd-ring rd-ring2"></div>
      <div class="rd-circle" id="rd-breath-label">Breathe</div>
    </div>

    <div class="rd-message">
      <strong>Pause for a moment</strong>
      Take a breath before continuing.
    </div>

    <button id="rd-continue-btn">Continue →</button>
    <p class="rd-hint">or press Enter</p>
  `;

    // Block scrolling while overlay is visible
    document.documentElement.style.overflow = 'hidden';

    // Append as early as possible; if body not ready yet, wait for it
    function attachOverlay() {
        if (document.body) {
            document.body.appendChild(overlay);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(overlay);
            });
        }
    }
    attachOverlay();

    // Breathing label cycle
    const breathLabels = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
    let idx = 0;
    const labelEl = () => document.getElementById('rd-breath-label');
    const labelTimer = setInterval(() => {
        const el = labelEl();
        if (!el) return;
        el.style.opacity = '0';
        setTimeout(() => {
            idx = (idx + 1) % breathLabels.length;
            el.textContent = breathLabels[idx];
            el.style.opacity = '1';
        }, 300);
    }, 4000);

    // Dismiss function
    function dismiss() {
        clearInterval(labelTimer);
        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.opacity = '0';
        document.documentElement.style.overflow = '';
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 420);
    }

    // Add event listeners after overlay is in DOM
    function bindEvents() {
        const btn = document.getElementById('rd-continue-btn');
        if (btn) btn.addEventListener('click', dismiss);
        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                document.removeEventListener('keydown', onKey);
                dismiss();
            }
        });
    }

    if (document.body) {
        bindEvents();
    } else {
        document.addEventListener('DOMContentLoaded', bindEvents);
    }
})();
