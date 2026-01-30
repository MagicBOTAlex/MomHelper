// Perfect use of ChatGPT to reduce programming time
export function replaceTags(element, fromTagName, toTagName) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(element.innerHTML, 'text/html');

    function replaceNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            let newElement;
            if (node.tagName.toLowerCase() === fromTagName.toLowerCase()) {
                newElement = document.createElement(toTagName);
            } else {
                newElement = node.cloneNode(false);
            }
            Array.from(node.attributes).forEach(attr => newElement.setAttribute(attr.name, attr.value));
            node.childNodes.forEach(child => newElement.appendChild(replaceNode(child)));
            return newElement;
        } else {
            return node.cloneNode(true);
        }
    }

    const fragment = document.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach(child => {
        fragment.appendChild(replaceNode(child));
    });

    element.innerHTML = '';
    element.appendChild(fragment);
}

export function prependElement(parent, element) {
    parent.insertBefore(element, parent.firstChild);
}
export function truncateString(str, length, addEllipsis = false) {
    // Check if the string needs truncation
    if (str.length > length) {
        // Truncate string to the specified length
        let truncated = str.substring(0, length);
        // Add ellipsis if required
        return addEllipsis ? truncated + "..." : truncated;
    }
    // Return the original string if it's shorter than the specified length
    return str;
}

export function CreateNullGrid(width, height) {
    if (height === undefined) {
        // Single-argument version: Create a one-dimensional array
        let temp = [];
        for (let x = 0; x < width; x++) {
            temp.push(undefined);
        }
        return temp;
    } else {
        // Two-argument version: Create a two-dimensional array
        let temp = [];
        for (let x = 0; x < width; x++) {
            let temp2 = [];
            for (let y = 0; y < height; y++) {
                temp2.push(undefined);
            }
            temp.push(temp2);
        }
        return temp;
    }
}


// Function to set a near-permanent cookie (expires in 10 years)
export function setCookie(name, value) {
    const date = new Date();
    // Set the expiration date to 10 years from now
    date.setTime(date.getTime() + (10 * 365 * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

// Function to get the value of a cookie by name
export function getCookie(name) {
    const nameEQ = name + "=";
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        }
    }
    return null;
}

export function getExtensionPath(){
    let dataPass = document.getElementById("Grazper++");
    return dataPass.innerHTML;
}

export function loadHTMLAsComp(path) {
    let rawHTML = undefined;

    try {
        rawHTML = fetch(getExtensionPath() + path);
    } catch (e){}

    // regular expression to match content between the start and end markers
    const regex = /<!-- StartExtract -->\s*([\s\S]*?)\s*<!-- EndExtract -->/;
    const match = rawHTML.match(regex);

    const extractedContent = match[1].trim();
    return extractedContent;
}

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
export async function observeDOM(obj, callback) {
    if( !obj || obj.nodeType !== 1 ) return; 

    if( MutationObserver ){
    // define a new observer
    var mutationObserver = new MutationObserver(callback)

    // have the observer observe for changes in children
    mutationObserver.observe( obj, { childList:true, subtree:true })
    return mutationObserver
    }
    
    // browser support fallback
    else if( window.addEventListener ){
    obj.addEventListener('DOMNodeInserted', callback, false)
    obj.addEventListener('DOMNodeRemoved', callback, false)
    }
  }

  export function InjectZComp(injectTarget, ZCompName, sessionId=undefined, replace=false, replacements=[]) {
    let dataPass = document.getElementById("Grazper++");

    let htmlComp = dataPass.innerHTML + "/src/htmlComps/" + ZCompName + ".html";
    console.log("Getting ZComp: " + htmlComp);
    fetch(htmlComp)
        .then((resp)=>resp.text())
        .then((text)=>{
            // regular expression to match content between the start and end markers
            const regex = /<!-- StartExtract -->\s*([\s\S]*?)\s*<!-- EndExtract -->/;
            const match = text.match(regex);
            let extractedContent = match[1].trim();

            // Apply session ID replacement if provided
            if (sessionId !== undefined)
                extractedContent = extractedContent.replace("#SESSIONID#", sessionId);

            // Apply additional replacements from the array
            replacements.forEach(([target, value]) => {
                extractedContent = extractedContent.replace(new RegExp(target, 'g'), value);
            });

            // Actual injection
            if (replace){
                const newElement = document.createRange().createContextualFragment(extractedContent);
                injectTarget.parentNode?.replaceChild(newElement, injectTarget);
            } else {
                injectTarget.innerHTML = extractedContent;
            }

            // Run script tag in custom comp
            let scriptElement = injectTarget.getElementsByTagName("script")[0]; // Only get the first script tag
            if (scriptElement)
                eval(scriptElement.innerHTML);
        });
}


export function GetNetuiSessionId(){
    // Scuffed way to get the id, but i don't have the api ㄟ( ▔, ▔ )ㄏ
    let idHolderHolder = document.getElementById("netui_window_run_plugin_window_content");
    let idHolder = idHolderHolder.children[0];
    let id = idHolder.id;
    let strId = id.match(/\d+/g);
    let netuiSessionId = strId.join("");
    return netuiSessionId;
}