// Mindfulness Quotes
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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ── Clock Logic ────────────────────────────────────────
function updateClock() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');

    if (clockEl) {
        const now = new Date();
        let h = now.getHours();
        let m = now.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        clockEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    if (dateEl) {
        const now = new Date();
        const day = DAYS[now.getDay()];
        const month = MONTHS[now.getMonth()];
        dateEl.textContent = `${day}, ${month} ${now.getDate()}`;
    }
}

// ── Breathing Logic ────────────────────────────────────
const breathLabels = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
let breathIdx = 0;

function cycleBreathe() {
    const labelEl = document.getElementById('breathLabel');
    if (!labelEl) return;

    labelEl.style.opacity = '0';
    setTimeout(() => {
        const checkLabel = document.getElementById('breathLabel');
        if (checkLabel) {
            breathIdx = (breathIdx + 1) % breathLabels.length;
            checkLabel.textContent = breathLabels[breathIdx];
            checkLabel.style.opacity = '1';
        }
    }, 300);
}

// ── Navigation Logic ───────────────────────────────────
function dismissPause() {
    const container = document.querySelector('.container');
    const goScreen = document.getElementById('rd-go-screen');
    const goInput = document.getElementById('rd-go-input');

    if (container) container.classList.add('hidden');
    if (goScreen) goScreen.classList.remove('hidden');

    // Tiny delay to allow visibility recalculation before focus
    if (goInput) {
        setTimeout(() => {
            try {
                goInput.focus();
            } catch (e) { }
        }, 50);
    }
}

function handleNavigation() {
    const inputEl = document.getElementById('rd-go-input');
    if (!inputEl) return;

    const val = inputEl.value.trim();
    if (!val) return;

    if (/^https?:\/\//i.test(val)) {
        window.location.href = val;
    } else if (/^[\w-]+(\.[a-z]{2,})(\/.*)?$/i.test(val)) {
        window.location.href = 'https://' + val;
    } else {
        window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(val);
    }
}

// ── Timer State ────────────────────────────────────────
let isTimerRunning = false;

function startTimer(seconds) {
    const timerEl = document.getElementById('rd-timer');
    const continueBtn = document.getElementById('continueBtn');
    if (!timerEl || !continueBtn) return;

    isTimerRunning = true;
    timerEl.classList.remove('hidden');
    continueBtn.style.opacity = '0.5';
    continueBtn.style.cursor = 'not-allowed';

    let remaining = seconds;
    const update = () => {
        timerEl.textContent = `Wait ${remaining}s to continue`;
        if (remaining <= 0) {
            isTimerRunning = false;
            timerEl.classList.add('hidden');
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        } else {
            remaining--;
            setTimeout(update, 1000);
        }
    };
    update();
}

// ── Initialization ─────────────────────────────────────
function init() {
    // 1. Initial Quote
    const qTextEl = document.getElementById('quoteText');
    const qAuthEl = document.getElementById('quoteAuthor');
    if (qTextEl && qAuthEl) {
        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        qTextEl.textContent = `"${q.text}"`;
        qAuthEl.textContent = `— ${q.author}`;
    }

    // 2. Start Clock
    updateClock();
    setInterval(updateClock, 1000);

    // 3. Start Breathing Animation
    const labelEl = document.getElementById('breathLabel');
    if (labelEl) {
        labelEl.style.transition = 'opacity 0.3s';
        setInterval(cycleBreathe, 4000);
    }

    // 4. Load Settings & Start Timer
    chrome.storage.sync.get({
        pauseDuration: 0,
        pauseUnit: 'seconds'
    }, (items) => {
        let seconds = parseInt(items.pauseDuration) || 0;
        if (items.pauseUnit === 'minutes') {
            seconds *= 60;
        }
        if (seconds > 0) {
            startTimer(seconds);
        }
    });

    // 5. Event Listeners
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (!isTimerRunning) dismissPause();
        });
    }

    const goBtn = document.getElementById('rd-go-btn');
    if (goBtn) goBtn.addEventListener('click', handleNavigation);

    const goInput = document.getElementById('rd-go-input');
    if (goInput) {
        goInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleNavigation();
        });
    }

    document.addEventListener('keydown', (e) => {
        const container = document.querySelector('.container');
        if (container && !container.classList.contains('hidden')) {
            if (e.key === 'Enter' && !isTimerRunning) dismissPause();
        }
    });
}

// Wait for DOM to be fully loaded to ensure all IDs exist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
