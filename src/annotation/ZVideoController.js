export class ZVideoController{
    constructor(netuiSessionId){
        this.netuiSessionId = netuiSessionId;

        // Register to window for easier debug
        window.videoController = this;

        // hyper params (defaults)
        this.instantSkipMode = true;
        this.skipStepSize = 4;

        let progressSlider = document.getElementsByClassName("player-bar")[0];
        this.currentFrame = parseInt(progressSlider.value);
        this.totalFrames = parseInt(progressSlider.max);


        this.customUiInjectionPoint = document.getElementById("netui_window_point_adjustment_window_content");

        this.injectCustomUI();
        this.hookPlayerbarInteraction();
    }

    injectCustomUI(){
        this.transframeCheckbox = document.getElementById("trans_frame_keypoint_adjustment");
        let isTransModeEnabled = this.transframeCheckbox.checked;

        let customHTML = `
        <div class="form-group row netui-widget-group" id="netui_{sessionID}_show_unselected_characters_div">
            <label class="col-sm-4 col-form-label netui-widget-label" for="show_unselected_characters">Show unselected characters</label>
            <div class="col-sm-8 netui-widget-div">
                <input class="netui-widget-input netui-widget-checkbox" type="checkbox" id="show_unselected_characters" oninput="netui.NetUi.sendWidgetValue('{sessionID}', 'show_unselected_characters', this.checked);">
            </div>
        </div>
        <div class="form-group row netui-widget-group" id="netui_{sessionID}_trans_frame_keypoint_adjustment_div">  
            <label class="col-sm-4 col-form-label netui-widget-label" for="trans_frame_keypoint_adjustment">Trans-frame mode</label>
            <div class="col-sm-8 netui-widget-div">
                <input class="netui-widget-input netui-widget-checkbox" type="checkbox" id="trans_frame_keypoint_adjustment" value="trans_frame_keypoint_adjustment" {TRANSFRAME_MODE} oninput="netui.NetUi.sendWidgetValue('{sessionID}', 'trans_frame_keypoint_adjustment', this.checked);">
            </div>
        </div>
        <div class="form-group row netui-widget-group">
            <label class="col-sm-4 col-form-label netui-widget-label" for="point_adjust_ease_in">Ease in and out</label>
            <div class="col-sm-8 netui-widget-div col-sm-8 netui-widget-div d-flex align-items-center">
                <input class="netui-widget-input form-range flex-grow-1 netui-widget-range" type="range" min="0" max="20" step="1" id="point_adjust_ease_in" value="4" 
                oninput="
                    this.nextElementSibling.value = netui.formatNumber(parseInt(this.value),'%d');
                    netui.NetUi.sendWidgetValue('{sessionID}', 'point_adjust_ease_in', parseInt(this.value));
                    netui.NetUi.sendWidgetValue('{sessionID}', 'point_adjust_ease_out', parseInt(this.value));
                ">
                <output class="netui-widget-range-output ms-3 fixed-width">4</output>
            </div>
        </div>



        <!-- Decoy slider -->
        <div style="display:none" class="form-group row netui-widget-group" id="netui_{sessionID}_point_adjust_ease_in_div">
        </div>
        <div style="display:none" class="form-group row netui-widget-group" id="netui_{sessionID}_point_adjust_ease_out_div">
        </div>



        <div class="form-group row netui-widget-group">
            <label class="col-sm-4 col-form-label netui-widget-label">Instant skip</label>
            <div class="col-sm-8 netui-widget-div">
                <input class="netui-widget-input netui-widget-checkbox" type="checkbox" id="instant_skip" checked="{INSTANT_SKIP_MODE}">
            </div>
        </div>
        <div class="form-group row netui-widget-group">
            <label class="col-sm-4 col-form-label netui-widget-label" for="point_adjust_ease_in">Skip step size</label>
            <div class="col-sm-8 netui-widget-div col-sm-8 netui-widget-div d-flex align-items-center">
                <input class="netui-widget-input form-range flex-grow-1 netui-widget-range" type="range" min="0" max="20" step="1" id="skipStepSize" value="4" 
                oninput="this.nextElementSibling.value = netui.formatNumber(parseInt(this.value),'%d');">
                <output class="netui-widget-range-output ms-3 fixed-width">4</output>
            </div>
        </div>
        `

        // Re-inject session id
        customHTML = customHTML.replace(/{sessionID}/g, this.netuiSessionId);

        customHTML = customHTML.replace("{INSTANT_SKIP_MODE}", this.instantSkipMode); // Inject skip mode
        customHTML = customHTML.replace("{TRANSFRAME_MODE}", (isTransModeEnabled) ? "checked" : ""); // Inject prev transframe mode state

        // Inject html
        this.customUiInjectionPoint.innerHTML = customHTML;

        // Hook events to elements
        this.instantSkipCheckbox = document.getElementById("instant_skip");
        this.sliderSkipStepSize  = document.getElementById("skipStepSize");

        this.instantSkipCheckbox.addEventListener('input', (e) => {
            this.instantSkipMode = this.instantSkipCheckbox.checked;
            //console.log(this.instantSkipCheckbox.checked);
        });
        this.sliderSkipStepSize.addEventListener('input', (e) => {
            this.skipStepSize = parseInt(this.sliderSkipStepSize.value);
            //console.log(this.sliderSkipStepSize.value);
        });

        // Sets the ease-in and out to default 4
        netui.NetUi.sendWidgetValue(this.netuiSessionId, 'point_adjust_ease_in', 4);
        netui.NetUi.sendWidgetValue(this.netuiSessionId, 'point_adjust_ease_out', 4);
    
        // // Prevent trans-frame checkbox from disabling ease in/out
        // this.transframeCheckbox = document.getElementById("trans_frame_keypoint_adjustment");
        // this.transframeCheckbox.addEventListener('input', async (e) => {
        //     //console.log(this.transframeCheckbox.checked);
        //     setTimeout(this.injectCustomUI, 100);
        // });
    }

    // Updates current frame when using progress bar
    hookPlayerbarInteraction(){
        let playerBar = document.getElementsByClassName("player-bar")[0];
        playerBar.addEventListener('input', this.updateCurrentFrame);
    }

    updateCurrentFrame = () => {
        let playerBar = document.getElementsByClassName("player-bar")[0];
        this.currentFrame = parseInt(playerBar.value);
    }

    toStart(){
        jumpToFrame(0);
    }

    toEnd(){
        jumpToFrame(this.totalFrames);
    }

    jumpToFrame(frame){
        this.currentFrame = frame;
        netui.NetUi.sendWidgetValue(this.netuiSessionId, 'frame_selector', frame);
    }

    spamForwards(){this.spamToFrame(this.skipStepSize);}
    spamBackwards(){this.spamToFrame(-this.skipStepSize);}
    async spamToFrame(frames){ // Spams key forward/backwards
        let isFoward = this.isPositiveInteger(frames);
        for (let i = 0; i < Math.abs(frames); i++){
            if (isFoward)
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'd', 'keyCode': '68'}));
            else
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'a', 'keyCode': '65'}));
    
            // Sleep
            await new Promise(r => setTimeout(r, 75));
        }
    }
    isPositiveInteger(n) {
        return n >>> 0 === parseFloat(n);
    }

    toggleSkipMode(){
        instantSkipMode = !instantSkipMode;
    }

    forward(){
        if (this.instantSkipMode){
            let nextFrame = Math.min(this.currentFrame - -this.skipStepSize, this.totalFrames); // Limits the jump within the video bounds
            this.jumpToFrame(nextFrame);
        }
        else {
            this.spamForwards();
        }
    }

    backwards(){
        if (this.instantSkipMode){
            let nextFrame = Math.max(this.currentFrame - this.skipStepSize, 0); // Limits the jump within the video bounds
            this.jumpToFrame(nextFrame);
        }
        else {
            this.spamBackwards();
        }
    }

    singleStepBack(){
        let nextFrame = Math.max(this.currentFrame - 1, 0); // Limits the jump within the video bounds
        this.jumpToFrame(nextFrame);
    }

    singleStepForward(){
        let nextFrame = Math.min(this.currentFrame - -1, this.totalFrames); // Limits the jump within the video bounds
        this.jumpToFrame(nextFrame);
    }

    doubleBack(){
        let nextFrame = Math.max(this.currentFrame - this.skipStepSize*2, 0); // Limits the jump within the video bounds
        this.jumpToFrame(nextFrame);
    }

    doubleForward(){
        let nextFrame = Math.min(this.currentFrame - -this.skipStepSize*2, this.totalFrames); // Limits the jump within the video bounds
        this.jumpToFrame(nextFrame);
    }
}