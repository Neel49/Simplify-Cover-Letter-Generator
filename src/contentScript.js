// src/contentScript.js
import { jsPDF } from "jspdf";

console.log("[ContentScript] Script loaded and listening for messages...");

let OPENAI_API_KEY = "";
let MY_RESUME = "";



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
  const prompt = `
 

  Write a creative, passionate, and human cover letter for the below job description. Below that is the candidate's resume. The cover letter should meet the following requirements:
  
  Hook/Opening Paragraph:
  Start with an outlandish, attention-grabbing hook that shows the candidate’s excitement about transforming the industry through innovative technology. Make it imaginative and original—do not copy phrases from the job posting. (For inspiration, see the example provided below.)
  
  **Project Achievement:**
  Include a highlighted section about one of the candidate’s most impressive achievements, based on their resume. If applicable, prioritize research publications, major technical projects, or notable contributions.
  
  **Example for Style Reference (Do Not Copy Directly):
  
  Dear [Company Name] Team,
  
  The future of [industry] won’t be built by brute-force engineering—it will be [AI-first, scalable, or a similarly forward-thinking approach depending on the company]. That’s why I’m beyond excited about the opportunity to join [Company Name] as a [Job Title] and contribute to shaping the next generation of [industry technology].
  
  One of my proudest achievements is [candidate's top achievement, extracted from their resume]. This experience reinforced my passion for [key skill or industry impact] and strengthened my ability to [core skill relevant to the job description]. 
  
  Your Task:
  Now, generate a cover letter for the below job description using the above instructions while ensuring that all required details and highlights are included. KEEP IT HUMAN and customize it based on the candidate’s experience. USE PLAIN TEXT ONLY. DO NOT TRY TO DO A HEADER OR ANYTHING. JUST THE COVER LETTER.
  
  ${jobDescription}

  RESUME:
  ${MY_RESUME}
  `.trim();
  console.log("[ContentScript] Step 3: Constructed prompt for OpenAI:");
  console.log(prompt);

  // 5) Call OpenAI

  console.log("[ContentScript] Step 4: Sending request to OpenAI...");
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
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    console.log("[ContentScript] OpenAI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ContentScript] OpenAI error:", errorText);
      return;
    }

    const data = await response.json();
    console.log("[ContentScript] Full OpenAI API response data:", data);

    // Extract the cover letter text
    const coverLetter = data?.choices?.[0]?.message?.content?.trim() || "";
    console.log("[ContentScript] Step 5: Final cover letter:");
    console.log(coverLetter);

    if (!coverLetter) {
      console.warn("[ContentScript] Cover letter is empty.");
      return;
    }

    // 6) Use jsPDF to generate a PDF from the cover letter text
    console.log("[ContentScript] Step 6: Generating PDF with jsPDF...");





  // Create a new jsPDF document in letter format with point units
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  // Set font style and size to mimic a professional cover letter
  doc.setFont("Times", "");
  doc.setFontSize(12);

  // Define margins and layout parameters
  const marginLeft = 72; // 1 inch from the left
  const marginRight = 72; // 1 inch from the right
  const marginTop = 72; // 1 inch from the top
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginLeft - marginRight;
  const lineHeight = 14; // approximate line height in points
  const paragraphSpacing = 10; // extra spacing between paragraphs

  // Split the cover letter text into paragraphs (double newline as separator)
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
  if (message.action === "submit" && message.apiKey && message.resumeText) {
    OPENAI_API_KEY = message.apiKey;
    MY_RESUME = message.resumeText;
  }
});




generateButton.addEventListener("click", generateCoverLetter);


