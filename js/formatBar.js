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
}