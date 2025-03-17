const sendMessageToContent = (message) => {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
  });
};

const getFormattedDate = () => {
  const now = new Date();
    
  const yy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  
  let hours = now.getHours();
  const amPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hh = String(hours).padStart(2, '0');
  
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  
  return `${yy}-${mm}-${dd}, ${hh}:${min}:${ss} ${amPm}`;
}


document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("api-key-input");
  const resumeInput = document.getElementById("resume-input");
  const saveButton = document.getElementById("save-button");
  const timeStamp = document.getElementById("timestamp");

  // Load saved values from localStorage
  apiKeyInput.value = (await chrome.storage.local.get(["apiKey"]))?.apiKey ?? "";
  resumeInput.value = (await chrome.storage.local.get(["resumeText"]))?.resumeText ?? "";

  timeStamp.textContent = `Last Saved: ${(await chrome.storage.local.get(["timeStamp"]))?.timeStamp ?? "Never"}`;

  sendMessageToContent({action: "update-apiKey", apiKey: apiKeyInput.value});
  sendMessageToContent({action: "update-resumeText", resumeText: resumeInput.value});


  saveButton.addEventListener("click", async () => {
    console.log("Saving", Date.now().toLocaleString("en-US"));
    await chrome.storage.local.set({apiKey: apiKeyInput.value});
    await chrome.storage.local.set({resumeText: resumeInput.value});
    await chrome.storage.local.set({timeStamp: getFormattedDate()});

    timeStamp.textContent = `Last Saved: ${getFormattedDate()}`;

    sendMessageToContent({action: "update-apiKey", apiKey: apiKeyInput.value});
    sendMessageToContent({action: "update-resumeText", resumeText: resumeInput.value});
  });
});
