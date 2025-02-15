document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("submit").addEventListener("click", () => {
    const apiKey = document.getElementById("api-key-input").value;
    const resumeText = document.getElementById("resume-input").value;

    localStorage.setItem("coverGen-apiKey", apiKey);
    localStorage.setItem("coverGen-resumeText", resumeText);
  });
});