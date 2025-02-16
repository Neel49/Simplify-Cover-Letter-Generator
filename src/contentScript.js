
//console.log = function() {};

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





  const systemContent = `
  You are a skilled assistant specializing in writing creative, engaging, and human-like cover letters. 
  - Your goal is to generate a compelling and original cover letter tailored to the provided job description and candidate’s resume.
  - The tone should be passionate, energetic, and uniquely engaging—avoid clichés or copying phrases from the job posting.
  - The opening paragraph must have an attention-grabbing hook that highlights excitement for the industry and the company's impact.
  - Include a highlighted section about the candidate’s most impressive project or research achievement, based on their resume.
  - Keep it in plain text format—do not include headers, footers, or unnecessary formality.
  - Use the example below as inspiration for the structure and tone. Do not copy its details.
  
  **Example Cover Letter (For Style Reference Only, Do Not Copy Details):**
  
  Dear X Team,  
  AI isn’t just about optimizing algorithms—it’s about shaping how people interact with the world. That’s what excites me about X’s mission. From powering real-time recommendations to reinforcing trust and safety at an unprecedented scale, your work is where machine learning meets impact. The chance to contribute to that—to push the limits of what AI can do in dynamic, high-stakes environments—is exactly why I’m applying.  
  
  At SideFX, I worked on sparse neural networks, but not in the way most people think about them. The challenge wasn’t just making models faster—it was about rethinking how information flows through the network. Instead of relying on expensive global transformations, I designed a system that localized deformation computations, allowing certain calculations to be precomputed before training. The result? A neural network that ran leaner without sacrificing accuracy.  
  
  Beyond optimization, I care about making models that actually work in the wild. One of my proudest achievements is leading the authorship of a research paper, published at ICMLA 2024 (https://arxiv.org/abs/2406.13750)—a milestone few undergraduates can claim. My research tackled self-supervised vision transformers for medical imaging, where the problem wasn’t just classification—it was learning from unstructured, unannotated data. By leveraging self-training, I built a system that identified not just diseases like tuberculosis, but also symptoms like fibrosis—expanding the model’s scope without additional labels. That mindset—getting more from less, pushing models beyond their intended function—is something I bring to every project.  
  
  More than anything, I love working in fast-moving, high-ownership environments where the next breakthrough is always one experiment away. I’m the kind of person who’ll spend hours tweaking loss functions—not because I have to, but because I need to see if I can push the model just a little further. And if X’s office has a fridge stocked with cold brew, even better.  
  
  I’d love to chat about how my experience in ML research, model optimization, and large-scale AI systems can contribute to X’s mission. Looking forward to the conversation!  
  `.trim();



  // 4) Construct the prompt
  const userContent = `
  Write a cover letter for the following job posting using the candidate’s resume. Follow the provided instructions and style guidelines.

  [JOB DESCRIPTION]
  ${jobDescription}

  [RESUME]
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
          { role: "system", content: systemContent },
          { role: "user", content: userContent }
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
  if (message.action === "update-apiKey" && message.apiKey) {
    OPENAI_API_KEY = message.apiKey;
    console.log("API UPDATE", OPENAI_API_KEY);
  } else if (message.action === "update-resumeText" && message.resumeText) {
    MY_RESUME = message.resumeText;
    console.log("RESUME UPDATE", MY_RESUME);
  }

});




generateButton.addEventListener("click", generateCoverLetter);


