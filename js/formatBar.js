/**
 * Generates "bottom bar" below note boxes to hold text formating buttons
 * @returns {object} bottomBar
 */
function createFormatBar() {
    const bottomBar = document.createElement("div");
    bottomBar.className = "bottom-bar";
    bottomBar.style.justifyContent = "center";
    bottomBar.style.alignItems = "center";
    bottomBar.style.display = "flex";
    bottomBar.style.width = "fit-content";

    bottomBar.innerHTML = `
  <span class="ql-formats" style="display: flex; gap: 2px; justify-content: center; margin: 0 auto;">
    <button class="ql-bold">B</button>
    <button class="ql-italic">I</button>
    <button class="ql-underline">U</button>
    <button class="ql-strike">S</button>
  </span>`;
    return bottomBar;
}