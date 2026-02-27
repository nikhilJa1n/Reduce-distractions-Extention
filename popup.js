document.addEventListener('DOMContentLoaded', () => {
    const pauseTimeInput = document.getElementById('pauseTime');
    const pauseUnitSelect = document.getElementById('pauseUnit');
    const autoContinueCheck = document.getElementById('autoContinue');
    const autoPauseTimeInput = document.getElementById('autoPauseTime');
    const autoPauseUnitSelect = document.getElementById('autoPauseUnit');
    const filterModeSelect = document.getElementById('filterMode');
    const siteListTextarea = document.getElementById('siteList');
    const siteListContainer = document.getElementById('siteListContainer');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');
    const statMomentsEl = document.getElementById('statMoments');
    const colorOpts = document.querySelectorAll('.color-opt');
    const proContent = document.getElementById('proContent');
    const licenseKeyInput = document.getElementById('licenseKey');
    const verifyKeyBtn = document.getElementById('verifyKeyBtn');
    const licenseField = document.getElementById('licenseField');

    let selectedColor = '#a78bfa';
    let isProUser = false;

    // Toggle Site List visibility based on mode
    const updateVisibility = () => {
        if (filterModeSelect.value === 'always') {
            siteListContainer.style.display = 'none';
        } else {
            siteListContainer.style.display = 'block';
        }
    };
    filterModeSelect.addEventListener('change', updateVisibility);

    // Color Selector logic
    colorOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            if (!isProUser) return;
            colorOpts.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedColor = opt.getAttribute('data-color');
            document.documentElement.style.setProperty('--accent', selectedColor);
        });
    });

    // License Verification
    verifyKeyBtn.addEventListener('click', () => {
        const key = licenseKeyInput.value.trim().toUpperCase();
        if (key === 'PRO-2024' || key === 'MIND-COOL-2024') {
            isProUser = true;
            chrome.storage.sync.set({ isPro: true }, () => {
                proContent.classList.remove('locked');
                licenseField.style.display = 'none';
                statusEl.textContent = 'Pro Unlocked! ✨';
                statusEl.classList.add('show');
                setTimeout(() => {
                    statusEl.classList.remove('show');
                    statusEl.textContent = 'Settings saved!';
                }, 3000);
            });
        } else {
            alert('Invalid License Key. Try "PRO-2024" for a demo.');
        }
    });

    // Load current settings
    chrome.storage.sync.get({
        pauseDuration: 0,
        pauseUnit: 'seconds',
        autoContinue: false,
        autoPauseDuration: 0,
        autoPauseUnit: 'minutes',
        filterMode: 'always',
        siteList: '',
        accentColor: '#a78bfa',
        totalMoments: 0,
        isPro: false
    }, (items) => {
        pauseTimeInput.value = items.pauseDuration;
        pauseUnitSelect.value = items.pauseUnit;
        autoContinueCheck.checked = items.autoContinue;
        autoPauseTimeInput.value = items.autoPauseDuration;
        autoPauseUnitSelect.value = items.autoPauseUnit;
        filterModeSelect.value = items.filterMode;
        siteListTextarea.value = items.siteList;
        selectedColor = items.accentColor;
        statMomentsEl.textContent = items.totalMoments;
        isProUser = items.isPro;

        if (isProUser) {
            proContent.classList.remove('locked');
            licenseField.style.display = 'none';
        }

        // Set active color in grid
        colorOpts.forEach(opt => {
            if (opt.getAttribute('data-color') === selectedColor) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
        document.documentElement.style.setProperty('--accent', selectedColor);
        updateVisibility();
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const duration = parseInt(pauseTimeInput.value) || 0;
        const unit = pauseUnitSelect.value;
        const autoContinue = autoContinueCheck.checked;
        const autoPauseDuration = parseInt(autoPauseTimeInput.value) || 0;
        const autoPauseUnit = autoPauseUnitSelect.value;
        const filterMode = filterModeSelect.value;
        const siteList = siteListTextarea.value;

        chrome.storage.sync.set({
            pauseDuration: duration,
            pauseUnit: unit,
            autoContinue: autoContinue,
            autoPauseDuration: autoPauseDuration,
            autoPauseUnit: autoPauseUnit,
            filterMode: filterMode,
            siteList: siteList,
            accentColor: selectedColor
        }, () => {
            statusEl.classList.add('show');
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 2000);
        });
    });
});
