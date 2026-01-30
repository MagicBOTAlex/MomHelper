import { InjectZComp, getCookie} from '../shared/HelperFunctions.js';
import { ExtendedCamController } from './ExtendedCamController.js';

export class BindsController { 

    constructor(extraCam_Controller){
        this.extraCamController = extraCam_Controller;

        console.log("Bind controller enabling...");
        setTimeout(() => {  
            this.injectUI();
        }, 500);
    }

    processInput(keycode) {
        let pressedKey = parseInt(keycode)-48; // 48 --> 1, 51 --> 2...
        let button = document.getElementById("bindsCam" + (pressedKey-1));
        let camIndex = parseInt(button.innerHTML);
        this.extraCamController.ZCams[camIndex].click();

        document.querySelectorAll(".bindsCam").forEach(btn => {
            btn.classList.remove("btn-active");
        });
        button.classList.add("btn-active");

        document.documentElement.style.setProperty('--top-bar-color', window.bindColors[pressedKey-1]);
    }

    injectUI(){
        let top_bar = document.getElementById("top-bar");
        let settingsContainer = document.createElement("div");
        top_bar.insertBefore(settingsContainer, top_bar.childNodes[2]);
        InjectZComp(settingsContainer, "MultiCam");
    }
}