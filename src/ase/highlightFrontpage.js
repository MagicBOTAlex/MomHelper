export function highlightFront() {
  // 1. Select all links with the class 'situation-link'
  const links = document.querySelectorAll("a.situation-link");

  // 2. Define the words we want to match
  // 'i' makes it case-insensitive
  const regex = /karriere|postkasse/i;

  links.forEach((link) => {
    // 3. Test if the link text matches either word
    if (regex.test(link.textContent)) {
      // 4. Make the anchor tag red
      link.style.color = "pink";

      // Ensure nested spans also inherit the red color
      link.style.setProperty("color", "pink", "important");
    }
  });
}
