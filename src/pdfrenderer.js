// pdfRenderer.js

import { jsPDF } from "jspdf";
import { calibriBase64 } from "./calibri";
import { calibri_bold } from "./calibri_bold";
import { email_icon } from "./email_icon";
import { github_icon } from "./github_icon";
import { phone_icon } from "./phone_icon";
import { linkedin_icon } from "./linkedin_icon";

// --- Custom Font Setup & PDF Document Creation ---
export function createDocument() {
  // Create a new jsPDF document in letter format with point units.
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  // Add fonts.
  doc.addFileToVFS("Calibri.ttf", calibriBase64);
  doc.addFont("Calibri.ttf", "Calibri", "normal");
  doc.addFileToVFS("Calibri-Bold.ttf", calibri_bold);
  doc.addFont("Calibri-Bold.ttf", "Calibri", "bold");

  // Set initial font and font size.
  doc.setFont("Calibri", "normal");
  doc.setFontSize(20);

  return doc;
}

// --- Header Rendering ---
export function renderHeader(doc) {
  const marginTop = 72; // 1 inch from the top
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let cursorY = marginTop;
  // Header Text (Centered)
  doc.setFont("Calibri", "bold");
  doc.setFontSize(18);
  const headerText = "Neel Patel";
  const headerTextWidth = doc.getTextWidth(headerText);
  const headerX = (pageWidth - headerTextWidth) / 2;
  console.log("[DEBUG] Adding header text:", headerText, "at (", headerX, ",", cursorY, ")");
  doc.text(headerText, headerX, cursorY);
  
  // Contact Row (Centered)
  cursorY += 25; // Move down for contact row
  doc.setFont("Calibri", "normal");
  doc.setFontSize(11);
  
  const phoneText = "(780) 531 5292";
  const emailText = "n37patel@uwaterloo.ca";
  const linkedInText = "https://linkedin.com/in/1neelp";
  const githubText = "https://github.com/Neel49";
  
  // Measure text widths.
  const widthPhone = doc.getTextWidth(phoneText);
  const widthEmail = doc.getTextWidth(emailText);
  const widthLinkedIn = doc.getTextWidth(linkedInText);
  const widthGitHub = doc.getTextWidth(githubText);
  
  // Icon & spacing parameters.
  const iconWidth = 10;
  const iconHeight = 10;
  const gapAfterIcon = 5;
  const gapBetweenBlocks = 20;
  
  // Calculate block widths.
  const blockPhone = iconWidth + gapAfterIcon + widthPhone;
  const blockEmail = iconWidth + gapAfterIcon + widthEmail;
  const blockLinkedIn = iconWidth + gapAfterIcon + widthLinkedIn;
  const blockGitHub = iconWidth + gapAfterIcon + widthGitHub;
  
  // Total contact row width.
  const totalContactWidth = blockPhone + gapBetweenBlocks + 
                            blockEmail + gapBetweenBlocks + 
                            blockLinkedIn + gapBetweenBlocks + 
                            blockGitHub;
  
  // Starting xPos for centering the row.
  let xPos = (pageWidth - totalContactWidth) / 2;
  console.log("[DEBUG] totalContactWidth:", totalContactWidth, "starting xPos:", xPos, "cursorY:", cursorY);
  
  // Draw Phone block.
  doc.addImage(phone_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
  xPos += iconWidth + gapAfterIcon;
  doc.text(phoneText, xPos, cursorY);
  xPos += widthPhone + gapBetweenBlocks;
  
  // Draw Email block.
  doc.addImage(email_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
  xPos += iconWidth + gapAfterIcon;
  doc.text(emailText, xPos, cursorY);
  xPos += widthEmail + gapBetweenBlocks;
  
  // Draw LinkedIn block.
  doc.addImage(linkedin_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
  xPos += iconWidth + gapAfterIcon;
  doc.text(linkedInText, xPos, cursorY);
  xPos += widthLinkedIn + gapBetweenBlocks;
  
  // Draw GitHub block.
  doc.addImage(github_icon, "PNG", xPos, cursorY - 9, iconWidth, iconHeight);
  xPos += iconWidth + gapAfterIcon;
  doc.text(githubText, xPos, cursorY);
  
  // Add a separator line.
  cursorY += 15;
  doc.setLineWidth(0.5);
  doc.setDrawColor(150); // a gray line
  doc.line(72, cursorY, pageWidth - 72, cursorY);
  cursorY += 20;
  
  console.log("[DEBUG] Finished header section, cursorY now:", cursorY);
  return cursorY;
}

// --- Markdown Parsing ---
export function parseMarkdown(text) {
  const tokens = [];
  // This regex matches:
  // 1. Bold text: **text**
  // 2. Markdown links: [link text](url)
  // 3. Bare URLs: e.g., arxiv.org/abs/2406.13750 or https://github.com/...
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\b((https?:\/\/)?[\w.-]+\.[\w]{2,}(\/\S*)?))/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", text: text.substring(lastIndex, match.index) });
    }
    const tokenText = match[0];
    
    if (tokenText.startsWith("**")) {
      tokens.push({ type: "bold", text: tokenText.slice(2, -2) });
    } else if (tokenText.startsWith("[")) {
      const innerRegex = /\[([^\]]+)\]\(([^)]+)\)/;
      const innerMatch = innerRegex.exec(tokenText);
      if (innerMatch) {
        tokens.push({ type: "link", text: innerMatch[1], url: innerMatch[2] });
      } else {
        tokens.push({ type: "plain", text: tokenText });
      }
    } else {
      let url = tokenText;
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      tokens.push({ type: "link", text: tokenText, url });
    }
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    tokens.push({ type: "plain", text: text.substring(lastIndex) });
  }
  return tokens;
}

// --- Paragraph Rendering ---
export function renderParagraphWithFormatting(doc, paragraph, marginLeft, y, usableWidth, lineHeight) {
  const tokens = parseMarkdown(paragraph);
  let currentX = marginLeft;
  let currentY = y;
  const spaceWidth = doc.getTextWidth(" ");
  
  tokens.forEach(token => {
    const words = token.text.split(" ");
    words.forEach((word, index) => {
      const wordWithSpace = (index < words.length - 1) ? word + " " : word;
      
      if (token.type === "bold") {
        doc.setFont("Calibri", "bold");
      } else {
        doc.setFont("Calibri", "normal");
      }
      if (token.type === "link") {
        doc.setTextColor(0, 0, 255);
      } else {
        doc.setTextColor(0, 0, 0);
      }
      
      const wordWidth = doc.getTextWidth(wordWithSpace);
      if (currentX + wordWidth > marginLeft + usableWidth) {
        currentY += lineHeight;
        currentX = marginLeft;
      }
      
      if (token.type === "link") {
        doc.textWithLink(wordWithSpace, currentX, currentY, { url: token.url });
      } else {
        doc.text(wordWithSpace, currentX, currentY);
      }
      currentX += wordWidth;
    });
  });
  return currentY + lineHeight;
}

// --- PDF Generation from Cover Letter ---
export function generateCoverLetterPDF(doc, coverLetter) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const lineHeight = 14;
  const paragraphSpacing = 10;
  const marginLeft = 30;
  const marginRight = 30;
  const usableWidth = pageWidth - (marginLeft + marginRight);

  // Split cover letter into paragraphs.
  const paragraphs = coverLetter
    .replace(/\n(?!\n)/g, "\n\n")
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  doc.setFontSize(11);
  let cursorY = generateCoverLetterPDF.headerY; // assume headerY has been set after rendering header

  paragraphs.forEach(paragraph => {
    console.log("[DEBUG] Paragraph:", paragraph.substring(0, 50));
    cursorY = renderParagraphWithFormatting(doc, paragraph, marginLeft, cursorY, usableWidth, lineHeight);
    cursorY += paragraphSpacing;
  });
  
  return doc;
}
