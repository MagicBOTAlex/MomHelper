// Redefines the point-adjuster function to increase click radius and store the current relative mouse position
export function patchPointAdjusterZoom(){
    let mouseDownPatch = function(e, svg, posebuffer){
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
                    const click_radius = 15;
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
                        let dy = e.offsetY - (y + this.imgScreenOffsetTop);
                        
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

    window.pointAdjuster.mousedown = mouseDownPatch;
    console.log("Patched: Larger click radius");




    let finalizeDragPatch = function(keypoint_idx, selected_char_id, x0, y0, x1, y1){

        // Patch
        this.offsetX = x1/this.imgScreenWidth;
        this.offsetY = y1/this.imgScreenHeight;

        let dx = (x1 - x0)/this.imgScreenWidth;
        let dy = (y1 - y0)/this.imgScreenHeight;

        let gcp_packet = {
                messages : [
                    {
                        "message": "keypointMoved",
                        "header": {
                            "keypointIndex": keypoint_idx,
                            "selectedCharId": selected_char_id,
                            "x": (this.keypoint_x + dx)*this.imgSrcWidth,
                            "y": (this.keypoint_y + dy)*this.imgSrcHeight,
                            "easeInFrames": this.netui.getWidget("point_adjust_ease_in").value,
                            "easeOutFrames": this.netui.getWidget("point_adjust_ease_out").value,
                            "layerName": this.netui.getWidget("layer3d_selector").value[0],
                            "camName" : this.netui.getWidget("thumbnail_selector").value[0],
                            "instanceId": this.netui.instanceId,
                            // "debug": this.debug,
                        }
                    }
                ],
                binarySize: 0
            }
        if (this.trans_frame_keypoint_adjustment_enabled) {
            EncodeAndSend(gcp_packet, this.ws_connection);
        }
        else {
            if (this.frame_no_clicked == this.frame_no){
                EncodeAndSend(gcp_packet, this.ws_connection);
            }
        }
    }

    window.pointAdjuster.finalize_dragging = finalizeDragPatch;
    console.log("Patched: Finalize drag");
}

export function patchFasterAnnotionSpeed(newTickInterval){
    let fasterMouseMoveDetection = function (e){
        if (this.active_dragging == PointAdjuster.LEFT){
            if (e !== undefined){
                this.previous_event = {};
                this.previous_event.offsetX = e.offsetX;
                this.previous_event.offsetY = e.offsetY;
            }
            else {
                e = this.previous_event;
            }

            if (this.keypoint_idx != -1){

                let t = performance.now();
                let dt = t - this.latest_update;
                if (dt > newTickInterval){
                    this.latest_update = t;
                    this.finalize_dragging(this.keypoint_idx, this.selected_char_id, this.start_x, this.start_y, e.offsetX, e.offsetY);
                }
                this.PreviewKeypointPosition(e.clientX, e.clientY);
            }
        }
    }

    window.pointAdjuster.mousemove = fasterMouseMoveDetection;
    console.log("Patched: Faster data send");
}

// Makes it call mousemove on mousedown, just for easier annotation
export function patchExtraMouseEvent(){
    let svgs = document.getElementsByClassName("viewport-svg");
    for (let svg of svgs) {
        svg.addEventListener("mousedown", (e) => { pointAdjuster.mousemove(e)});
    }
}

export function patchPreventRightClick(){
    const preventRightClick = (event) => {
        event.preventDefault();
        console.log('Right-click disabled on this area');
    };

    let target = document.getElementsByClassName("viewport")[0];
    target.addEventListener('contextmenu', preventRightClick);
}