document.addEventListener('DOMContentLoaded', () => {
    const pauseTimeInput = document.getElementById('pauseTime');
    const pauseUnitSelect = document.getElementById('pauseUnit');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');

    // Load current settings
    chrome.storage.sync.get({
        pauseDuration: 0,
        pauseUnit: 'seconds'
    }, (items) => {
        pauseTimeInput.value = items.pauseDuration;
        pauseUnitSelect.value = items.pauseUnit;
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const duration = parseInt(pauseTimeInput.value) || 0;
        const unit = pauseUnitSelect.value;

        chrome.storage.sync.set({
            pauseDuration: duration,
            pauseUnit: unit
        }, () => {
            statusEl.classList.add('show');
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 2000);
        });
    });
});
