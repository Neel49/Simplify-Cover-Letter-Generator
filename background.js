// background.js
chrome.action.onClicked.addListener((tab) => {
    console.log("[Background] Extension icon clicked. Sending message to active tab.");
    // Send a message to the active tab to trigger cover letter generation.
    chrome.tabs.sendMessage(tab.id, { action: "generateCoverLetter" });
  });
  