
//console.log = function() {};

// src/contentScript.js
import { jsPDF } from "jspdf";
import { useAttachCoverLetter, createGenerateButton } from "./util";

console.log("[ContentScript] Script loaded and listening for messages...");

let OPENAI_API_KEY = (await chrome.storage.local.get(["apiKey"])).apiKey ?? "";
let MY_RESUME = (await chrome.storage.local.get(["resumeText"])).resumeText ?? "";


// Create a button at the bottom-right of the webpage
createGenerateButton({ onClick: generateCoverLetter });
const {attachCoverLetter, jobDescription} = useAttachCoverLetter();

// Main function to generate the cover letter, create a PDF, download it, and attach it.
async function generateCoverLetter() {
  
  try {

    const userContent = `
    Write a cover letter for the following job posting using the candidate’s resume. Follow the provided instructions and style guidelines.
  
    [JOB DESCRIPTION]
    ${jobDescription}
  
    [RESUME]
    ${MY_RESUME}
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ContentScript] OpenAI error:", errorText);
    }

    const data = await response.json();

    const coverLetter = data?.choices?.[0]?.message?.content?.trim() || "";

    if (!coverLetter) {
      console.warn("[ContentScript] Cover letter is empty.");
      return;
    }

    const doc = new jsPDF({
      unit: "pt",
      format: "letter",
    });

    doc.setFont("Times", "");
    doc.setFontSize(12);

    const marginLeft = 72; // 1 inch from the left
    const marginRight = 72; // 1 inch from the right
    const marginTop = 72; // 1 inch from the top
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - marginLeft - marginRight;
    const lineHeight = 14; // approximate line height in points
    const paragraphSpacing = 10; // extra spacing between paragraphs

    const paragraphs = coverLetter.split(/\n\s*\n/).map(p => p.trim()).filter(p => p);
    let cursorY = marginTop;

    paragraphs.forEach(paragraph => {
      // Wrap paragraph text to the available width
      const lines = doc.splitTextToSize(paragraph, usableWidth);
      lines.forEach(line => {
        // If the next line will overflow the page, add a new page
        if (cursorY + lineHeight > pageHeight - marginTop) {
          doc.addPage();
          cursorY = marginTop;
        }
        doc.text(line, marginLeft, cursorY);
        cursorY += lineHeight;
      });
      // Add extra spacing after each paragraph
      cursorY += paragraphSpacing;
    });

    attachCoverLetter(doc);

  } catch (error) {
    console.error("[ContentScript] Exception calling OpenAI:", error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "update-apiKey" && message.apiKey) {
    OPENAI_API_KEY = message.apiKey;
    console.log("API UPDATE", OPENAI_API_KEY);
  } else if (message.action === "update-resumeText" && message.resumeText) {
    MY_RESUME = message.resumeText;
    console.log("RESUME UPDATE", MY_RESUME);
  }
});