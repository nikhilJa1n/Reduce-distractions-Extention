document.addEventListener('DOMContentLoaded', () => {
    const pauseTimeInput = document.getElementById('pauseTime');
    const pauseUnitSelect = document.getElementById('pauseUnit');
    const autoContinueCheck = document.getElementById('autoContinue');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');

    // Load current settings
    chrome.storage.sync.get({
        pauseDuration: 0,
        pauseUnit: 'seconds',
        autoContinue: false
    }, (items) => {
        pauseTimeInput.value = items.pauseDuration;
        pauseUnitSelect.value = items.pauseUnit;
        autoContinueCheck.checked = items.autoContinue;
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const duration = parseInt(pauseTimeInput.value) || 0;
        const unit = pauseUnitSelect.value;
        const autoContinue = autoContinueCheck.checked;

        chrome.storage.sync.set({
            pauseDuration: duration,
            pauseUnit: unit,
            autoContinue: autoContinue
        }, () => {
            statusEl.classList.add('show');
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 2000);
        });
    });
});
