(function () {
    // Don't run in iframes
    if (window.self !== window.top) return;
    if (!/^https?:$/.test(window.location.protocol)) return;

    let autoPauseTimer = null;

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

    function checkSiteMatch(items) {
        const mode = items.filterMode;
        if (mode === 'always') return true;

        const currentHost = window.location.hostname;
        const list = items.siteList.split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const isMatched = list.some(domain => {
            return currentHost === domain || currentHost.endsWith('.' + domain);
        });

        if (mode === 'blacklist' && isMatched) return true;
        if (mode === 'whitelist' && !isMatched) return true;
        return false;
    }

    function startAutoPauseTimer() {
        if (autoPauseTimer) clearTimeout(autoPauseTimer);

        chrome.storage.sync.get({
            autoPauseDuration: 0,
            autoPauseUnit: 'minutes'
        }, (items) => {
            let seconds = parseInt(items.autoPauseDuration) || 0;
            if (items.autoPauseUnit === 'hours') {
                seconds *= 3600;
            } else {
                seconds *= 60;
            }

            if (seconds > 0) {
                autoPauseTimer = setTimeout(() => {
                    // Check if overlay is already active
                    if (!document.getElementById('rd-pause-overlay')) {
                        initOverlay();
                    }
                }, seconds * 1000);
            }
        });
    }

    // Check filters and trigger initial overlay or start timer
    chrome.storage.sync.get({
        filterMode: 'always',
        siteList: ''
    }, (items) => {
        if (checkSiteMatch(items)) {
            const navEntries = performance.getEntriesByType('navigation');
            if (navEntries.length) {
                const navType = navEntries[0].type;
                const isReload = navType === 'reload';
                const isDirectNav = navType === 'navigate' && !document.referrer;

                if (isReload || isDirectNav) {
                    initOverlay();
                } else {
                    // Not a direct nav/reload, but it's a distracting site, start timer
                    startAutoPauseTimer();
                }
            } else {
                startAutoPauseTimer();
            }
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
        let overlayAttached = false;
        let isOverlayActive = true;
        let removeKeyListener = null;
        let removeMediaBlockers = null;

        function pauseMediaElement(mediaEl) {
            try {
                if (!mediaEl.paused) {
                    mediaEl.pause();
                }
            } catch (e) { }
        }

        function installMediaBlockers() {
            const mediaSelector = 'video, audio';

            const stopMediaPlayback = (event) => {
                if (!isOverlayActive) return;
                pauseMediaElement(event.target);
            };

            const observer = new MutationObserver((mutations) => {
                if (!isOverlayActive) return;
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (!(node instanceof Element)) return;

                        if (node.matches(mediaSelector)) {
                            pauseMediaElement(node);
                        }

                        node.querySelectorAll?.(mediaSelector).forEach(pauseMediaElement);
                    });
                });
            });

            document.querySelectorAll(mediaSelector).forEach(pauseMediaElement);
            document.addEventListener('play', stopMediaPlayback, true);
            document.addEventListener('playing', stopMediaPlayback, true);
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });

            return () => {
                document.removeEventListener('play', stopMediaPlayback, true);
                document.removeEventListener('playing', stopMediaPlayback, true);
                observer.disconnect();
            };
        }

        // Append as early as possible; if body not ready yet, wait for it
        function attachOverlay() {
            if (overlayAttached) return;
            if (!document.body) return;

            document.body.appendChild(overlay);
            overlayAttached = true;
            removeMediaBlockers = installMediaBlockers();
        }

        if (document.body) {
            attachOverlay();
        } else {
            document.addEventListener('DOMContentLoaded', attachOverlay, { once: true });
        }

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
            if (isTimerRunning) return;

            isOverlayActive = false;
            if (removeMediaBlockers) {
                removeMediaBlockers();
                removeMediaBlockers = null;
            }
            if (removeKeyListener) {
                removeKeyListener();
                removeKeyListener = null;
            }
            clearInterval(labelTimer);
            overlay.style.transition = 'opacity 0.4s ease';
            overlay.style.opacity = '0';
            document.documentElement.style.overflow = '';
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                // Restart auto-pause timer on dismissal
                startAutoPauseTimer();
            }, 420);
        }

        // Add event listeners after overlay is in DOM
        function bindEvents() {
            const btn = document.getElementById('rd-continue-btn');
            if (btn) btn.addEventListener('click', dismiss);

            const onKey = (e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    if (isTimerRunning) return;
                    dismiss();
                }
            };

            document.addEventListener('keydown', onKey);
            removeKeyListener = () => {
                document.removeEventListener('keydown', onKey);
            };

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
            btn.disabled = true;
            if (hint) hint.style.opacity = '0.3';

            let remaining = seconds;
            const update = () => {
                timerEl.textContent = `Wait ${remaining}s to continue`;
                if (remaining <= 0) {
                    isTimerRunning = false;
                    timerEl.classList.add('rd-hidden');
                    btn.disabled = false;
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
