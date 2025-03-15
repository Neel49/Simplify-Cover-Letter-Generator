

export const useGenerateButton = ({ onClick, ...props }) => {
  const generateButton = document.createElement("button");
  generateButton.id = "my-extension-generate-button";
  generateButton.textContent = "Generate Cover Letter";
  generateButton.style.position = "fixed";
  generateButton.style.bottom = "20px";
  generateButton.style.right = "20px";
  generateButton.style.zIndex = "9999";
  generateButton.style.padding = "10px 20px";
  generateButton.style.backgroundColor = "rgb(18 161 192)";
  generateButton.style.fontFamily = "Untitled Sans";
  generateButton.style.color = "#fff";
  generateButton.style.border = "none";
  generateButton.style.borderRadius = "5px";
  generateButton.style.cursor = "pointer";
  document.body.appendChild(generateButton);

  generateButton.onclick = onClick;
};

export const useAttachCoverLetter = async () => {

  const jobBoard = window.location.hostname;
  const jobPath = window.location.pathname.split('/');

  const attachCoverLetter = ( doc ) => {
    const pdfBlob = doc.output("blob");

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(pdfBlob);
    downloadLink.download = "CoverLetter.pdf";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    const fileInput = coverletterInput(jobBoard);

    if (!fileInput) alert("Unable to find cover letter input!");

    const pdfFile = new File([pdfBlob], "CoverLetter.pdf", { type: "application/pdf" });

    const dt = new DataTransfer();
    dt.items.add(pdfFile);

    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  let jobDescription = getJobDescription(jobBoard);
  cacheJobDescription(jobDescription, jobBoard, jobPath);

  if (!jobDescription && jobBoard === "jobs.lever.co") {
    console.log("Getting from cache");
    jobDescription = (await chrome.storage.local.get([jobPath[1]])[jobPath[1]]);
  }

  return { attachCoverLetter, jobDescription };
}

const cacheJobDescription = (jobDescription, jobBoard, jobPath) => {
  if (jobDescription && jobBoard === "jobs.lever.co") {
    console.log("Saving to cache!")
    chrome.storage.local.set({ [jobPath[1]]: jobDescription });
  }
}

const coverletterInput = (jobBoard) => {
  switch (jobBoard) {
    case "job-boards.greenhouse.io":
      return document.querySelector(`#cover_letter`);
    default:
      return null;
  }
};

const getJobDescription = (jobBoard) => {
  switch (jobBoard) {
    case "job-boards.greenhouse.io":
      return document.querySelector(".job__description.body")?.innerText.trim() ?? "";
    default:
      return "";
  }
}
