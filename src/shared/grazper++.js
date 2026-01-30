//document.body.style.border = "5px solid blue";
// console.log("Grazper++ is waiting for load...");

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
// sleep(5000);


// Script settings
const zoomMoveDistance = 3;
const zoomMult = 1.15;

let instantSkipMode = true;
let frameSkipSize = 3;

console.log("Grazper++ is active!");

let numOfFrames = undefined;

let netuiSessionId = undefined; 
function setupNetuiInjection(){
    // netuiSessionId = netui.NetUi.netUiInstanceMap.entries().next().value[0]; // DEPRECATED: bad due to random behavior
    // let progressSlider = document.getElementById("player-bar-netui_" + netuiSessionId + "_frame_selector");

    let progressSlider = document.getElementsByClassName("player-bar")[0];
    let sliderId = progressSlider.id;
    let strId = sliderId.match(/\d+/g);
    netuiSessionId = strId.join("");

    // Gets num of frames
    numOfFrames = parseInt(progressSlider.max);
}

let currentCamSettingIndex = 0;
let camSettings = [{
        id: "Cam settings 1",
        x: 0,
        y: 0,
        zoom: 200,
    },
    {
        id: "Cam settings 2",
        x: 0,
        y: 0,
        zoom: 200,
    }
]

let isZoomed = false;
let viewport = document.getElementsByClassName("viewport-img-container")[0];

function isPositiveInteger(n) {
    return n >>> 0 === parseFloat(n);
}

function updateZoom(){
    if (isZoomed) {
        viewport.style = "transform: scale(" + camSettings[currentCamSettingIndex].zoom + "%) translate(" + camSettings[currentCamSettingIndex].x + "%, " + camSettings[currentCamSettingIndex].y + "%)";
        viewport.classList.add("minify-svg");
        
        if (currentCamSettingIndex == 0){
            viewport.classList.add("green_svg");
        } else {
            viewport.classList.remove("green_svg");
        }
    }else{
        viewport.style = "";
        viewport.classList.remove("minify-svg");

        viewport.classList.remove("green_svg");
    }
}

let currentFrame = 0;
function updateCurrentFrame(){
    let currentFrameLabel = document.getElementById("frame-output");
    currentFrame =  currentFrameLabel.value;
}

function updateCamSettingDisplay(){
    let playerBar = document.getElementsByClassName("player-bar")[0];

    if (currentCamSettingIndex == 0){
        playerBar.classList.add("force-green");
        playerBar.classList.remove("force-magenta");
    } else {
        playerBar.classList.add("force-magenta");
        playerBar.classList.remove("force-green");
    }
}

async function commenceFrameSkip(frames){
    let isFoward = isPositiveInteger(frames);
    for (let i = 0; i < Math.abs(frames); i++){
        if (isFoward)
            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'd', 'keyCode': '68'}));
        else
            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'a', 'keyCode': '65'}));

        // Sleep
        await new Promise(r => setTimeout(r, 75));
    }
}

function jumpToFrame(frameNum) {
    netui.NetUi.sendWidgetValue(netuiSessionId, 'frame_selector', frameNum);
    currentFrame = frameNum;
}

function initDisplayer(){
    if (document.getElementById("ZSkipSizeDisplay")) return;

    let displaySkipAmountDivContainer = document.getElementById("netui_window_point_adjustment_window_content");
    let displaySkipAmountDiv = document.createElement('div');
    displaySkipAmountDiv.id = "ZSkipSizeDisplay";
    displaySkipAmountDiv.innerHTML = "<b>Skip amount: </b>" + frameSkipSize
    + "<br/> <b>Instant skip: </b>" + ((instantSkipMode) ? "enabled!" : "disabled.");
    displaySkipAmountDivContainer.appendChild(displaySkipAmountDiv);
}

function updateSkipDisplay(){
    let displaySkipAmountDiv = document.getElementById("ZSkipSizeDisplay")
    if (!displaySkipAmountDiv){
        initDisplayer();
    }

    displaySkipAmountDiv.innerHTML = "<b>Skip amount: </b>" + frameSkipSize
    + "<br/> <b>Instant skip: </b>" + ((instantSkipMode) ? "enabled!" : "disabled.");

    let easeInSlider = document.getElementById("point_adjust_ease_in");
    if (easeInSlider.value != frameSkipSize ) {
        displaySkipAmountDiv.style.border = "1mm solid red";
    } else {
        displaySkipAmountDiv.style.border = "";
    }
}

// var cursorPos = document.createElement("div");
// cursorPos.classList.add("CursorShower");
// viewport.parentNode.appendChild(cursorPos);

// document.body.addEventListener("mousemove", function(e) {
//     cursorPos.style.left = e.clientX + "px",
//     cursorPos.style.top = e.clientY + "px";
// });


document.addEventListener('keydown', function(event) {
    if (event.keyCode === 220 || event.keyCode === 192) { // Check if the keycode is 90 (Z key)
        isZoomed = !isZoomed;
        
    }
    else if (isZoomed && event.keyCode === 107) { // Zoom in
        camSettings[currentCamSettingIndex].zoom *= zoomMult;
    }
    else if (isZoomed && event.keyCode === 109) { // Zoom out
        camSettings[currentCamSettingIndex].zoom /= zoomMult;
    }

    else if (isZoomed && event.keyCode === 100) { // left
        camSettings[currentCamSettingIndex].x += zoomMoveDistance;
    }
    else if (isZoomed && event.keyCode === 102) { // right
        camSettings[currentCamSettingIndex].x -= zoomMoveDistance;
    }
    else if (isZoomed && event.keyCode === 104) { // up
        camSettings[currentCamSettingIndex].y += zoomMoveDistance;
    }
    else if (isZoomed && event.keyCode === 98) { // down
        camSettings[currentCamSettingIndex].y -= zoomMoveDistance;
    }

    else if (isZoomed && event.keyCode === 101) { // reset
        camSettings[currentCamSettingIndex].x = 0;
        camSettings[currentCamSettingIndex].y = 0;

        camSettings[currentCamSettingIndex].zoom = 200;
    }

    else if (event.keyCode === 87){ // W
        currentCamSettingIndex = (currentCamSettingIndex == 0) ? 1 : 0;
    } 

    switch (event.keyCode) {
        case 33: // Page up
            frameSkipSize += 1;
            updateSkipDisplay();
            // console.log("Frame skip size: " + frameSkipSize);
            break;

        case 34: // Page down
            frameSkipSize -= 1;
            updateSkipDisplay();
            // console.log("Frame skip size: " + frameSkipSize);
            break;

        case 69: // E
            if (instantSkipMode) {
                jumpToFrame(parseInt(Math.min(currentFrame - -frameSkipSize, numOfFrames)));
            } else {
                commenceFrameSkip(frameSkipSize);
            }
            break;
        case 81: // Q
            if (instantSkipMode) {
                jumpToFrame(parseInt(Math.max(currentFrame - frameSkipSize, 0)));
            } else {
                commenceFrameSkip(-frameSkipSize);
            }
            break;


        case 36: // Home
            netui.NetUi.sendWidgetValue(netuiSessionId, 'frame_selector', 0);
            break;
        case 35: // End
            netui.NetUi.sendWidgetValue(netuiSessionId, 'frame_selector', numOfFrames);
            break;

        case 112: // F1
            instantSkipMode = !instantSkipMode;
            console.log("Instant skip mode " + ((instantSkipMode) ? "enabled!" : "disabled."));
            updateSkipDisplay();
            break;

    }

    updateZoom();
    updateCamSettingDisplay();
});

// Disables the transframe checkbox disabling ease-in/out
function setupDisableDisabler(){
    let transframeCheckbox = document.getElementById("trans_frame_keypoint_adjustment");
    transframeCheckbox.addEventListener('change', function() {setTimeout(disableSliderDisabler, 100)});
}
function disableSliderDisabler(){
    let easeInSlider = document.getElementById("point_adjust_ease_in");
    let easeOutSlider = document.getElementById("point_adjust_ease_out");
    easeInSlider.disabled = false;
    easeOutSlider.disabled = false;

    // setTimeout(setupZhenConfig, 100);
}

// Configures the site for my pleasure
function setupZhenConfig(){
    // let hideUnselected = document.getElementById("show_unselected_characters");
    // hideUnselected.click();

    let easeInSlider = document.getElementById("point_adjust_ease_in");
    let easeOutSlider = document.getElementById("point_adjust_ease_out");
    easeInSlider.value = 3;
    easeOutSlider.value = 3;
    easeInSlider.dispatchEvent(new Event('input'))
    easeOutSlider.dispatchEvent(new Event('input'))
}


// Redefines the half-done zoom feature out
function patchPointAdjusterZoom(){
    let mouseMovePatch = function(e, svg, posebuffer){
        let num_selected_3d_layers = this.netui.getWidget("layer3d_selector").value.length;
        //console.log("num_selected_3d_layers: " + num_selected_3d_layers);
        if (this.active_dragging != PointAdjuster.NONE){
            if (this.active_dragging == PointAdjuster.LEFT){
                if (this.keypoint_idx != -1){
                    this.finalize_dragging(this.keypoint_idx, this.selected_char_id, this.start_x, this.start_y, e.offsetX, e.offsetY);
                    this.PreviewKeypointRemove();
                }
            }
            this.cancel(e);
            this.netui.getWidget("play").enabled = true;
        }
        else {
            if (e.button == 0){
                this.active_dragging = PointAdjuster.LEFT;
                if (num_selected_3d_layers == 1){

                    const show_unselected_characters = this.netui.getWidget("show_unselected_characters").value; // TODO: You are here
                    let svgWidth = svg.viewBox.baseVal.width;
                    let svgHeight = svg.viewBox.baseVal.height;
                    this.imgSrcWidth = svgWidth;
                    this.imgSrcHeight = svgHeight;
                    this.imgScreenWidth = this.img.width; 
                    this.imgScreenHeight = this.imgScreenWidth * svgHeight / svgWidth; 
                    this.imgScreenOffsetTop = (this.img.height - this.imgScreenHeight) / 2; 
                    const click_radius = 10;
                    let closest_circle = null;
                    let smallest_dist = 10000000;

                    if (posebuffer == null){
                        console.log("posesFloatView is null");
                        return;
                    }
                    console.log("mouse from top of image = " + (e.offsetY -this.imgScreenOffsetTop));
                    for (let i = 0; i < posebuffer.length; i+=3){
                        let x = posebuffer[i]*this.imgScreenWidth;
                        let y = posebuffer[i+1]*this.imgScreenHeight;
                        let dx = e.offsetX - x;
                        let dy = e.offsetY - y- this.imgScreenOffsetTop;
                        
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < smallest_dist){
                            const skeleton_selected = selectedChrs.includes(this.chrIds[Math.floor(i/poseSize)]);
                            if (!skeleton_selected && !show_unselected_characters){
                                console.log("skipping");
                                continue;
                            }
                            smallest_dist = dist;
                            closest_circle = i;
                            }
                        }
                        
                    if (smallest_dist < click_radius){
                        this.frame_no_clicked = this.frame_no;
                        this.keypoint_idx = Math.floor(closest_circle/3) % this.numJoints
                        this.selected_char_id = this.chrIds[Math.floor(Math.floor(closest_circle/3) / this.numJoints)];
                        this.keypoint_x = posebuffer[closest_circle];
                        this.keypoint_y = posebuffer[closest_circle+1];


                        let keypoint_names = get_keypoint_names(this.skeletonType);
                        if (keypoint_names == null){
                            console.log("Unknown skeleton type: " + this.skeletonType);
                        }
                        else if (this.keypoint_idx >= keypoint_names.length){
                            console.log("keypoint_idx too large: " + this.keypoint_idx);
                        }
                        else {
                            this.keypoint_name =  keypoint_names[this.keypoint_idx];
                            this.PreviewKeypointName(this.keypoint_name, e.clientX, e.clientY);
                            console.log("keypoint_name: " + this.keypoint_name);
                        }
                    }
                    else{
                        this.keypoint_idx = -1;    
                        this.keypoint_name = "";
                    }
                }
            }    
            else if (e.button == 2){
                this.active_dragging = PointAdjuster.RIGHT;
            }
            else{
                return;
            }
            this.start_x = e.offsetX;
            this.start_y = e.offsetY;
        }
    }

    window.pointAdjuster.mousedown = mouseMovePatch;
}

// Updates current frame when using progress bar
function hookPlayerbarInteraction(){
    let playerBar = document.getElementsByClassName("player-bar")[0];
    playerBar.addEventListener('input', function(e){
        currentFrame = parseInt(this.value);
    });
}

// rebinds the functions
function rebindSeekButtons(){
    let nextBtn = document.getElementById("move_next_frame");
    nextBtn.onclick = function(){ jumpToFrame(numOfFrames)};

    let prevBtn = document.getElementById("move_previous_frame");
    prevBtn.onclick = function(){ jumpToFrame(0)};
}

// Runs at startup
setTimeout(initDisplayer, 1000);
setTimeout(updateCamSettingDisplay, 1000);
setTimeout(setupNetuiInjection, 1000);
setTimeout(patchPointAdjusterZoom, 1000);
setTimeout(updateCurrentFrame, 1000);
setTimeout(hookPlayerbarInteraction, 1000);
setTimeout(rebindSeekButtons, 1000);
setTimeout(updateSkipDisplay, 1000);

// Disables thing on site. Basically configures the site for my pleasure
setTimeout(setupDisableDisabler, 1000);
setTimeout(disableSliderDisabler, 1000);
// setTimeout(setupZhenConfig, 1000);
setTimeout(() => {
    let easeInSlider = document.getElementById("point_adjust_ease_in");
    easeInSlider.addEventListener('input', updateSkipDisplay);
}, 1000);