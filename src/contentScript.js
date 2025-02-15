// src/contentScript.js
import { jsPDF } from "jspdf";

console.log("[ContentScript] Script loaded. Will trigger on ANY click in the document.");

// Replace with your actual key for testing (not recommended for production)
const OPENAI_API_KEY = "API_Key";

document.addEventListener("click", async (event) => {
  console.log("[ContentScript] A click happened on the page. Starting process...");

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
  const MY_RESUME = `
Name: Jane Doe
Email: jane.doe@example.com
Experience: 2 years in Full-Stack Development
Education: BS in Computer Science
`;
  console.log("[ContentScript] Step 2: Using this resume:");
  console.log(MY_RESUME);

  // 4) Construct the prompt
  const prompt = `
Write a short, professional cover letter.

JOB DESCRIPTION:
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
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
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
    const doc = new jsPDF({
      unit: "pt",
      format: "letter",
    });
    const textLines = doc.splitTextToSize(coverLetter, 500);
    doc.text(textLines, 50, 50);

    // Convert the PDF to a Blob
    const pdfBlob = doc.output("blob");
    console.log("[ContentScript] PDF blob created. Size:", pdfBlob.size);

    // 7a) Trigger a download of the PDF to the user's downloads
    console.log("[ContentScript] Triggering download of the PDF...");
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(pdfBlob);
    downloadLink.download = "CoverLetter.pdf";
    // Append to body temporarily and trigger click
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
});
