// DOM Elements
const statusElement = document.getElementById('status');
const toggleButton = document.getElementById('toggleButton');
const customMinutesSelect = document.getElementById('customMinutes');

// Extension State
let isRunning = false;
let currentTab = null;

// Initialize popup
async function initializePopup() {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];

    // Check if we're on LinkedIn jobs page
    const isLinkedInJobs = currentTab.url.includes('linkedin.com/jobs/search');
    
    if (!isLinkedInJobs) {
        statusElement.textContent = 'Status: Please navigate to LinkedIn Jobs page';
        toggleButton.classList.add('disabled');
        customMinutesSelect.disabled = true;
        return;
    }

    // Load saved settings
    chrome.storage.local.get(['isRunning', 'customMinutes'], (result) => {
        isRunning = result.isRunning || false;
        const savedMinutes = result.customMinutes || '5'; // Default to 5 minutes
        customMinutesSelect.value = savedMinutes;

        updateButtonState();
        
        if (isRunning) {
            statusElement.textContent = 'Status: Running';
        } else {
            statusElement.textContent = 'Status: Stopped';
        }
    });
}

// Update button state based on running status
function updateButtonState() {
    toggleButton.textContent = isRunning ? 'Stop' : 'Start';
    toggleButton.style.backgroundColor = isRunning ? '#dc3545' : '#0077b5';
}

// Convert minutes to seconds
function minutesToSeconds(minutes) {
    return minutes * 60;
}

// Toggle extension state
async function toggleExtension() {
    isRunning = !isRunning;
    
    // Save state
    chrome.storage.local.set({ isRunning });
    
    // Update UI
    updateButtonState();
    statusElement.textContent = `Status: ${isRunning ? 'Running' : 'Stopped'}`;
    
    // Get selected minutes and convert to seconds
    const selectedMinutes = customMinutesSelect.value;
    const seconds = minutesToSeconds(parseInt(selectedMinutes));
    
    // Save minutes selection and send seconds to content script
    chrome.storage.local.set({ 
        customMinutes: selectedMinutes,
        customSeconds: seconds 
    });
    
    if (currentTab) {
        try {
            await chrome.tabs.sendMessage(currentTab.id, {
                action: 'updateState',
                isRunning: isRunning
            });
        } catch (error) {
            console.error('Error communicating with content script:', error);
            statusElement.textContent = 'Status: Error - Please refresh the page';
        }
    }
}

// Handle minutes selection change
customMinutesSelect.addEventListener('change', () => {
    const minutes = parseInt(customMinutesSelect.value);
    const seconds = minutesToSeconds(minutes);
    chrome.storage.local.set({ 
        customMinutes: customMinutesSelect.value,
        customSeconds: seconds 
    });
});

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePopup);
toggleButton.addEventListener('click', toggleExtension);
