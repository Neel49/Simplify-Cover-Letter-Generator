# 🚀 Cover Letter Generator Chrome Extension

This Chrome extension automates the process of generating a customized cover letter using OpenAI's API. It extracts job descriptions from webpages, generates a tailored cover letter, converts it into a PDF, and automatically attaches it to the file input field on the job application page.

🔥 This is similar to what Simplify Premium offers, but with our extension, you only pay for what you use through your OpenAI account. We don’t make any money from this—it simply lets you generate cover letters at cost, using your own API key.

🔥 **ALSO, THIS ONLY WORKS ON GREENHOUSE APPLICATIONS RIGHT NOW**. (Working on getting it to work for Lever and Workday.)

⭐ **Please star the repo if you like it and make a PR if you want to contribute!** I'm constantly updating this, so keep cloning it. **Please star the repo if you like it!**

🔗 [**Click here to set up your OpenAI API key**](https://platform.openai.com/signup/)

---

## 🌟 Features

- **📝 Automated Job Description Extraction**: Fetches job descriptions directly from the webpage (currently only works on Greenhouse job boards).
- **📄 Customizable Resume and API Key Input**: Users can now input their API key and resume directly from the extension’s popup window.
- **🖱️ Button-Based Cover Letter Generation**: A "Generate Cover Letter" button has been added to the bottom right corner of job application pages for easy access.
- **🤖 AI-Powered Cover Letter Generation**: Uses OpenAI's GPT-4 API to generate a compelling, customized cover letter.
- **📜 PDF Generation and Download**: Converts the generated cover letter into a professional PDF.
- **📎 Auto-Attachment to Applications**: Automatically attaches the cover letter PDF to job applications that support file uploads.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone or Download the Project

Ensure you have the project files available on your system.

### 2️⃣ Install Dependencies

Open your terminal in the project directory and run the following commands:

```bash
npm init -y
npm install jspdf
npm install --save-dev webpack webpack-cli    
npm install --save-dev babel-loader @babel/core @babel/preset-env
```

### 3️⃣ Initial Setup

This step is done when you first install the extension. The API key and resume entry are handled in Step 6 during usage.

### 4️⃣ Build the Project

After configuring the API key and resume, run:

```bash
npm run build
```

⏳ **The build process may take up to 10 seconds.**

⚠️ **Every time you make changes to the source files, you must run `npm run build` again!**

### 5️⃣ Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer Mode** using the toggle in the top-right corner.
3. Click **Load unpacked** and select the directory containing the built extension.

### 6️⃣ Generate a Cover Letter

- **📌 Pin the Extension**: Click the extensions icon in Chrome and pin this extension for quick access.
- **📋 Enter API Key & Resume**: Click the extension icon, enter your API key and resume in the respective fields
- **🖱️ Click the "Generate Cover Letter" Button**: This button appears on job application pages in the bottom-right corner. Clicking it will automatically generate a cover letter and attach it to the application.

---

## 🛠 Troubleshooting

### ⚠️ API Issues

- Ensure your API key is correctly entered in the extension popup.
- Make sure your API key is active and has sufficient access to the OpenAI API.

### ❌ Job Description Not Found

- The script looks for a job description inside `.job__description.body`. If your target job board uses a different class name, update the selector in `contentScript.js` accordingly.

### 📂 File Attachment Not Working

- Ensure the job application page has an input field with the ID `#cover_letter`.
- If the file input field has a different ID, update `contentScript.js` to match the correct selector.

---

## ⚠️ Notes

- **🔒 This extension is for personal use only. Do not expose your OpenAI API key in a public repository.**
- **💰 Be mindful of OpenAI API usage limits to avoid unexpected costs.**

---

## 🚀 Enjoy Effortless Cover Letter Generation!

If you have any questions or issues, feel free to modify and extend the project to fit your needs. **Happy job hunting!** 🎯

