// Sets up the events for keyboard input
import { ZoomManager } from "./ZoomManager.js";
import { ZVideoController } from "./ZVideoController.js";
import {
  patchPointAdjusterZoom,
  patchFasterAnnotionSpeed,
  patchExtraMouseEvent,
  patchPreventRightClick,
} from "./otherPatches.js";
import { ExtendedCamController } from "./ExtendedCamController.js";
import { ImageFilderSliders } from "./ImageFilterSliders.js";
import {
  observeDOM,
  InjectZComp,
  getCookie,
  GetNetuiSessionId,
} from "./../shared/HelperFunctions.js";
import { DistressGraph } from "./DistressGraph.js";
import { BindsController } from "./BindsController.js";

export class InputHandler {
  constructor() {
    document.addEventListener("keydown", (event) => this.onKeyDown(event));

    this.settings = getCookie("settings");
    if (this.settings) {
      this.settingsExist = true;
      this.settings = JSON.parse(this.settings);
    } else {
      this.settingsExist = false;
    }

    // Inject this.settings button
    let top_bar = document.getElementById("top-bar");
    let settingsContainer = document.createElement("div");
    top_bar.insertBefore(
      settingsContainer,
      top_bar.childNodes[top_bar.childElementCount - 1],
    );
    InjectZComp(settingsContainer, "Settings");

    // Gets session id
    this.netuiSessionId = GetNetuiSessionId();

    if (!this.settings || this.settings["zoomManagerToggle"])
      this.zoomManager = new ZoomManager();
    if (!this.settings || this.settings["videoControllerToggle"]) {
      this.videoController = new ZVideoController(this.netuiSessionId);
    }
    if (!!this.settings && this.settings["distressGraph"])
      // Default off
      this.distressGraph = new DistressGraph(this.netuiSessionId);

    if (!this.settings || this.settings["extendedCamControllerToggle"]) {
      // Start extended camera controller
      this.extendedCamController = new ExtendedCamController(
        this.zoomManager,
        this.netuiSessionId,
      );
    }
    if (!this.settings || this.settings["bindsToggle"]) {
      // Start extended camera controller
      this.bindController = new BindsController(this.extendedCamController);
    }

    //patchPointAdjusterZoom();
    //patchFasterAnnotionSpeed(30);
    patchExtraMouseEvent();
    patchPreventRightClick();

    setTimeout(() => {
      this.CaptureCtrlAndAlt();
    }, 100);

    if (!this.settings || this.settings["imageFilterSlidersToggle"])
      this.imageFilderSliders = new ImageFilderSliders(this.netuiSessionId);
  }

  // ChatGPT code to save time and effort. Whatever fastest and works
  CaptureCtrlAndAlt() {
    const target = document.getElementsByClassName("viewport")[0];
    let isHovering = false;

    // Prevent scaling on Ctrl + mouse wheel
    const preventZoom = (event) => {
      if (event.altKey) {
        event.preventDefault(); // Stop browser zoom

        // Shit code but who cares /shrug
        if (event.ctrlKey) {
          if (event.deltaY < 0) {
            this.videoController.doubleBack();
          } else if (event.deltaY > 0) {
            this.videoController.doubleForward();
          }
        } else if (!event.shiftKey) {
          // Small steps
          if (event.deltaY < 0) {
            this.videoController.backwards();
          } else if (event.deltaY > 0) {
            this.videoController.forward();
          }
        } else {
          // big steps
          if (event.deltaY < 0) {
            this.videoController.singleStepBack();
          } else if (event.deltaY > 0) {
            this.videoController.singleStepForward();
          }
        }
      } else if (event.ctrlKey) {
        event.preventDefault(); // Stop browser zoom
        if (event.deltaY < 0) {
          this.zoomManager.Move("in");
        } else if (event.deltaY > 0) {
          this.zoomManager.Move("out");
        }
      }
    };

    // Mouseover event to enable listeners
    target.addEventListener("mouseover", () => {
      isHovering = true;
      target.addEventListener("wheel", preventZoom, { passive: false });
    });

    // Mouseout event to disable listeners
    target.addEventListener("mouseout", () => {
      isHovering = false;
      target.removeEventListener("wheel", preventZoom);
    });
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 220: // Check if the keycode is 220 or 192
      case 192:
        this.zoomManager.toggleZoom();
        break;
      case 100: // left
        this.zoomManager.Move("left");
        break;
      case 102: // right
        this.zoomManager.Move("right");
        break;
      case 104: // up
        this.zoomManager.Move("up");
        break;
      case 98: // down
        this.zoomManager.Move("down");
        break;

      case 107: // Zoom in
        this.zoomManager.Move("in");
        break;
      case 109: // Zoom out
        this.zoomManager.Move("out");
        break;
      case 82:
        this.zoomManager.recenterToKeypoint();
        break;

      case 101: // Reset cam (numpad 5)
        this.zoomManager.resetZoom();
        break;
      //case 101: // W
      case 112: // TEST
        this.zoomManager.switchToPrevCam();
        break;

      case 69: // E
        this.videoController.forward();
        break;
      case 81: // Q
        this.videoController.backwards();
        break;

      case 36: // Home
        this.videoController.toStart();
        break;
      case 35: // End
        this.videoController.toEnd();
        break;

      case 49: // 1
      case 50: // 2
      case 51: // 3
      case 52: // 4
        this.bindController.processInput(event.keyCode);
        break;

      case 68:
      case 65:
        this.videoController.updateCurrentFrame();
        break;

      default:
        break;
    }
  }
}
