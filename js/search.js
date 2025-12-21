/**
 * Extract text from delta before search computations
 * @param {Object} delta
 * @returns {string}
 */
function deltaToText(delta) {
    if (!delta || !Array.isArray(delta.ops)) return "";
    return delta.ops
        .map(op => typeof op.insert === "string" ? op.insert : "")
        .join("");
}

/**
 * Displays only the notes possessing a given folder
 * @param {string} folder 
 */
function searchNotesByFolder(folder) {
    const noteElements = Array.from(document.getElementsByClassName("note"));
    const filteredNoteIDs = Object.entries(notes)
        .filter(([_, note]) => {
            if (note.folders?.includes(folder)) return true;
            const text = deltaToText(note.content);
            return text.includes(folder);
        })
        .map(([id]) => String(id));

    noteElements.forEach(noteElement => {
        const noteId = noteElement.id.replace("note-", "");
        noteElement.style.display = filteredNoteIDs.includes(noteId)
            ? "block"
            : "none";
    });
}
/**
 * Displays only the notes whose title contains a given search term
 * @param {string} title 
 */
function searchNotesByTitle(title) {
    const noteElements = Array.from(document.getElementsByClassName("note"));
    const filteredNoteIDs = Object.entries(notes)
                                .filter(([_, note]) => note.title.includes(title))
                                .map(([id, _]) => id); // only give us the IDs
    
    noteElements.forEach(noteElement => {
        if (filteredNoteIDs.includes(noteElement.id)) {
            noteElement.style.display = "block";
        } else {
            noteElement.style.display = "none";
        }
    });
}

/**
 * Displays only the notes whose text contains a given search term
 * @param {string} searchTerm 
 */
function searchNotesByText(searchTerm) {
    const noteElements = Array.from(document.getElementsByClassName("note"));
    const filteredNoteIDs = Object.entries(notes)
        .filter(([_, note]) => {
            const text = deltaToText(note.content)
                .replace(/\r?\n|\t/g, " ");
            return text.includes(searchTerm);
        })
        .map(([id]) => String(id));

    noteElements.forEach(noteElement => {
        const noteId = noteElement.id.replace("note-", "");
        noteElement.style.display = filteredNoteIDs.includes(noteId)
            ? "block"
            : "none";
    });
}

/**
 * Decides which search mode to use for a given search term
 * @param {string} input 
 */
function handleInput(input) {
    const folderPrefix = "folder:";
    const titlePrefix = "title:"
    
    if (input === "") { // no search, default to all notes
        showAllNotes();
    } else     if (input.startsWith(folderPrefix)) {
        const folder = input.slice(folderPrefix.length).trim();
        searchNotesByFolder(folder);
    } else if (input.startsWith(titlePrefix)) {
        const title = input.slice(titlePrefix.length).trim();
        searchNotesByTitle(title);
    } else {
        // in text search
        const searchTerm = input.trim();
        searchNotesByText(searchTerm);
    }
}

function showAllNotes() {
    const noteElements = document.getElementsByClassName('note');
    
    for (let i = 0; i < noteElements.length; i++) {
        noteElements[i].style.display = 'block'; 
    }
}

// event handlers
search.addEventListener("input", function () {
    const searchFolder = search.value.trim().toLowerCase();
    handleInput(searchFolder);
});

