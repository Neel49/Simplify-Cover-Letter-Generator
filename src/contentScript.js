// src/contentScript.js
import { jsPDF } from "jspdf";

console.log("[ContentScript] Script loaded and listening for messages...");

// Replace with your actual key (for testing only—do not expose in production)
const OPENAI_API_KEY = "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";

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
 
Write a creative, passionate, and human cover letter for the below job description. Below that is my resume. The cover letter should meet the following requirements:

Hook/Opening Paragraph:
Start with an outlandish, attention-grabbing hook that shows your excitement about transforming B2B billing through innovative technology. Make it imaginative and original—do not copy phrases from the job posting. (For inspiration, see the Waabi cover letter example provided below.)

Research Achievement:
Include a highlighted section about one of your proudest achievements: lead-authoring a research paper published at ICMLA 2024.

Format the URL correctly as: (https://arxiv.org/abs/2406.13750) —a
Boldly highlight this achievement (for example, by using markdown bold formatting).
Waterloo Works Job Navigator Experience:
Replace any previous experience references (like SideFX) with details about your "Waterloo Works Job Navigator" project. Include the following:

Mention that it is a Chrome extension that enhances Waterloo Works job browsing with features such as a modal-based job viewer, keyboard shortcuts (WASD + Q), and customizable layouts.
Include the GitHub link: https://github.com/Neel49/WaterlooWorks-Navigator
Boldly highlight that the extension attracted 50+ users in a single day.
You may briefly include a summary from the README if relevant (overview, key features, etc.).
Technical Skills and Passion:
Describe your strong proficiency in JavaScript, React.js, RESTful APIs, and modern web development practices. Show your excitement about writing clean, efficient code and learning new technologies. Let your passion for transforming everyday processes shine through.

Closing Paragraph:
Reiterate your enthusiasm for joining Globys and your eagerness to help streamline B2B billing processes. End with a confident, friendly sign-off.


Example for Style Reference (Do Not Copy Directly):

Dear Waabi Team,

The future of autonomy won’t be built by brute-force engineering—it will be AI-first, scalable, and fundamentally different from what’s come before. That’s why I’m beyond excited about the opportunity to join Waabi as a Research Intern and contribute to shaping the next generation of self-driving technology.

One of my proudest achievements is lead-authoring a research paper, published at ICMLA 2024 (https://arxiv.org/abs/2406.13750) —a—a milestone few undergraduates can claim. The research focused on self-supervised vision transformers for medical imaging, analyzing 100K+ chest X-rays to improve disease classification. Working with massive datasets and optimizing AI models to extract real-world insights reinforced my passion for pushing the boundaries of AI-driven perception, prediction, and control.

[The letter continues with details about technical skills and personal drive...]

Best,


Your Task:
Now, generate a cover letter for the below job descrption using the above instructions with the resume below that and ensuring that all required details and highlights are included.

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
