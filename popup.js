document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("submit").addEventListener("click", () => {
    const apiKey = document.getElementById("api-key-input").value;
    const resumeText = document.getElementById("resume-input").value;

    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"action": "submit", apiKey, resumeText});
  });
  });
});