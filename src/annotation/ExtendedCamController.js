import { replaceTags, truncateString, CreateNullGrid, setCookie, getCookie, InjectZComp } from "../shared/HelperFunctions.js";
import { ZoomManager, ZoomSetting } from "./ZoomManager.js";

export class ExtendedCamController {
    constructor(zoomManager, sessionId) {
        this.NumOfCameras = this.GetNumOfCameras();
        this.sessionId = sessionId;
        this.charecterNames = this.GetCharacterNames();
        this.recordingId = this.GetRecordingId();

        this.starredCameras = ["cam20", "cam24", "cam30", "cam34"];

        // Register to window for easier debug
        window.extendedCamController = this;


        this.zoomManager = zoomManager;
        this.currentSettingIndex = [-1];

        let oldSave = getCookie(this.recordingId);
        if (oldSave) {
            console.log("Old ZCam save detected. Loading save!");
            this.zoomSettings = JSON.parse(oldSave);
            
            // Converts loaded object to ZoomSetting
            for (let i = 0; i < this.zoomSettings.length; i++) {
                if (this.zoomSettings[i] == null) continue;

                this.zoomSettings[i] = ZoomSetting.castFromObject(this.zoomSettings[i]);
            }

            console.log("Loaded: ");
            console.log(this.zoomSettings);
        }
        else {
            console.log("No ZCam save detected. Creating new");
            this.zoomSettings = CreateNullGrid(this.NumOfCameras);
        }

        // JS is soo bad. This works for now ㄟ( ▔, ▔ )ㄏ
        setTimeout(() => {
            this.createDummy();

            this.initZCams();
            this.injectCustomUI();
            this.UpdateCustomUI();

            setTimeout(() => {
                this.setupClickEvents();
            }, 500);
        }, 500);

        document.addEventListener("OnZoomMove", () => {this.SaveCurrentZCam();});
    }

    GetNumOfCharecters() {
        let charecterContainer = document.getElementById("character-menu");
        let characterListElement = charecterContainer.getElementsByClassName("netui-multicombo-ul")[0];
        let characterList = characterListElement.querySelectorAll('li')
        return parseInt(characterList.length);
    }

    GetCharacterNames() {
        let characterContainer = document.getElementById("character-menu");
        let characterListElement = characterContainer.getElementsByClassName("netui-multicombo-ul")[0];
        let characterList = characterListElement.querySelectorAll('a');
        let names = Array.from(characterList).map(anchor => anchor.innerHTML);
        names.sort();
        return names;
    }

    GetNumOfCameras() {
        let cameraContainer = document.getElementById("netui_window_thumbnail_window_content");
        let cameraListElement = cameraContainer.getElementsByClassName("netui-multicombo-ul")[0];
        let cameraList = cameraListElement.querySelectorAll('li')
        return parseInt(cameraList.length);
    }

    GetRecordingId() {
        return "ZCAM_" + document.getElementById("recording_name").innerHTML; // Has watermark because funny
    }

    // Used to suppress the netUI's updates
    createDummy() {
        // Remove old refrence
        let realElement = document.getElementById("netui_" + this.sessionId + "_thumbnail_selector_div");
        let insertLocation = realElement.parentNode
        realElement.id = "ExtendedCameraController";

        // Create dummy to receive updates
        let dummyElement = document.createElement("div");
        dummyElement.style.display = "none";
        dummyElement.id = ("netui_" + this.sessionId + "_thumbnail_selector_div");

        dummyElement.innerHTML = `<ul><li></li></ul>` // Has to have a child because of Grazper's hard coding

        insertLocation.insertBefore(dummyElement, insertLocation.firstChild);
    }

    initZCams() {
        let camList = document.getElementById("ExtendedCameraController");
        let listElements = camList.getElementsByClassName("netui-multicombo-li");
        this.ZCams = [];
        for (let i = 0; i < listElements.length; i++) {
            let zcam = listElements[i].childNodes[0];
            zcam.id = "ZCam_" + i;
            zcam.classList.add("ZCam");
            this.ZCams.push(zcam)
        }
        console.log(this.ZCams);
    }

    injectCustomUI() {
        let camList = document.getElementById("ExtendedCameraController");
        replaceTags(camList, 'a', 'div');
        this.ZCams = document.getElementsByClassName("ZCam"); // Re defines the list because replace deletes the events attached

        // Remove old netui class and insert better looking class
        for (let i = 0; i < this.ZCams.length; i++) {
            let zcam = this.ZCams[i];
            zcam.classList.add("btn", "btn-outline", "btn-lg");

            // Check if is selected
            if (zcam.classList.contains("netui-multicombo-selected")) {
                zcam.classList.remove("btn-outline");
                zcam.classList.add("btn-neutral");
            }

            zcam.classList.add("ZCamButton", "join-item", "btn", "btn-warning", "btn-outline", "flex");
            zcam.id = `ZCamButton_${i}`;
            
            zcam.addEventListener('click', () => {
                this.OnZCamRequest(zcam, i);
            });

            zcam.classList.remove("netui-multicombo-notselected", "netui-multicombo-selected");


            // Add star to text if it's my favorite
            // Also rename buttons
            if (this.starredCameras.includes(zcam.innerHTML)){
                zcam.innerHTML = i + " ⭐";
            } else {
                zcam.innerHTML = i;
            }

        }
    }

    // Updates the states of the ZCamButtons
    UpdateCustomUI() {
        let allZCamButtons = document.getElementsByClassName("ZCamButton");
        let currentlySelected = undefined;
        for (let i = 0; i < allZCamButtons.length; i++) {
            let zcamBtn = allZCamButtons[i];
            let currentX = this.currentSettingIndex;

            // Show selected button
            if (currentX == i) {
                zcamBtn.classList.add("btn-success");
                zcamBtn.classList.remove("btn-warning");
                zcamBtn.classList.remove("btn-outline");
            }
            else if (this.zoomSettings[i] == null) {
                zcamBtn.classList.remove("btn-success");
                zcamBtn.classList.add("btn-warning");
                zcamBtn.classList.add("btn-outline");
            } else {
                zcamBtn.classList.remove("btn-warning");
                zcamBtn.classList.add("btn-success");
                zcamBtn.classList.add("btn-outline");
            }
        }
    }

    SaveCurrentZCam() {
        // Save old setting if not "default"
        let currentSetting = this.zoomManager.GetCurrentSettings();
        if (this.currentSettingIndex.toString() !== (-1).toString() // Check if is first setting
            && !ZoomSetting.compare(currentSetting, new ZoomSetting()) // Check if setting is unchanged
        ) {
            this.zoomSettings[this.currentSettingIndex] = currentSetting;

            // Save to local storage
            setCookie(this.recordingId, JSON.stringify(this.zoomSettings));
            //console.log("Saving");
        }
    }

    OnZCamRequest(senderElement, camIndex) {
        // console.log("Changing from: " + this.currentSettingPosition.toString());
        // console.log("Changing to: " + [camIndex, ZCamIndex]);

        // Enable zoom if not already
        this.zoomManager.enableZoom();  

        this.SaveCurrentZCam();

        // Create new if null
        let requestedSetting = this.zoomSettings[camIndex];
        if (requestedSetting == null) {
            console.log("No save found, creating new");
            requestedSetting = new ZoomSetting(`ZCam: ${camIndex}`);
        }

        this.currentSettingIndex = camIndex;
        this.zoomManager.SetSetting(requestedSetting);

        // Update UI
        this.UpdateCustomUI();
    }

    setupClickEvents() {
        for (let i = 0; i < this.ZCams.length; i++) {
            this.ZCams[i].addEventListener('click', () => {
                this.onCameraClicked(this.ZCams[i], i);
            });
        }
    }

    // Cameras index
    onCameraClicked(sender, index) {
        let camList = document.getElementById("ExtendedCameraController");
        let selectedCssElements = camList.getElementsByClassName("btn-neutral");
        for (let i = 0; i < selectedCssElements.length; i++) {
            selectedCssElements[i].classList.add("btn-outline");
            selectedCssElements[i].classList.remove("btn-neutral");
        }

        sender.classList.remove("btn-outline");
        sender.classList.add("btn-neutral");
    }
}