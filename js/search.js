function searchNotesByTag(tag) {
    const noteElements = Array.from(container.getElementsByClassName('note'));

    for (let i = 0; i < noteElements.length; i++) {
        const noteElement = noteElements[i];
        const tagElements = noteElement.getElementsByClassName('note-tag');
        let tags = [];
        tags.push('');

        for (let j = 0; j < tagElements.length; j++) {
            tags.push(tagElements[j].textContent);
        }

        let matchFound = false;

        for (let k = 0; k < tags.length; k++) {
            if (tags[k].includes(tag)) {
                matchFound = true;
                break;
            }
        }

        if (matchFound) {
            noteElement.style.display = 'block'; // Show the note
        } else {
            noteElement.style.display = 'none'; // Hide the note
        }
    }
}

function handleInput(input) {
    const tagPrefix = 'tag:';
    
    if (input.startsWith(tagPrefix)) {
        const tag = input.slice(tagPrefix.length).trim();
        searchNotesByTag(tag);
    } else {
        showAllNotes();
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

