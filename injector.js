console.log("Attempting to inject Grazper++");

//
// 1) Replace existing paths (example: css/netui.css -> /src/annotation/other.css)
//
const pathReplacements = [
  {
    selector: 'link[rel="stylesheet"]',
    oldPath: 'css/annotation.css',
    newPath: '/src/annotation/annotationMod.css',
  },
  // You can add more replacements here:
  // {
  //   selector: 'link[rel="stylesheet"]',
  //   oldPath: 'some/old.css',
  //   newPath: '/new/path.css',
  // },
];

// Use `browser` if available, otherwise default to `chrome`
const b = typeof browser !== "undefined" ? browser : chrome;

pathReplacements.forEach(({ selector, oldPath, newPath }) => {
  document.querySelectorAll(selector).forEach((element) => {
    // If the element's 'href' contains the old path, replace it
    if (element.href.includes(oldPath)) {
      element.href = element.href = b.runtime.getURL(newPath);
    }
  });
});

//
// 2) Inject your desired CSS (in this example, DaisyUI)
//
const linkElement = document.createElement("link");
linkElement.href = "https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css";
linkElement.rel = "stylesheet";
document.head.appendChild(linkElement);

//
// 3) Inject your extension scripts as before
//
(function () {

  // Define separate scripts for each path
  const scriptsForRoot = [
    ["/src/shared/tailwind.js", false],
    ["/src/shared/chart.js", false],
    ["/src/annotation/test.js", true],
  ];

  const scriptsForIndex = [
    ["/src/shared/tailwind.js", false],
    ["/src/shared/chart.js", false],
    ["/src/projectsPage/IndexHandler.js", true],
  ];

  // Determine which set of scripts to use based on path
  const currentPath = window.location.pathname;
  const scriptsToInject = currentPath === "/index" ? scriptsForIndex : scriptsForRoot;

  // Create a hidden element to pass the extension URL to the DOM
  const dataPass = document.createElement("div");
  dataPass.id = "Grazper++";
  dataPass.style.display = "none";
  dataPass.innerHTML = b.runtime.getURL(".").slice(0, -1);
  document.documentElement.appendChild(dataPass);

  // Check if the first script in the chosen set is already loaded
  let grazperLoaded = false;
  const allScripts = document.getElementsByTagName("script");
  for (let i = 0; i < allScripts.length; i++) {
    if (
      allScripts[i].src &&
      allScripts[i].src.includes(scriptsToInject[0][0])
    ) {
      grazperLoaded = true;
      break;
    }
  }

  // Inject scripts if not loaded; otherwise, refresh page
  if (!grazperLoaded) {
    scriptsToInject.forEach(([path, isModule]) => {
      const script = document.createElement("script");
      script.src = b.runtime.getURL(path);
      if (isModule) {
        script.type = "module";
      }
      document.documentElement.appendChild(script);
    });
  } else {
    window.location.reload();
  }
})();
