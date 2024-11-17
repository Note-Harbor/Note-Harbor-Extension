let settings = {};
const defaultSettings = {
    customColor: "#97BCC7",
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

    console.log("Current Settings: ", settingsObject);
    saveSettings();

    applySettings();
}

function applySettings() {
    // assume that all settings have valid values
    document.body.style.backgroundColor = settings.customColor;
}

function saveSettings() {
    if (settings === undefined || settings === null) {
        console.log("WARNING: Settings object empty?");
        settings = defaultSettings;
    }

    localStorage.setItem("settings", JSON.stringify(settings));
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

// event listeners
openSettings.addEventListener("click", _ => { settingsModal.showModal(); });
closeSettings.addEventListener("click", _ => { settingsModal.close(); });
settingsModal.addEventListener("click", function(event) {
    const modalContent = document.querySelector(".modal-content");
    if (!modalContent.contains(event.target)) {
        settingsModal.close();
    }
});
resetSettings.addEventListener("click", function() {
    Object.assign(settings, defaultSettings);
    applySettings();
    saveSettings();
});
customBackgroundColor.addEventListener("input", function (event) {
    const customColor = event.target.value;
    if (customColor !== "" && CSS.supports("color", customColor)) {
        settings.customColor = customColor;
        document.body.style.backgroundColor = settings.customColor;
        saveSettings();
    }
});
delall.addEventListener("click", _ =>{ deleteAllNotes(); });
sortDropdown.addEventListener("change", _ => {
    settings.sortChoice = sortDropdown.value;
    saveSettings();

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