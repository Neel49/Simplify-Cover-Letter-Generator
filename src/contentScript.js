// src/contentScript.js
import { jsPDF } from "jspdf";

console.log("[ContentScript] Script loaded and listening for messages...");



const OPENAI_API_KEY = "INSERT_YOUR_API_KEY_HERE";



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
  const MY_RESUME = `
  Neel Patel
(780) 531 5292 | n37patel@uwaterloo.ca | https://linkedin.com/in/1neelp | https://github.com/Neel49
Education __________________________________________________________________________
University of Waterloo – BASc in Mechatronics Engineering Sept. 2022 – Apr. 2027
• GPA: 4.0 (93% Cumulative) – President’s Research Award, Dean’s Honour List, $26,000 Ted Rogers Future Leader Scholarship
• Relevant Courses – Data Structures and Algorithms, Computer Structures and Real-Time Systems, Systems Models, Calc III
Experience _________________________________________________________
SideFX Toronto, ON
3D Software Developer Intern Sep. 2024 – Dec. 2024
• Reduced data generation costs by 38% for the Houdini Deformer (an ML-based animation pipeline) by switching to a sparse
neural network with localized principal component analysis, trimming model parameters by 26% without sacrificing accuracy.
• Decreased ML training time by 14% by designing a modified loss function that enabled precomputation of key terms.
• Redesigned the ML pipeline to replace 50K+ direct vertex predictions with a 256-dimensional vector, reducing model size.
National Research Council Canada Waterloo, ON
Machine Learning Intern Jan. 2024 – Apr. 2024
• Lead author on a published ICMLA '24 paper [1]: Architected a classification model for respiratory diseases in chest X-rays
using knowledge distillation with PyTorch Vision Transformers, achieving 98% recall using 100K training images from the NIH.
• Deployed a data pipeline on Google Cloud Run for 30k images, performing image segmentation & normalization with a U-net.
• Migrated to Google Compute Engine for model training with COVIDx dataset (80K+ images), accelerating training by 1.3x.
Neurocage Systems Lethbridge, AB
Engineering Design Intern May 2023 – Aug. 2023
• Accelerated PyTorch model inference from 6 to 10 frames per second on a Raspberry Pi using model quantization and ARM
Compute Library optimizations with ONNX Runtime.
• Implemented Grad-CAM on an R-CNN model to generate heatmaps, corrected 500 noisy images, increasing F1-score by 5%.
• Automated brain slice image reorientation using Python and OpenCV contours, reducing manual processing time by 40%.
Sawback Technologies Calgary, AB
Hardware Design Intern Jun. 2022 – Aug 2022
• Implemented FreeRTOS onto a Xilinx UltraScale processor in C to enable concurrent GPR Mapping and data transmission.
• Reduced autonomous drone travel time by 6% by using the A* algorithm in DroneKit through the MAVLink protocol.
Publications ________________________________________________________________________
• [1] Neel Patel, Akshan Ebadi, Alexander Wong – Published at ICMLA ‘24
“Empowering Tuberculosis Screening with Explainable Self-Supervised Deep Neural Net’s” [https://arxiv.org/abs/2406.13750]
Projects__________________________________________________________
🔗 WaterlooWorks Navigator | JavaScript, jQuery UI
• With 50+ active users, my Chrome extension adds job previews with custom layouts and quick apply to WaterlooWorks.
• Created interactive modals, drag-and-drop panel/row reordering, and persistent settings via localStorage and jQuery UI.
🔗 Braille-Kit |Canada Wide Science Fair Finalist | Tensorflow, YOLOv8, Raspberry Pi, Google Cloud Platform, Python
• Built a navigation system for blind users integrating a 3D-printed braille display and YOLOv8-powered real-time hazard maps.
🔗 Vex Robotics| World Championship Tournament Qualified | C++, Fusion360
• Created autonomous self-balancing and re-orientation functions, cutting runtime by 20% within the driver-controlled phase.
Skills _____________________________________________________________
• Languages: Python, C/C++, SQL, JavaScript, HTML, CSS
• Technologies: React, PyTorch, TensorFlow, OpenCV, NumPy, Flask, Git, Heroku, GCP, Docker, Kubernetes, Linux, Bash
• ML Concepts: CNNs, Vision Transformers, Reinforcement Learning, Retrieval-Augmented Generation, k-NN Classifiers
  
  `;
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
  ${localStorage.getItem("coverGen-resumeText")}
  `.trim();
  console.log("[ContentScript] Step 3: Constructed prompt for OpenAI:");
  console.log(prompt);

  // 5) Call OpenAI

  console.log("API_KEY",localStorage.getItem("coverGen-apiKey"));

  console.log("[ContentScript] Step 4: Sending request to OpenAI...");
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("coverGen-apiKey")}`,
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

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateCoverLetter") {
    console.log("[ContentScript] Received generateCoverLetter message.");
    generateCoverLetter();
  }
});



generateButton.addEventListener("click", generateCoverLetter);


