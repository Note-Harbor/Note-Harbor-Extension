function searchNotesByTag(tag) {
    const noteElements = Array.from(document.getElementsByClassName("note"));
    const filteredNoteIDs = Object.entries(notes)
                                .filter(([_, note]) => note.tags.join("\n").includes(tag)) // better than exact matching tag strings
                              //.filter(([_, note]) => note.tags.includes(tag)) // alternative for exact tag matching
                                .map(([id, _]) => id); // only give us the IDs
    
    noteElements.forEach(noteElement => {
        if (filteredNoteIDs.includes(noteElement.id)) {
            noteElement.style.display = "block";
        } else {
            noteElement.style.display = "none";
        }
    });
}

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

function searchNotesByText(searchTerm) {
    const noteElements = Array.from(document.getElementsByClassName("note"));
    const filteredNoteIDs = Object.entries(notes)
                                .filter(([_, note]) => {
                                    // newlines aren't allowed in the search bar, so replace newlines/tabs with spaces
                                    // to make search terms a little more generous
                                    const text = note.content.replaceAll("\r\n", " ").replaceAll("\n", " ").replaceAll("\t", " ");
                                    return text.includes(searchTerm);
                                })
                                .map(([id, _]) => id); // only give us the IDs
    
    noteElements.forEach(noteElement => {
        if (filteredNoteIDs.includes(noteElement.id)) {
            noteElement.style.display = "block";
        } else {
            noteElement.style.display = "none";
        }
    });
}

function handleInput(input) {
    const tagPrefix = "tag:";
    const titlePrefix = "title:"
    
    if (input === "") { // no search, default to all notes
        showAllNotes();
    } else if (input.startsWith(tagPrefix)) {
        const tag = input.slice(tagPrefix.length).trim();
        searchNotesByTag(tag);
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
    const searchTag = search.value.trim().toLowerCase();
    handleInput(searchTag);
});

