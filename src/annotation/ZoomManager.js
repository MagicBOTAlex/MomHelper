import {
  observeDOM,
  InjectZComp,
  getCookie,
} from "../shared/HelperFunctions.js";

export class ZoomManager {
  constructor(moveDist = 0.05, zoomMult = 1.15) {
    this.zoomMoveDist = moveDist;
    this.zoomMult = zoomMult;

    // Register to window for easier debug
    window.zoomManager = this;

    this.currentCamSetting = new ZoomSetting("default");

    this.isZoomed = false;
    this.viewport = document.getElementsByClassName("viewport")[0];
    this.viewportImg = document.getElementsByClassName(
      "viewport-img-container",
    )[0];

    this.viewport.addEventListener("scroll", () => {
      this.onMouseScroll();
    });
    this.InjectZoomButtons();
  }

  toggleZoom() {
    this.isZoomed = !this.isZoomed;
    this.updateZoom();
  }

  enableZoom() {
    this.isZoomed = true;
    this.updateZoom();
  }

  GetCurrentSettings() {
    return this.currentCamSetting;
  }

  SetSetting(setting) {
    this.currentCamSetting = setting;
    console.log(this.currentCamSetting);
    this.updateZoom();
  }

  InjectZoomButtons() {
    // Inject Zoom buttons
    let top_bar = document.getElementsByClassName("center-menu")[0];
    let settingsContainer = document.createElement("div");
    top_bar.insertBefore(settingsContainer, top_bar.childNodes[0]);
    InjectZComp(settingsContainer, "ScreenZoomControl");

    setTimeout(() => {
      // Attach events to buttons
      let zoomInButton = document.getElementById("ZoomInButton");
      let zoomOutButton = document.getElementById("ZoomOutButton");

      zoomInButton.addEventListener("click", () => {
        this.Move("in");
      });
      zoomOutButton.addEventListener("click", () => {
        this.Move("out");
      });
    }, 100);
  }

  Move(direction) {
    if (!this.isZoomed) this.isZoomed = true;

    this.manualMove = true; // Avoid on scroll event

    let setting = this.GetCurrentSettings();
    switch (direction) {
      case "left": // left
        setting.x -= this.zoomMoveDist;
        break;
      case "right": // right
        setting.x += this.zoomMoveDist;
        break;
      case "up": // up
        setting.y -= this.zoomMoveDist;
        break;
      case "down": // down
        setting.y += this.zoomMoveDist;
        break;

      case "in":
        if (setting.zoom < 0.05) setting.zoom = 1;

        setting.zoom *= this.zoomMult;
        break;
      case "out":
        if (setting.zoom < 0.05) setting.zoom = 1;

        setting.zoom /= this.zoomMult;
        break;
      default:
        console.log("Weird input");
        break;
    }

    this.updateZoom();
    document.dispatchEvent(new CustomEvent("OnZoomMove", {}));

    this.manualMove = false;
  }

  switchToPrevCam() {
    this.updateZoom();
  }

  resetZoom() {
    let camSettings = this.GetCurrentSettings();
    camSettings.x = 0;
    camSettings.y = 0;

    camSettings.zoom = 200;

    this.updateZoom();
  }

  updateZoom() {
    let setting = this.GetCurrentSettings();
    if (this.isZoomed) {
      this.viewportImg.style =
        "transform: scale(" +
        setting.zoom +
        "%) translate(" +
        (20 * setting.zoom) / 100 +
        "%, " +
        (35 * setting.zoom) / 100 +
        "%)";

      var maxScrollLeft = this.viewport.scrollWidth - this.viewport.clientWidth;
      var maxScrollTop =
        this.viewport.scrollHeight - this.viewport.clientHeight;

      this.viewport.scrollTo(
        setting.x * maxScrollLeft,
        setting.y * maxScrollTop,
      );

      this.viewportImg.classList.add("minify-svg");
    } else {
      this.viewportImg.style = "";
      this.viewportImg.classList.remove("minify-svg");
    }
  }

  onMouseScroll() {
    if (this.manualMove || !this.isZoomed) return;

    let camSettings = this.GetCurrentSettings();
    var maxScrollLeft = this.viewport.scrollWidth - this.viewport.clientWidth;
    var maxScrollTop = this.viewport.scrollHeight - this.viewport.clientHeight;

    camSettings.x = this.viewport.scrollLeft / maxScrollLeft;
    camSettings.y = this.viewport.scrollTop / maxScrollTop;
  }

  // Requires the "patchPointAdjusterZoom" patch
  recenterToKeypoint() {
    if (pointAdjuster.offsetX == null) {
      console.log("offsetX is null or undefined, exiting function.");
      return; // Early return if offsetX is null or undefined
    }

    let setting = this.GetCurrentSettings();

    // From decimal procent to procent procent
    setting.x = pointAdjuster.offsetX * -100 + 50;
    setting.y = pointAdjuster.offsetY * -92.5 + 50;

    // Give up...
    // // This is used for overshooting the snap (Decimal procent)
    // let overshootAmount = 1.25;
    // let overshootMaxAmount = 2;
    // // Janky code, should've used some kind of vector2
    // let xVec = ((pointAdjuster.offsetX * -100 + 50) - setting.x);
    // let yVec = ((pointAdjuster.offsetY * -92.5 + 50) - setting.y);
    // let vectorLen = Math.sqrt(Math.pow(xVec, 2) + Math.pow(yVec, 2));
    // let xNorm = xVec / vectorLen;
    // let yNorm = yVec / vectorLen;

    // console.log(`Original Vector: (${setting.x}, ${setting.y})`);
    // console.log(`Target Vector: (${xVec}, ${yVec})`);

    // setting.x += xNorm * Math.min(xVec * overshootAmount, xVec * overshootMaxAmount);
    // setting.y += yNorm * Math.min(yVec * overshootAmount, yVec * overshootMaxAmount);
    // console.log(`Final Vector: (${setting.x}, ${setting.y})`);

    this.updateZoom();
    document.dispatchEvent(new CustomEvent("OnZoomMove", {}));
  }
}

export class ZoomSetting {
  constructor(id = undefined, x = 0, y = 0, zoom = 200) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.zoom = zoom;
  }

  static castFromObject(obj) {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Input must be a valid object");
    }
    return new ZoomSetting(obj.id, obj.x, obj.y, obj.zoom);
  }

  // Ignores ID
  equals(other) {
    if (!(other instanceof ZoomSetting)) {
      return false;
    }
    return this.x === other.x && this.y === other.y && this.zoom === other.zoom;
  }

  // Ignores ID
  static compare(setting1, setting2) {
    if (
      !(setting1 instanceof ZoomSetting) ||
      !(setting2 instanceof ZoomSetting)
    ) {
      throw new Error("Both arguments must be instances of ZoomSetting");
    }

    return (
      setting1.x === setting2.x &&
      setting1.y === setting2.y &&
      setting1.zoom === setting2.zoom
    );
  }
}
