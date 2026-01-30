import { highlight } from "./highlightAi.js";
import { injectPastebutton } from "./injectPasteButton.js";
import { injectDownloadButtons } from "./injectDownloadButtons.js";

export function start() {
  highlight();

  if (window.location.pathname === "/application-assistant") {
    injectPastebutton();
    injectDownloadButtons();
  }
}
