import {InjectZComp, prependElement} from '../shared/HelperFunctions.js';

export class DistressGraph {
    constructor(sessionID) {
        this.sessionID = sessionID;
        this.interceptWebsocketPacket();
        
        // Settings
        this.saveInterval = 100; // get this amount of data before saving
        
        this.dataReceived = 0;
        let progressSlider = document.getElementsByClassName("player-bar")[0];
        this.totalFrames = parseInt(progressSlider.max);
        this.currentFrame = parseInt(progressSlider.value);

        this.injectCustomUI();

        let save = localStorage.getItem("distressData_"+this.getVideoId());
        if (save) {
            this.distressArr = JSON.parse(save);
        }
        else {
            this.distressArr = new Array(this.totalFrames).fill(undefined);
        }
        this.prevPointsLocations = {};
        
        setTimeout(() => {
            this.initDistressGraph();
        }, 250);
    }

    initDistressGraph(){
        const ctx = document.getElementById('movementChart');

        window.distressGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from(Array(this.totalFrames).keys()),
                datasets: [{
                    cubicInterpolationMode: 'monotone',
                    fill: true,
                    pointStyle: false,
                    data: this.distressArr,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                bezierCurve: false,
                maintainAspectRatio: false,
                responsive: true,
                events: null,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                x: {
                    ticks: {
                    display: false
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                    display: false
                    },
                    grid: {
                    display: false,
                    drawBorder: false
                    }
                }
            }
        }
    });
    }

    getVideoId(){
        let idHolder = document.getElementById("recording_name");
        return idHolder.innerHTML;
    }

    maybeSave(){
        if (this.dataReceived % this.saveInterval != 0) return;

        localStorage.setItem("distressData_"+this.getVideoId(), JSON.stringify(this.distressArr));
    }

    injectCustomUI(){
        let injectPoint = document.getElementById("player-bar-netui_#SESSIONID#_frame_selector".replace("#SESSIONID#", this.sessionID));
        InjectZComp(injectPoint, "DistressGraph", undefined, true, [["#SESSIONID#", this.sessionID], ["#TOTALFRAMES#", this.totalFrames], ["#CURRENTFRAME#", this.currentFrame]]);
    }

    interceptWebsocketPacket(){
        if (!window.originalOnMessage) window.originalOnMessage = window.connection.onmessage;
        window.connection.onmessage = (e) => {
            let gcp_packet = GcpPacket.fromBytes(e.data);
            
            for (let message of gcp_packet.messages) {
                let json = message.jsonObject;
                let binaryData = message.binarayData;

                // console.log(json);
                
                if (json.message != "poses") continue;
            
                let numJoints = json.header.num_joints;
                let poseSize = numJoints * 3;
                let posesFloatView = new Float64Array(binaryData.buffer);
                let currentFrame = parseInt(json["header"]["frame_no"]);
                
                let currentPointPosition = [];  // To store the points in JSON format
                
                // console.log('poseSize:', poseSize);  // Check the pose size
                // console.log('posesFloatView length:', posesFloatView.length);  // Check the array length
            
                for (let i = 0; i < posesFloatView.length; i += poseSize) {
                    for (let j = 0; j < poseSize; j += 3) {
                        if (posesFloatView[i + j + 2] < 0.5) continue;  // Ignore if Z value is less than 0.5
                        
                        let pointID = Math.floor(j / 3);  // Calculate joint ID
                        let xPos = posesFloatView[i + j];
                        let yPos = posesFloatView[i + j + 1];
                        let zPos = posesFloatView[i + j + 2];
            
                        // Check if values make sense before adding them
                        // console.log(`Joint ${pointID}: X=${xPos}, Y=${yPos}, Z=${posesFloatView[i + j + 2]}`);
                        
                        // Store the point with its ID in the JSON object

                        currentPointPosition.push([xPos, yPos, zPos]);
                    }
                }

                // console.log(json);

                if (this.prevPointsLocations[currentFrame-1] != undefined){
                    let prevPos = this.prevPointsLocations[currentFrame-1];
            
                    // Ensure the length of both arrays matches
                    if (currentPointPosition.length !== prevPos.length) {
                        console.warn(`Frame ${currentFrame} and previous frame have different number of joints`);
                        continue;
                    }
            
                    let displacementArr = [];
                    for (let i = 0; i < currentPointPosition.length; i++) {
                        let deltaX = currentPointPosition[i][0] - prevPos[i][0];
                        let deltaY = currentPointPosition[i][1] - prevPos[i][1];
                        let deltaZ = currentPointPosition[i][2] - prevPos[i][2];
            
                        // Push displacement (change between frames)
                        displacementArr.push([deltaX, deltaY, deltaZ]);
                    }
            
                    let lengthArr = [];
                    for (let i = 0; i < displacementArr.length; i++) {
                        lengthArr.push(Math.sqrt(
                                displacementArr[i][0] * displacementArr[i][0] 
                            +   displacementArr[i][1] * displacementArr[i][1] 
                            +   displacementArr[i][2] * displacementArr[i][2]));
                    }
            
                    const meanDisplacement = lengthArr.reduce((a, b) => a + b, 0) / lengthArr.length;
            
                    // Store the mean displacement in the distress array
                    this.distressArr[currentFrame] = meanDisplacement; 
                    window.distressGraph.update();  // Update the graph
                    this.maybeSave();
                }

                this.prevPointsLocations[currentFrame] = currentPointPosition;
            }

            window.originalOnMessage(e);
        };
    }
}