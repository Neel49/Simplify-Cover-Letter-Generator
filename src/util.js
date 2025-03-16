import { style } from "./const";

export const useGenerateButton = ({ onClick, ...props }) => {
  const generateButton = document.createElement("button");
  generateButton.id = "generate-button";

  const spinner = document.createElement("div");
  spinner.id = "spinner";

  generateButton.appendChild(spinner);

  document.head.appendChild(style);
  document.body.appendChild(generateButton);

  generateButton.onclick = onClick;

  const setButtonLoading = () => {
    generateButton.textContent = null;
    generateButton.appendChild(spinner);
    generateButton.disabled = true;
  };

  const setButtonActive = () => {
    generateButton.removeChild(spinner);
    generateButton.disabled = false;
    generateButton.textContent = "Generate ✨";
  };

  return { setButtonLoading, setButtonActive };
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
