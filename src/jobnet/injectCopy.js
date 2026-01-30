export function injectCopy() {
  // 1. Select the parent element
  const parentContainer = document.querySelector(
    "div.flex-column:nth-child(1)",
  );

  if (!parentContainer) {
    console.error(
      '❌ Target element "div.flex-column:nth-child(1)" not found.',
    );
    return;
  }

  // 2. Create the button
  const btn = document.createElement("button");

  // 3. Add DaisyUI classes
  // Added 'mt-4' (margin-top) to ensure spacing between the last element and this button
  btn.className = "btn btn-primary btn-xl";
  btn.innerText = "Copy Job Ad";
  btn.type = "button";

  // 4. Attach the Copy Logic
  btn.onclick = async function () {
    const targetText = document.querySelector("._jobAdBody_wpmf9_19");
    if (targetText) {
      try {
        await navigator.clipboard.writeText(targetText.innerText);

        // Visual feedback
        const originalText = btn.innerText;
        btn.innerText = "Copied! ✅";
        btn.classList.replace("btn-primary", "btn-success");

        setTimeout(() => {
          btn.innerText = originalText;
          btn.classList.replace("btn-success", "btn-primary");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    } else {
      alert("Could not find the job ad text to copy.");
    }
  };

  // 5. Append the button as the LAST child
  parentContainer.appendChild(btn);

  console.log("✅ Button added to the bottom of the element.");
}
