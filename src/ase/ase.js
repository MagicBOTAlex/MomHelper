import { highlight } from "./highlightAi.js";
import { highlightFront } from "./highlightFrontpage.js";
import { injectPastebutton } from "./injectPasteButton.js";
import { injectDownloadButtons } from "./injectDownloadButtons.js";

export function start(isAseMain) {
  if (!isAseMain) {
    console.log("candeno");
    candeno();
  } else {
    console.log("ase main");
    ase();
  }
}

//ase.candeno.com
function candeno() {
  highlight();

  if (window.location.pathname === "/application-assistant") {
    injectPastebutton();
    injectDownloadButtons();
  } else if (window.location.pathname === "") {
    highlightFront();
  }
}

// mitase.ase.dk
function ase() {
  highlightFront();
}
