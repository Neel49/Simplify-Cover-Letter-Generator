# 🚀 Cover Letter Generator Chrome Extension

This Chrome extension automates the process of generating a customized cover letter using OpenAI's API. It extracts job descriptions from webpages, generates a tailored cover letter, converts it into a PDF, and automatically attaches it to the file input field on the job application page.

🔥 **This is basically what Simplify extension users get if they pay for it.** But my lazy ass didn't wanna give them a profit, so I made it myself. **IT DOES COST MONEY** (you need an OpenAI API key), but I, the developer, make **no money off this**. **ALSO, THIS ONLY WORKS ON GREENHOUSE APPLICATIONS RIGHT NOW**. (Working on getting it to work for Lever and Workday.)

⭐ **Please star the repo if you like it and make a PR if you want to contribute!** I'm constantly updating this, so keep cloning it. **Please star the repo if you like it!**

🔗 **[Click here to set up your OpenAI API key](https://platform.openai.com/signup/)**

---

## 🌟 Features

- **📝 Automated Job Description Extraction**: Fetches job descriptions directly from the webpage (currently only works on Greenhouse job boards).
- **📄 Customizable Resume and Prompt**: Users can insert their own resume and modify the prompt to suit different applications.
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
npm install path-browserify os-browserify crypto-browserify
```

### 3️⃣ Configure Your OpenAI API Key

- Create a `.env` file in the project root directory.
- Add your OpenAI API key to the `.env` file:
  ```env
  OPENAI_API_KEY=your_openai_api_key_here
  ```

### 4️⃣ Add Your Resume and Change Prompt as Necessary

- Open `src/contentScript.js`.
- Replace the placeholder resume (`MY_RESUME` variable) with your actual resume details.
- Modify the prompt (`prompt` variable) to better suit your job applications.

### 5️⃣ Build the Project

After configuring the API key and resume, run:

```bash
npm run build
```

⏳ **The build process may take up to 10 seconds.**

⚠️ **Every time you make changes to `contentScript.js`, you must run `npm run build` again!**

### 6️⃣ Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer Mode** using the toggle in the top-right corner.
3. Click **Load unpacked** and select the directory containing the built extension.

### 7️⃣ Activate the Extension

- **📌 Pin the Extension**: Click the extensions icon in Chrome and pin this extension for quick access.
- **⚡ Click to Generate**: When on a job application page, click the extension icon to extract the job description, generate a cover letter, download the PDF, and attach it to the application.

---

## 🛠 Troubleshooting

### ⚠️ API Issues

- Ensure your API key is correct and that it has sufficient access to the OpenAI API.
- Check your `.env` file formatting and verify the key is being read correctly.

### ❌ Job Description Not Found

- The script looks for a job description inside `.job__description.body`. If your target job board uses a different class name, update the selector in `contentScript.js` accordingly.

### 📂 File Attachment Not Working

- Ensure the job application page has an input field with the ID `#cover_letter`.
- If the file input field has a different ID, update `contentScript.js` to match the correct selector.

---

## ⚠️ Notes

- **💰 Be mindful of OpenAI API usage limits to avoid unexpected costs.**

---

## 🚀 Enjoy Effortless Cover Letter Generation!

If you have any questions or issues, feel free to modify and extend the project to fit your needs. **Happy job hunting!** 🎯
