
//console.log = function() {};

// src/contentScript.js
import { jsPDF } from "jspdf";
import { userPrompt } from "./prompt";
import { calibriBase64} from "./calibri";
import { calibri_bold} from "./calibri_bold";
import { email_icon} from "./email_icon";
import { github_icon} from "./github_icon";
import { phone_icon} from "./phone_icon";
import { linkedin_icon} from "./linkedin_icon";
import {my_resume} from "./my_resume";
console.log("[DEBUG] github_icon value:", github_icon);

console.log("[ContentScript]   try7 for messages...");

let OPENAI_API_KEY = (await chrome.storage.local.get(["apiKey"])).apiKey ?? "";

let MY_RESUME = (await chrome.storage.local.get(["resumeText"])).resumeText ?? "";






// Create a button at the bottom-right of the webpage
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



console.log("[ContentScript] Added Generate Cover Letter button to the page.");



// Main function to generate the cover letter, create a PDF, download it, and attach it.
async function generateCoverLetter() {
  console.log("[ContentScript] generateCoverLetter() triggered.");

  // 1) Find the container that holds the job description
  const container = document.querySelector(".job__description.body");
  if (!container) {
    console.warn("[ContentScript] Could not find .job__description.body container. Stopping.");
    return;
  }
  console.log("[ContentScript] Found .job__description.body container.");

  // 2) Extract combined text (including nested h3, p, etc.)
  const jobDescription = container.innerText;
  console.log("[ContentScript] Step 1: Extracted job description text:");
  console.log(jobDescription);

  if (!jobDescription.trim()) {
    console.warn("[ContentScript] jobDescription is empty. Stopping.");
    return;
  }

  // 3) Hardcode a sample resume for demonstration
  console.log("[ContentScript] Step 2: Using this resume:");
  console.log(MY_RESUME);




  // 4) Construct the prompt
  const userContent = `
  
# Job Description
${jobDescription}




  `.trim();






  console.log("[ContentScript] Step 3: Constructed prompt for OpenAI:");
  console.log(prompt);

  // 5) Call OpenAI

  console.log("[ContentScript] Step 4: Sending request to OpenAI...");
  console.log("req", OPENAI_API_KEY, MY_RESUME);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
           ...userPrompt, 
          {
            role: "user",
            content: userContent
          }
        ],
        response_format: {
          "type": "text"
        },
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    console.log("[ContentScript] OpenAI response status:", response.status);

    if (!response.ok) {
      let errorText = await response.text();
      console.error("[ContentScript] OpenAI error:", errorText);
      return;
    }

    let data = await response.json();
    console.log("[ContentScript] Full OpenAI API response data:", data);

    // Extract the cover letter text
    let coverLetter = data?.choices?.[0]?.message?.content?.trim() || "";
    console.log("[ContentScript] Step 5: Half235etwert234 cover letter:");
    console.log(coverLetter);

    if (!coverLetter) {
      console.warn("[ContentScript] Cover letter 1 is empty.");
      return;
    }














// 6) Use jsPDF to generate a PDF from the cover letter text
console.log("[ContentScript] Step 6: Generating PDF with jsPDF...");

// Create a new jsPDF document in letter format with point units
const doc = new jsPDF({
  unit: "pt",
  format: "letter",
});












// --- Custom Font Setup ---
// Replace the placeholder with your actual base64 encoded font string.

doc.addFileToVFS("Calibri.ttf", calibriBase64);
doc.addFont("Calibri.ttf", "Calibri", "normal");

doc.addFileToVFS("Calibri-Bold.ttf", calibri_bold);
doc.addFont("Calibri-Bold.ttf", "Calibri", "bold");

// Set font to Calibri with 11 point size
doc.setFont("Calibri", "normal");
doc.setFontSize(20);









// Define margins and layout parameters
const marginTop = 72; // 1 inch from the top
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

console.log("[DEBUG] Page dimensions:", { pageWidth, pageHeight });

// ===== Add the Letterhead Header =====

// ---- 1. Header Text (Centered) ----
let cursorY = marginTop;
doc.setFont("Calibri", "bold");
doc.setFontSize(18);
const headerText = "Neel Patel";
const headerTextWidth = doc.getTextWidth(headerText);
const headerX = (pageWidth - headerTextWidth) / 2;
console.log("[DEBUG] Adding header text:", headerText, "at (", headerX, ",", cursorY, ")");
doc.text(headerText, headerX, cursorY);

// ---- 2. Contact Row (Centered) ----
cursorY += 25;  // Move down for contact row
doc.setFont("Calibri", "normal");
doc.setFontSize(11);

// Define contact info strings
const phoneText = "(780) 531 5292";
const emailText = "n37patel@uwaterloo.ca";
const linkedInText = "https://linkedin.com/in/1neelp";
const githubText = "https://github.com/Neel49";

// Measure text widths
const widthPhone = doc.getTextWidth(phoneText);
const widthEmail = doc.getTextWidth(emailText);
const widthLinkedIn = doc.getTextWidth(linkedInText);
const widthGitHub = doc.getTextWidth(githubText);

// Icon & spacing parameters
const iconWidth = 10;
const iconHeight = 10;
const gapAfterIcon = 5;
const gapBetweenBlocks = 20;

// Calculate block widths
const blockPhone = iconWidth + gapAfterIcon + widthPhone;
const blockEmail = iconWidth + gapAfterIcon + widthEmail;
const blockLinkedIn = iconWidth + gapAfterIcon + widthLinkedIn;
const blockGitHub = iconWidth + gapAfterIcon + widthGitHub;

// Total contact row width
const totalContactWidth = blockPhone + gapBetweenBlocks + 
                          blockEmail + gapBetweenBlocks + 
                          blockLinkedIn + gapBetweenBlocks + 
                          blockGitHub;

// Starting xPos for centering the row
let xPos = (pageWidth - totalContactWidth) / 2;
console.log("[DEBUG] totalContactWidth:", totalContactWidth, "starting xPos:", xPos, "cursorY:", cursorY);

// Draw Phone block
doc.addImage(phone_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
xPos += iconWidth + gapAfterIcon;
doc.text(phoneText, xPos, cursorY);
xPos += widthPhone + gapBetweenBlocks;

// Draw Email block
doc.addImage(email_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
xPos += iconWidth + gapAfterIcon;
doc.text(emailText, xPos, cursorY);
xPos += widthEmail + gapBetweenBlocks;

// Draw LinkedIn block
doc.addImage(linkedin_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
xPos += iconWidth + gapAfterIcon;
doc.text(linkedInText, xPos, cursorY);
xPos += widthLinkedIn + gapBetweenBlocks;

// Draw GitHub block
console.log("[DEBUG] github_icon value:", github_icon);
doc.addImage(github_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
xPos += iconWidth + gapAfterIcon;
doc.text(githubText, xPos, cursorY);

// ---- 3. Optional: Add a separator line under the contact row ----
cursorY += 15;  // move down a bit from the row
doc.setLineWidth(0.5);
doc.setDrawColor(150); // a gray line
doc.line(72, cursorY, pageWidth - 72, cursorY); // from left margin to right margin
cursorY += 20;  // move down more space

console.log("[DEBUG] Finished header section, cursorY now:", cursorY);











// Tokens can be: plain, bold, or link.
function parseMarkdown(text) {
  const tokens = [];
  // Regex that matches either bold (**text**) or link ([text](url))
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", text: text.substring(lastIndex, match.index) });
    }
    const tokenText = match[0];
    if (tokenText.startsWith("**")) {
      // Bold token: remove the surrounding '**'
      tokens.push({ type: "bold", text: tokenText.slice(2, -2) });
    } else if (tokenText.startsWith("[")) {
      // Link token in the format: [link text](url)
      const innerRegex = /\[([^\]]+)\]\(([^)]+)\)/;
      const innerMatch = innerRegex.exec(tokenText);
      if (innerMatch) {
        tokens.push({ type: "link", text: innerMatch[1], url: innerMatch[2] });
      } else {
        tokens.push({ type: "plain", text: tokenText });
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "plain", text: text.substring(lastIndex) });
  }
  return tokens;
}

// Render a paragraph with inline formatting and wrapping.
// It parses the paragraph into tokens and then splits them into words
// so that they wrap within the usable width. Links are rendered with blue color.
function renderParagraphWithFormatting(doc, paragraph, marginLeft, y, usableWidth, lineHeight) {
  const tokens = parseMarkdown(paragraph);
  let currentX = marginLeft;
  let currentY = y;
  // Calculate space width once
  const spaceWidth = doc.getTextWidth(" ");
  
  tokens.forEach(token => {
    // Split each token into words to handle wrapping.
    const words = token.text.split(" ");
    words.forEach((word, index) => {
      // Append a space after the word if it’s not the last word in this token.
      const wordWithSpace = (index < words.length - 1) ? word + " " : word;
      
      // Set font and color based on token type.
      if (token.type === "bold") {
        doc.setFont("Calibri", "bold");
      } else {
        doc.setFont("Calibri", "normal");
      }
      if (token.type === "link") {
        doc.setTextColor(0, 0, 255); // Blue for links
      } else {
        doc.setTextColor(0, 0, 0);   // Black for plain and bold text
      }
      
      const wordWidth = doc.getTextWidth(wordWithSpace);
      // If adding this word would exceed the usable width, move to the next line.
      if (currentX + wordWidth > marginLeft + usableWidth) {
        currentY += lineHeight;
        currentX = marginLeft;
      }
      // Render the word. For links, use textWithLink.
      if (token.type === "link") {
        doc.textWithLink(wordWithSpace, currentX, currentY, { url: token.url });
      } else {
        doc.text(wordWithSpace, currentX, currentY);
      }
      currentX += wordWidth;
    });
  });
  // Return the new y position after rendering this paragraph.
  return currentY + lineHeight;
}

// ===== Replace Old Paragraph-Splitting Code with the New Inline Rendering =====

const lineHeight = 14;
const paragraphSpacing = 10;
const marginLeft = 30;   // 1 inch left
const marginRight = 30;  // 1 inch right
const usableWidth = pageWidth - (marginLeft + marginRight);

// Split the cover letter into paragraphs based on double newlines.
const paragraphs = coverLetter
  .replace(/\n(?!\n)/g, "\n\n")   // turn single \n into double \n
  .split(/\n\s*\n/)
  .map(p => p.trim())
  .filter(Boolean);
doc.setFontSize(11);

paragraphs.forEach(paragraph => {
  console.log("[DEBUG] Paragraph:", paragraph.substring(0, 50));
  cursorY = renderParagraphWithFormatting(doc, paragraph, marginLeft, cursorY, usableWidth, lineHeight);
  cursorY += paragraphSpacing;
});

















// Continue with the remainder of your code to save, download, and attach the PDF
// Convert the PDF to a Blob
const pdfBlob = doc.output("blob");
console.log("[ContentScript] PDF blob created. Size:", pdfBlob.size);

// 7a) Trigger a download of the PDF to the user's downloads
console.log("[ContentScript] Step 7a: Triggering download of the PDF...");
const downloadLink = document.createElement("a");
downloadLink.href = URL.createObjectURL(pdfBlob);
downloadLink.download = "CoverLetter.pdf";
document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);
console.log("[ContentScript] PDF download triggered.");

// 7b) Programmatically attach the PDF to the file input
const fileInput = document.querySelector("#cover_letter");
if (!fileInput) {
  console.warn("[ContentScript] #cover_letter input not found in DOM.");
  return;
}
console.log("[ContentScript] Found #cover_letter input. Attaching file...");
const pdfFile = new File([pdfBlob], "CoverLetter.pdf", { type: "application/pdf" });
const dt = new DataTransfer();
dt.items.add(pdfFile);
fileInput.files = dt.files;
fileInput.dispatchEvent(new Event("change", { bubbles: true }));
console.log("[ContentScript] PDF file attached to #cover_letter.");















  } catch (error) {
    console.error("[ContentScript] Exception calling OpenAI:", error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Example: Do something with the received data
  if (message.action === "update-apiKey" && message.apiKey) {
    OPENAI_API_KEY = message.apiKey;
    console.log("API UPDATE", OPENAI_API_KEY);

    
  } else if (message.action === "update-resumeText" && message.resumeText) {
    MY_RESUME = message.resumeText;
    console.log("RESUME UPDATE", MY_RESUME);
  }
});




generateButton.addEventListener("click", generateCoverLetter);


