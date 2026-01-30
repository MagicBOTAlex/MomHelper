export function injectPastebutton() {
  (function () {
    // --- 1. CONFIGURATION ---
    const SELECTORS = {
      footer:
        "footer.css-qir69p-application_assistant_job_post_footer-jobPostFooter",
      textarea: 'textarea[name="jobPost"]',
      nextBtn: ".btn--success", // The "Fortsæt" button inside the footer
      generateBtn:
        ".css-15a71ky-application_assistant_application-generateButton", // The "Generer ansøgning" button
    };

    // --- 2. SETUP ---
    const footer = document.querySelector(SELECTORS.footer);
    const textarea = document.querySelector(SELECTORS.textarea);

    if (!footer || !textarea) {
      console.error("Paste Script: Target elements not found.");
      return;
    }

    // --- 3. CREATE BUTTON (DaisyUI) ---
    const pasteBtn = document.createElement("button");
    pasteBtn.type = "button";
    pasteBtn.className = "btn btn-primary mr-4"; // DaisyUI styling + spacing
    pasteBtn.innerHTML = `Indsæt & Generer <i class="fal fa-magic ml-2"></i>`;

    // --- 4. CLICK HANDLER ---
    pasteBtn.addEventListener("click", async () => {
      try {
        // A. Get Clipboard Text
        const text = await navigator.clipboard.readText();
        if (!text) return;

        // B. Paste & Update State
        textarea.value = text;

        // Dispatch events so Formik/React enables the "Fortsæt" button
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));

        // C. Click "Fortsæt" (Delay: 100ms)
        // We wait briefly for React to remove the 'disabled' attribute
        setTimeout(() => {
          const nextBtn = footer.querySelector(SELECTORS.nextBtn);
          if (nextBtn) {
            if (nextBtn.disabled) nextBtn.disabled = false; // Force enable if lagging
            nextBtn.click();
            pasteBtn.innerText = "Fortsætter...";
          }
        }, 100);

        // D. Click "Generer ansøgning" (Delay: 1000ms after previous step)
        setTimeout(() => {
          // We query the DOM again here because this button might only appear
          // after the previous button was clicked (if it's a multi-step form).
          const generateBtn = document.querySelector(SELECTORS.generateBtn);

          if (generateBtn) {
            generateBtn.click();
            pasteBtn.innerText = "Genererer! 🚀";
          } else {
            console.warn(
              "Paste Script: 'Generer ansøgning' button not found yet.",
            );
            pasteBtn.innerText = "Knap ikke fundet ⚠️";
          }
        }, 1100); // 100ms + 1000ms = 1.1 seconds total
      } catch (err) {
        console.error("Paste Script Error:", err);
        alert("Clipboard access denied. Please allow permissions.");
      }
    });

    // --- 5. INJECT ---
    footer.prepend(pasteBtn);
  })();
}
