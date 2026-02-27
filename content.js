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

    const QUOTES = [
        { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
        { text: "Be where you are; otherwise you will miss your life.", author: "Buddha" },
        { text: "The present moment is the only moment available to us, and it is the door to all moments.", author: "Thich Nhat Hanh" },
        { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
        { text: "Slow down and everything you are chasing will come around and catch you.", author: "John De Paola" },
        { text: "You can't stop the waves, but you can learn to surf.", author: "Jon Kabat-Zinn" },
        { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "Oprah Winfrey" },
        { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
        { text: "The quieter you become, the more you are able to hear.", author: "Rumi" },
        { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
        { text: "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day is by no means a waste of time.", author: "John Lubbock" },
        { text: "Almost everything — all external expectations, all pride, all fear of embarrassment or failure — these things just fall away in the face of death, leaving only what is truly important.", author: "Steve Jobs" },
        { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    ];

    // Check filters before injecting
    chrome.storage.sync.get({
        filterMode: 'always',
        siteList: ''
    }, (items) => {
        const mode = items.filterMode;
        if (mode === 'always') {
            initOverlay();
            return;
        }

        const currentHost = window.location.hostname;
        const list = items.siteList.split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const isMatched = list.some(domain => {
            // Simple match: domain exactly or ends with .domain
            return currentHost === domain || currentHost.endsWith('.' + domain);
        });

        if (mode === 'blacklist' && isMatched) {
            initOverlay();
        } else if (mode === 'whitelist' && !isMatched) {
            initOverlay();
        }
    });

    function initOverlay() {
        const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

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

    <div class="rd-quote-wrap">
      <div class="rd-quote-text">"${quote.text}"</div>
      <div class="rd-quote-author">— ${quote.author}</div>
    </div>

    <div id="rd-timer-overlay" class="rd-timer-overlay rd-hidden">Wait 5s to continue</div>
    <button id="rd-continue-btn">Continue →</button>
    <p class="rd-hint" id="rd-enter-hint">or press Enter</p>
  `;

        // Block scrolling while overlay is visible
        document.documentElement.style.overflow = 'hidden';

        let isTimerRunning = false;

        // Append as early as possible; if body not ready yet, wait for it
        function attachOverlay() {
            if (document.body) {
                document.body.appendChild(overlay);
                silencePage();
                window.rdMediaInterval = setInterval(silencePage, 500);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(overlay);
                    silencePage();
                    window.rdMediaInterval = setInterval(silencePage, 500);
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

        function silencePage() {
            const media = document.querySelectorAll('video, audio');
            media.forEach(m => {
                try {
                    if (!m.paused) m.pause();
                } catch (e) { }
            });
        }

        // Dismiss function
        function dismiss() {
            if (isTimerRunning) return;
            if (window.rdMediaInterval) clearInterval(window.rdMediaInterval);
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
                    if (isTimerRunning) return;
                    document.removeEventListener('keydown', onKey);
                    dismiss();
                }
            });

            // Load Settings & Start Timer
            chrome.storage.sync.get({
                pauseDuration: 0,
                pauseUnit: 'seconds',
                autoContinue: false,
                accentColor: '#a78bfa',
                isPro: false
            }, (items) => {
                // Apply custom theme color ONLY if Pro
                const activeColor = items.isPro ? items.accentColor : '#a78bfa';
                document.documentElement.style.setProperty('--rd-accent', activeColor);

                let seconds = parseInt(items.pauseDuration) || 0;
                if (items.pauseUnit === 'minutes') {
                    seconds *= 60;
                }
                if (seconds > 0) {
                    runOverlayTimer(seconds, items.autoContinue);
                }
            });
        }

        function runOverlayTimer(seconds, autoContinue) {
            const timerEl = document.getElementById('rd-timer-overlay');
            const btn = document.getElementById('rd-continue-btn');
            const hint = document.getElementById('rd-enter-hint');
            if (!timerEl || !btn) return;

            isTimerRunning = true;
            timerEl.classList.remove('rd-hidden');
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
            if (hint) hint.style.opacity = '0.3';

            let remaining = seconds;
            const update = () => {
                timerEl.textContent = `Wait ${remaining}s to continue`;
                if (remaining <= 0) {
                    isTimerRunning = false;
                    timerEl.classList.add('rd-hidden');
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    if (hint) hint.style.opacity = '1';

                    // Increment mindful moments on success
                    chrome.storage.sync.get({ totalMoments: 0 }, (data) => {
                        chrome.storage.sync.set({ totalMoments: data.totalMoments + 1 });
                    });

                    if (autoContinue) {
                        dismiss();
                    }
                } else {
                    remaining--;
                    setTimeout(update, 1000);
                }
            };
            update();
        }

        if (document.body) {
            bindEvents();
        } else {
            document.addEventListener('DOMContentLoaded', bindEvents);
        }
    }
})();
