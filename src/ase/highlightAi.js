export function highlight() {
  const textSpan = document.querySelector(
    'a[href="/application-assistant"] .c-global-nav__text',
  );

  // Apply the inline style
  if (textSpan) {
    textSpan.style.color = "red";
  }
  console.log("Highlighted ai text");
}
