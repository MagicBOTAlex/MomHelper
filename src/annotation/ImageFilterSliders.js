

export class ImageFilderSliders {
    constructor(netuiSessionId){
        this.sessionId = netuiSessionId;
        this.InjectCustomUI();

        // Register to window for easier debug
        window.imageFilderSliders = this;

        // js is stupid
        setTimeout(() => {
            this.veiwportImage = document.getElementById("viewport-img");

            // Sliders
            this.ZBrightness = document.getElementById("ZBrightness");
            this.ZContrast = document.getElementById("ZContrast");
            this.ZSaturation = document.getElementById("ZSaturation");
            this.ZHue = document.getElementById("ZHue");
            this.ZInvert = document.getElementById("ZInvert");

            this.AttachEventListener();
        }, 500);
    }

    InjectCustomUI() {
        let replaceTarget = document.getElementsByClassName("camera-menu")[0]
        let dataPass = document.getElementById("Grazper++");
        
        fetch(dataPass.innerHTML + "/src/htmlComps/ImageFilterSliders.html")
            .then((resp)=>resp.text())
            .then((text)=>{
                // regular expression to match content between the start and end markers
                const regex = /<!-- StartExtract -->\s*([\s\S]*?)\s*<!-- EndExtract -->/;
                const match = text.match(regex);

                let extractedContent = match[1].trim();
                extractedContent = extractedContent.replace("#SESSIONID#", this.sessionId); // Inject netui's session id to act like a dummy

                replaceTarget.innerHTML = extractedContent;
            });
    }

    AttachEventListener() {
        // Lazy, this works
        document.getElementById("ZImageSliders").addEventListener("mousemove", this.UpdateImageFilters);
        document.getElementById("ZImageSliders").addEventListener("click", this.UpdateImageFilters);
    }

    UpdateImageFilters(){
        if (!this.veiwportImage) {
            this.veiwportImage = document.getElementById("viewport-img");

            // Sliders
            this.ZBrightness = document.getElementById("ZBrightness");
            this.ZContrast = document.getElementById("ZContrast");
            this.ZSaturation = document.getElementById("ZSaturation");
            this.ZHue = document.getElementById("ZHue");
            this.ZInvert = document.getElementById("ZInvert");
        }

        document.getElementById("viewport-img").style['filter'] = `brightness(${this.ZBrightness.value}) contrast(${this.ZContrast.value}) saturate(${this.ZSaturation.value}) hue-rotate(${this.ZHue.value}deg) ${this.ZInvert.checked ? "invert()" : ""}`;
    }    
}