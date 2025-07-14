/**
 * Generates "bottom bar" below note boxes to hold text formating buttons
 * @returns {object} bottomBar
 */
function createFormatBar() {
    const bottomBar = document.createElement("div");
    bottomBar.className = "bottom-bar";

    bottomBar.innerHTML = `
  <span class="ql-formats">
    <button class="ql-bold"></button>
    <button class="ql-italic"></button>
    <button class="ql-underline"></button>
    <button class="ql-strike"></button>
  </span>
  <span class="ql-formats">
    <button class="ql-script" value="sub"></button>
    <button class="ql-script" value="super"></button>
  </span>`;

    return bottomBar;

    // only run if the current active element is note-content (add info box?)
    const classWhitelist = ["note-content", "topInput"];

    const bold = document.createElement("button");
    bold.textContent = "B";
    bold.style.fontWeight = "bold";
    bold.addEventListener("pointerdown", evt => {
        evt.preventDefault();
        const element = document.activeElement;
        const classesOfSelectedElement = element.classList.value;
        if (classWhitelist.some(v => classesOfSelectedElement.indexOf(v) !== -1)) {
            const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);

            if (element.nodeName === "TEXTAREA") {
                // if the entire selection is bold... 
                if (selectedText.match(/^\*\*.+\*\*$/)) {
                    element.setRangeText(selectedText.substring(2, selectedText.length - 2));
                } else {
                    element.setRangeText(`**${selectedText}**`);
                }
            }
        }
    });

    const italic = document.createElement("button");
    italic.textContent = "I";
    italic.style.fontStyle = "italic";
    italic.addEventListener("pointerdown", evt => {
        evt.preventDefault();
        const element = document.activeElement;
        const classesOfSelectedElement = element.classList.value;
        if (classWhitelist.some(v => classesOfSelectedElement.indexOf(v) !== -1)) {
            const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);

            if (element.nodeName === "TEXTAREA") {
                // if the entire selection is italics...
                // SUBTLE: AVOID MATCHING BOLD!!!!
                // TODO: fix this, this is still not totally functional when you have a weird amount of asterisks
                if (selectedText.match(/^(?:\*\*)*\*[^\*].+|.+[^\*]\*(?:\*\*)*$/)) {
                    element.setRangeText(selectedText.substring(1, selectedText.length - 1));
                } else {
                    element.setRangeText(`*${selectedText}*`);
                }
            }
        }
    });

    const underline = document.createElement("button");
    underline.textContent = "U";
    underline.style.textDecoration = "underline";
    underline.addEventListener("pointerdown", evt => {
        evt.preventDefault();
        const element = document.activeElement;
        const classesOfSelectedElement = element.classList.value;
        if (classWhitelist.some(v => classesOfSelectedElement.indexOf(v) !== -1)) {
            const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);

            if (element.nodeName === "TEXTAREA") {
                // if the entire selection is underlined... 
                if (selectedText.match(/^<ins>.+<\/ins>$/)) {
                    element.setRangeText(selectedText.substring(5, selectedText.length - 6));
                } else {
                    element.setRangeText(`<ins>${selectedText}</ins>`);
                }
            }
        }
    });

    bottomBar.appendChild(bold);
    bottomBar.appendChild(italic);
    bottomBar.appendChild(underline);


    return bottomBar;
}