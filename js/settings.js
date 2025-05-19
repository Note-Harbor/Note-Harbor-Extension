let settings = {};
const defaultSettings = {
    theme: "light",
    sortChoice: "date"
}

Object.assign(settings, defaultSettings);

function loadSettings() {
    const settingsObject = JSON.parse(localStorage.getItem("settings")) || {};
    const keys = Object.keys(settingsObject);
    console.log("keys!!", keys);

    // avoid overwriting default settings object every time we load the settings
    // instead just loop over the saved settings object and add new properties
    for (let i = 0; i < keys.length; i++) {
        settings[keys[i]] = settingsObject[keys[i]];
    }

    // set dropdown values for the first time
    themeDropdown.value = settings.theme;
    //sortDropdown.value = settings.sortChoice;

    console.log("Current Settings: ", settingsObject);
    saveSettings();
}

function saveSettings() {
    if (settings === undefined || settings === null) {
        console.log("WARNING: Settings object empty?");
        settings = defaultSettings;
    }

    localStorage.setItem("settings", JSON.stringify(settings));

    // Apply the new settings
    // SETTING: Tag Sort
    /*
    switch (settings.sortChoice) {
        case "date": {
            sortButton.textContent = "Sort By Date";
            break;
        }
        case "tag": {
            sortButton.textContent = "Sort By Tag";
            break;
        }
        default: {
            console.log("UNIMPLEMENTED SORT FEATURE");
            break;
        }
    }
    */
    // SETTING: Theme
    const selectedTheme = settings.theme;
    if (themes[selectedTheme] === undefined) {
        console.log(`Invalid theme selected; themes["${selectedTheme}"] not found`);
    } else {
        const des = document.body.style;
        des.setProperty("--theme-text",         themes[selectedTheme].text        || unimplementedColor)
        des.setProperty("--theme-placeholder",  themes[selectedTheme].placeholder || unimplementedColor);
        des.setProperty("--theme-background",   themes[selectedTheme].background  || unimplementedColor);
        des.setProperty("--theme-foreground",   themes[selectedTheme].foreground  || unimplementedColor);
        des.setProperty("--theme-codeblocks",   themes[selectedTheme].codeblocks  || unimplementedColor);
        des.setProperty("--theme-hover",        themes[selectedTheme].hover       || unimplementedColor);
        des.setProperty("--theme-click",        themes[selectedTheme].click       || unimplementedColor);
        des.setProperty("--theme-border",       themes[selectedTheme].border      || unimplementedColor);
        des.setProperty("--theme-accent",       themes[selectedTheme].accent      || unimplementedColor);
        des.setProperty("--theme-accentText",   themes[selectedTheme].accentText  || unimplementedColor);
        des.setProperty("--theme-format",       themes[selectedTheme].format      || unimplementedColor);
        des.setProperty("--theme-formatText",   themes[selectedTheme].formatText  || unimplementedColor);
        des.setProperty("--theme-formatHover",  themes[selectedTheme].formatHover || unimplementedColor);
        des.setProperty("--theme-formatClick",  themes[selectedTheme].formatClick || unimplementedColor);
        des.setProperty("--theme-submenuHover", themes[selectedTheme].submenuHover || unimplementedColor);
        des.setProperty("--theme-submenuClick", themes[selectedTheme].submenuClick || unimplementedColor);
    }
}

function sortNotesByTag() {
    const notesArray = Object.entries(notes);

    notesArray.sort(([, noteA], [, noteB]) => {
        const tagsA = noteA.tags.map(tag => tag.toLowerCase());
        const tagsB = noteB.tags.map(tag => tag.toLowerCase());

        for (let i = 0; i < Math.min(tagsA.length, tagsB.length); i++) {
            const tagA = tagsA[i];
            const tagB = tagsB[i];

            if (tagA < tagB) {
                return -1;
            }
            if (tagA > tagB) {
                return 1;
            }
        }

        if (tagsA.length > tagsB.length) {
            return 1;
        }
        if (tagsA.length < tagsB.length) {
            return -1;
        }

        return 0;
    });

    const sortedNotes = {};
    notesArray.forEach(([id, note]) => {
        sortedNotes[id] = note;
    });

    notes = sortedNotes;
    reloadNoteHTML();
    saveNotes();
}

function sortNotesByDate() {
    const notesArray = Object.entries(notes);
    notesArray.sort(([idA], [idB]) => idA - idB);

    const sortedNotes = {};
    notesArray.forEach(([id, text]) => {
        sortedNotes[id] = text;
    });

    notes = sortedNotes;
    reloadNoteHTML();
    saveNotes();
}

// Get references to elements
const settingsButton = document.getElementById("openSettings");
const settingsMenu = document.getElementById("settingsMenu");
const sortMenu = document.getElementById("sortMenu");

// Get menu items
const settingsOption = document.getElementById("settingsOption");
const sortOption = document.getElementById("sortOption");
const websiteOption = document.getElementById("websiteOption");
const sortByDate = document.getElementById("sortByDate");
const sortByTag = document.getElementById("sortByTag");

// Comfirm menu items
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const confirmDeleteNotes = document.getElementById("confirmDeleteNotes");
const cancelDeleteNotes = document.getElementById("cancelDeleteNotes");

const resetConfirmModal = document.getElementById("resetConfirmModal");
const confirmResetNotes = document.getElementById("confirmResetNotes");
const cancelResetNotes = document.getElementById("cancelResetNotes");

// Toggle settings menu on button click
settingsButton.addEventListener("click", function() {
    event.preventDefault();
    showMenu(settingsMenu, settingsButton);
});

// Open full settings modal
settingsOption.addEventListener("click", function() {
    settingsMenu.style.display = "none";
    settingsModal.showModal();
});

// Toggle sort menu when "Sort By" is clicked
sortOption.addEventListener("mouseover", function(event) {
    showSubMenu(sortMenu, settingsMenu);
});

// Apply sorting when clicking an option
sortByDate.addEventListener("click", function() {
    settings.sortChoice = "date";
    saveSettings();
    sortNotesByDate();
    sortMenu.style.display = "none";
});

sortByTag.addEventListener("click", function() {
    settings.sortChoice = "tag";
    saveSettings();
    sortNotesByTag();
    sortMenu.style.display = "none";
});

// Open GitHub when "Website" is clicked
websiteOption.addEventListener("click", function() {
    window.open("https://github.com/Note-Harbor/Note-Harbor-Extension", "_blank");
});


document.addEventListener("click", function(event) {
    if (!settingsMenu.contains(event.target) && event.target !== settingsButton) {
        settingsMenu.style.display = "none";
    }
    if (!sortMenu.contains(event.target) && event.target !== sortOption) {
        sortMenu.style.display = "none";
    }
});

// Helper function to show main menu
function showMenu(menu, trigger) {
    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    menu.style.left = `${rect.right - 160}px`;
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.display = "block";
}

// Helper function to show submenu next to main menu
function showSubMenu(subMenu, parentMenu) {
    const parentRect = parentMenu.getBoundingClientRect();
    subMenu.style.left = `${parentRect.left - 168}px`;
    subMenu.style.top = `${parentRect.top}px`;
    subMenu.style.display = "block";
}

// event listeners
closeSettings.addEventListener("click", _ => { settingsModal.close(); });

settingsModal.addEventListener("click", function(event) {
    const modalContent = document.querySelector(".modal-content");
    if (!modalContent.contains(event.target)) {
        settingsModal.close();
    }
});

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

themeDropdown.addEventListener("change", evt => {
    const selectedTheme = evt.target.value;
    settings.theme = selectedTheme
    saveSettings();
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
