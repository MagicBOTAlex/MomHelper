(async () => {
  // 1. Get the URL for the content.js file in the same directory
  const src = chrome.runtime.getURL("content.js");
  // 2. Load it as a module
  await import(src);
})();
