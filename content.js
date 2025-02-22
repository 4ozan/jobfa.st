// Function to modify the time parameter in the URL
function modifyTimeParameter(seconds) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    // Set the time parameter to the custom seconds value
    params.set('f_TPR', `r${seconds}`);
    
    // Update URL without reloading
    const newUrl = `${url.origin}${url.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

// Function to refresh the page
function refreshPage() {
    window.location.reload();
}

// Initialize when the page loads
function initialize() {
    // Get custom seconds from storage (converted from minutes)
    chrome.storage.local.get(['customSeconds'], (result) => {
        const seconds = result.customSeconds || 300; // Default to 5 minutes (300 seconds)
        modifyTimeParameter(seconds);
    });
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.customSeconds) {
        modifyTimeParameter(changes.customSeconds.newValue);
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateState') {
        // Re-initialize if extension is turned on
        if (request.isRunning) {
            initialize();
        }
    }
    if (request.action === 'pageLoaded') {
        // Re-initialize when page is loaded
        initialize();
    }
});

initialize();
