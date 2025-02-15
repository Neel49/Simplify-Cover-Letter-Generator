const sendMessageToContent = (message) => {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
});
};


document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("api-key-input");
  const resumeInput = document.getElementById("resume-input");

  // Load saved values from localStorage
  apiKeyInput.value = localStorage.getItem("apiKey") || "";
  resumeInput.value = localStorage.getItem("resumeText") || "";

  sendMessageToContent({action: "update-apiKey", apiKey: apiKeyInput.value});
  sendMessageToContent({action: "update-resumeText", resumeText: resumeInput.value});

  // Save new values on input change
  apiKeyInput.addEventListener("input", () => {
      localStorage.setItem("apiKey", apiKeyInput.value);
      sendMessageToContent({action: "update-apiKey", apiKey: apiKeyInput.value});
  });

  resumeInput.addEventListener("input", () => {
      localStorage.setItem("resumeText", resumeInput.value);
      sendMessageToContent({action: "update-resumeText", resumeText: resumeInput.value});
  });

});
