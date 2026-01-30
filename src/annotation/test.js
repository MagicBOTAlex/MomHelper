import { InputHandler } from "./InputHandler.js";

console.log("Test script injected");

let ZController = undefined;

function initGrazperExtended() {
  ZController = new InputHandler();
}

setTimeout(() => {
  initGrazperExtended();
}, 3000);
