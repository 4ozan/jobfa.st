// Background script to manage extension state and tasks
chrome.runtime.onInstalled.addListener(() => {
    // Initialize default settings
    chrome.storage.local.set({
        isRunning: false,
        customSeconds: 300 // Default to 5 minutes
    });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateState') {
        // Update extension state based on popup request
        const isRunning = request.isRunning;
        chrome.storage.local.set({ isRunning });
    }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com/jobs/search')) {
        // Notify content script that page has been loaded
        chrome.tabs.sendMessage(tabId, {
            action: 'pageLoaded'
        }).catch(() => {
            // Ignore errors when content script is not yet ready
            console.log('Content script not ready');
        });
    }
});
