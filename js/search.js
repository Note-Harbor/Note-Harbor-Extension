function searchNotesByTag(tag) {
    const noteElements = Array.from(container.getElementsByClassName("note"));

    noteElements.map(noteElement => {
        const tagElements = Array.from(noteElement.getElementsByClassName('note-tag')).map(tagElement => tagElement.textContent);
        console.log(tagElements);
    
        if (tagElements.join("\n").includes(tag)) {
            noteElement.style.display = 'block'; // Show the note
        } else {
            noteElement.style.display = 'none'; // Hide the note
        }
    });
}

function handleInput(input) {
    const tagPrefix = "tag:";
    
    if (input === "") { // no search, default to all notes
        showAllNotes();
    } else if (input.startsWith(tagPrefix)) {
        const tag = input.slice(tagPrefix.length).trim();
        searchNotesByTag(tag);
    } else {
        
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

