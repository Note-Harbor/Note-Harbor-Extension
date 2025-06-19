// Get references to elements
const settingsMenu = document.getElementById("settingsMenu");
const sortMenu = document.getElementById("sortMenu");

// Comfirm menu items
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const confirmDeleteNotes = document.getElementById("confirmDeleteNotes");
const cancelDeleteNotes = document.getElementById("cancelDeleteNotes");

const resetConfirmModal = document.getElementById("resetConfirmModal");
const confirmResetNotes = document.getElementById("confirmResetNotes");
const cancelResetNotes = document.getElementById("cancelResetNotes");

// Download notes
const downloadButton = document.getElementById("downloadButton");

//delete confirm stuff
const delall = document.getElementById("delall");
delall.addEventListener("click", () => {
    deleteConfirmModal.showModal();
});

confirmDeleteNotes.addEventListener("click", () => {
    deleteAllNotes();
    deleteConfirmModal.close();
});

cancelDeleteNotes.addEventListener("click", () => {
    deleteConfirmModal.close();
});

deleteConfirmModal.addEventListener("click", function(event) {
    const modalContent = document.getElementById("delall");
    if (!modalContent.contains(event.target)) {
        deleteConfirmModal.close();
    }
});

//reset confirm stuff
const resetSettings = document.getElementById("resetSettings");
resetSettings.addEventListener("click", () => {
    resetConfirmModal.showModal();
});

confirmResetNotes.addEventListener("click", function() {
    Object.assign(settings, defaultSettings);
    saveSettings();
    loadSettings();
    resetConfirmModal.close();
});

cancelResetNotes.addEventListener("click", () => {
    resetConfirmModal.close();
});

resetConfirmModal.addEventListener("click", function(event) {
    const modalContent = document.getElementById("resetSettings");
    if (!modalContent.contains(event.target)) {
        resetConfirmModal.close();
    }
});

chrome.runtime.sendMessage({command: "getTheme"}, theme => {
    themeDropdown.value = theme;
    themeDropdown.addEventListener("change", evt => {
        const selectedTheme = evt.target.value;
        console.log(`${selectedTheme} theme selected`);
        chrome.runtime.sendMessage({command: "setTheme", data: {theme: selectedTheme}});
    });
});

downloadButton.addEventListener("click", () => {
    const folders = JSON.parse(localStorage.getItem("folders") || "[]");
    const data = {
        folders: folders,
        notes: notes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

/*
sortDropdown.addEventListener("change", _ => {
    settings.sortChoice = sortDropdown.value;
    saveSettings();
});

sortButton.addEventListener("click", function(event) {
    event.stopPropagation();
    if (settings.sortChoice === "date") {
        sortNotesByDate();
    } else if (settings.sortChoice === "tag") {
        sortNotesByTag();
    } else {
        console.log("UNIMPLEMENTED SORT FEATURE");
    }
});
*/
