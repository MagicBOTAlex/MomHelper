export function injectDownloadButtons() {
  // CONFIG: The specific selectors provided
  const FOOTER_SELECTOR =
    ".css-d0z2c5-application_assistant_application-footer";
  const EDITOR_SELECTOR =
    ".css-18ytdmt-application_assistant_application-editor";
  const UNIQUE_ID = "custom-download-buttons-wrapper"; // Prevents duplicates

  // 2. MAIN LOGIC: Create and Insert Buttons
  const addButtonsToFooter = (footer) => {
    // Stop if we already added buttons to this specific footer
    if (footer.querySelector(`#${UNIQUE_ID}`)) return;

    // Create a wrapper to hold our buttons (helps with duplicates/spacing)
    const wrapper = document.createElement("div");
    wrapper.id = UNIQUE_ID;
    wrapper.style.display = "inline-flex";
    wrapper.style.marginLeft = "10px";

    // --- Logic: Get Content & Name ---
    const getData = () => {
      const editor =
        document.querySelector(EDITOR_SELECTOR) ||
        document.querySelector('[contenteditable="true"]');

      if (!editor) {
        alert("Could not find the text editor content.");
        return null;
      }

      let name = prompt("Navn", "");

      // Get text
      let text = editor.innerText || editor.textContent;

      // 1. Check if a name was actually entered
      if (name) {
        // 2. Replace the first instance of [...] found
        // \[ matches the opening bracket
        // .*? matches any content inside (non-greedy)
        // \] matches the closing bracket
        text = text.replace(/\[.*?\]/, name);
      }

      return name ? { text, filename: "Min_ansøgning" } : null;
    };

    // --- Logic: Button Factory ---
    const createBtn = (label, iconClass, bgColor, action) => {
      const btn = document.createElement("button");
      // Copying classes from your example footer button
      btn.className =
        "btn btn--md btn--filled btn--success css-wzi1tu-application_assistant_application-buttonCopy";
      btn.type = "button";
      btn.style.backgroundColor = bgColor;
      btn.style.marginLeft = "8px";

      btn.innerHTML = `
                <span class="btn__inner">
                    <span class="btn__label">
                        <i class="${iconClass}" aria-hidden="true" style="margin-right:5px;"></i>${label}
                    </span>
                </span>
            `;
      btn.onclick = action;
      return btn;
    };

    // --- TXT Button ---
    const txtBtn = createBtn("TXT", "fal fa-file-alt", "#2ecc71", () => {
      const data = getData();
      if (!data) return;
      const blob = new Blob([data.text], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.filename}.txt`;
      a.click();
    });

    // --- PDF Button ---
    const pdfBtn = createBtn("PDF", "fal fa-file-pdf", "#e74c3c", async () => {
      const data = getData();
      if (!data) return;

      if (!window.jspdf) {
        alert("PDF engine loading... try again in 2 seconds.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(data.text, 180);
      doc.setFontSize(12);
      doc.text(splitText, 15, 20);
      doc.save(`${data.filename}.pdf`);
    });

    // Append to wrapper, then to footer
    wrapper.appendChild(txtBtn);
    wrapper.appendChild(pdfBtn);
    footer.appendChild(wrapper);
    console.log("Download buttons injected successfully.");
  };

  // 3. OBSERVER: Watch the DOM for changes
  const observer = new MutationObserver((mutations) => {
    const footer = document.querySelector(FOOTER_SELECTOR);
    if (footer) {
      addButtonsToFooter(footer);
    }
  });

  // Start watching the body for added nodes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try immediately in case it's already there
  const existingFooter = document.querySelector(FOOTER_SELECTOR);
  if (existingFooter) addButtonsToFooter(existingFooter);

  console.log("Observer started: Waiting for footer to appear...");
}
