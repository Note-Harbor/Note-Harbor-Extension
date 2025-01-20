// only run if the current active element is note-content (add info box?)
const classWhitelist = ["note-content", "topInput"];

function makeSelectedTextBold() {
    const element = document.activeElement;
    const classesOfSelectedElement = element.classList.value;
    if (classWhitelist.some(v => classesOfSelectedElement.indexOf(v) !== -1)) {
        const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);

        if (element.nodeName === "TEXTAREA") {
            // if the entire selection is bold... 
            let pf = DOMPurify.sanitize(marked.parse(selectedText))
                        .replaceAll("<p>", "")
                        .replaceAll("<em>", "")
                        .replaceAll("<ins>", "");

            if (pf.startsWith("<strong>")) {
                const newText = selectedText
                                .replace(/\*\*/, "") // remove first instance
                                .replace(/\*\*([^\*\*]*)$/, "$1"); // remove last instance
                element.setRangeText(newText);
            } else {
                element.setRangeText(`**${selectedText}**`);
            }
        }
    }
}

function makeSelectedTextItalics() {
    const element = document.activeElement;
    const classesOfSelectedElement = element.classList.value;
    if (classWhitelist.some(v => classesOfSelectedElement.indexOf(v) !== -1)) {
        const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);

        if (element.nodeName === "TEXTAREA") {
            // if the entire selection is bold... 
            let pf = DOMPurify.sanitize(marked.parse(selectedText))
                        .replaceAll("<p>", "")
                        .replaceAll("<strong>", "")
                        .replaceAll("<ins>", "");

            if (pf.startsWith("<em>")) {
                const newText = selectedText
                                .replace(/\*/, "") // remove first instance
                                .replace(/\*([^\*]*)$/, "$1"); // remove last instance
                element.setRangeText(newText);
            } else {
                element.setRangeText(`*${selectedText}*`);
            }
        }
    }
}

function makeSelectedTextUnderlined() {
    const element = document.activeElement;
    const classesOfSelectedElement = element.classList.value;
    if (classWhitelist.some(v => classesOfSelectedElement.indexOf(v) !== -1)) {
        const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);

        if (element.nodeName === "TEXTAREA") {
            // if the entire selection is bold... 
            let pf = DOMPurify.sanitize(marked.parse(selectedText))
                        .replaceAll("<p>", "")
                        .replaceAll("<em>", "")
                        .replaceAll("<strong>", "");

            if (pf.startsWith("<ins>")) {
                const newText = selectedText
                                .replace(/<ins>/, "") // remove first instance
                                .replace(/<\/ins>([^<\/ins>]*)$/, "$1"); // remove last instance
                element.setRangeText(newText);
            } else {
                element.setRangeText(`<ins>${selectedText}</ins>`);
            }
        }
    }
}



/**
 * Generates "bottom bar" below note boxes to hold text formating buttons
 * @returns {object} bottomBar
 */
function createFormatBar() {
    const bottomBar = document.createElement("div");
    bottomBar.className = "bottom-bar";

    const bold = document.createElement("button");
    bold.textContent = "B";
    bold.style.fontWeight = "bold";
    bold.addEventListener("pointerdown", evt => {
        evt.preventDefault();
        makeSelectedTextBold();
    });

    const italic = document.createElement("button");
    italic.textContent = "I";
    italic.style.fontStyle = "italic";
    italic.addEventListener("pointerdown", evt => {
        evt.preventDefault();
        makeSelectedTextItalics();
    });

    const underline = document.createElement("button");
    underline.textContent = "U";
    underline.style.textDecoration = "underline";
    underline.addEventListener("pointerdown", evt => {
        evt.preventDefault();
        makeSelectedTextUnderlined();
    });

    bottomBar.appendChild(bold);
    bottomBar.appendChild(italic);
    bottomBar.appendChild(underline);


    return bottomBar;
}