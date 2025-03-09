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
    sortDropdown.value = settings.sortChoice;

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
    saveSettings();
});
themeDropdown.addEventListener("change", evt => {
    const selectedTheme = evt.target.value;
    settings.theme = selectedTheme
    saveSettings();
});
delall.addEventListener("click", _ => { deleteAllNotes(); });
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