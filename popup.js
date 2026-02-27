document.addEventListener('DOMContentLoaded', () => {
    const pauseTimeInput = document.getElementById('pauseTime');
    const pauseUnitSelect = document.getElementById('pauseUnit');
    const autoContinueCheck = document.getElementById('autoContinue');
    const filterModeSelect = document.getElementById('filterMode');
    const siteListTextarea = document.getElementById('siteList');
    const siteListContainer = document.getElementById('siteListContainer');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');

    // Toggle Site List visibility based on mode
    const updateVisibility = () => {
        if (filterModeSelect.value === 'always') {
            siteListContainer.style.display = 'none';
        } else {
            siteListContainer.style.display = 'block';
        }
    };
    filterModeSelect.addEventListener('change', updateVisibility);

    // Load current settings
    chrome.storage.sync.get({
        pauseDuration: 0,
        pauseUnit: 'seconds',
        autoContinue: false,
        filterMode: 'always',
        siteList: ''
    }, (items) => {
        pauseTimeInput.value = items.pauseDuration;
        pauseUnitSelect.value = items.pauseUnit;
        autoContinueCheck.checked = items.autoContinue;
        filterModeSelect.value = items.filterMode;
        siteListTextarea.value = items.siteList;
        updateVisibility();
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const duration = parseInt(pauseTimeInput.value) || 0;
        const unit = pauseUnitSelect.value;
        const autoContinue = autoContinueCheck.checked;
        const filterMode = filterModeSelect.value;
        const siteList = siteListTextarea.value;

        chrome.storage.sync.set({
            pauseDuration: duration,
            pauseUnit: unit,
            autoContinue: autoContinue,
            filterMode: filterMode,
            siteList: siteList
        }, () => {
            statusEl.classList.add('show');
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 2000);
        });
    });
});
