const sendMessageToContent = (message) => {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
});
};


document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("api-key-input");
  const resumeInput = document.getElementById("resume-input");

  const apiKey = await chrome.storage.local.get(["apiKey"]);

  // Load saved values from localStorage
  apiKeyInput.value = (await chrome.storage.local.get(["apiKey"])).apiKey ?? "";
  resumeInput.value = (await chrome.storage.local.get(["resumeText"])).resumeText ?? "";

  sendMessageToContent({action: "update-apiKey", apiKey: apiKeyInput.value});
  sendMessageToContent({action: "update-resumeText", resumeText: resumeInput.value});

  // Save new values on input change
  apiKeyInput.addEventListener("input", async () => {
    await chrome.storage.local.set({apiKey: apiKeyInput.value});
    sendMessageToContent({action: "update-apiKey", apiKey: apiKeyInput.value});
  });

  resumeInput.addEventListener("input", async () => {
    await chrome.storage.local.set({resumeText: resumeInput.value});
    sendMessageToContent({action: "update-resumeText", resumeText: resumeInput.value});
  });
});
