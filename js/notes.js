const infoInput = document.getElementById("info");
const titleInput = document.getElementById("title");

function resizeTextarea(textarea) {
    // Reset height to shrink if needed
    textarea.style.height = "auto";
    // Grow to content (with max height cap)
    textarea.style.height = Math.min(textarea.scrollHeight, 500) + "px";
}

// notes are stored as an object
// key: Date.now()
// value: {content: string, tags: string[], title: string}
// this lets us sort the notes by date, and delete by some ID
let notes = {};

// a bunch of helper functions in case we need them later
// tbh we don't really need them but it's nicer to type
function loadNotes() {
    const notesText = localStorage.getItem("notesData") || "{}";
    notes = JSON.parse(notesText);
}
function saveNotes() {
    localStorage.setItem("notesData", JSON.stringify(notes));
}
function reloadNoteHTML() {
    // delete all the current notes
    const currentNotes = Array.from(document.getElementsByClassName("note"));
    for (let i = 0; i < currentNotes.length; i++) {
        currentNotes[i].remove();
    }

    // add them all back from notes[]
    Object.entries(notes).reverse().forEach(([id, {title, content, tags}]) => {
        addNoteHTML(title, content, tags, id);
    });
}
function deleteNote(id) {
    delete notes[id];
    saveNotes();
}
function deleteAllNotes() {
    notes = {};
    reloadNoteHTML();
    saveNotes();
    reloadFolders();
}

/**
 * this function only creates the note in the notes[] array, then calls addNoteHTML
 * @param {string} text - textual/body content of note
 * @param {object} insertAfter - the note that precedes the new note you're trying to add
 */

function eraseNote() {
    titleInput.value = "";
    infoInput.value = "";
}

function addNote(text, insertAfter) {
    const title = titleInput.value || "";
    const content = text === "" ? infoInput.value : text;
    infoInput.value = ""; // empty out the textbox
    titleInput.value = "";

    // stop if no text is provided
    if (title === "" && content === "") return;

    const id = Date.now();
    const tags = [];

    notes[id] = { title, content, tags };

    //Move new note to top
    const notesArray = Object.entries(notes);
    if (notesArray.length > 0) {
        newNote = notesArray.pop()
        notesArray.unshift(newNote);  
  
        const sortedNotes = {};
        notesArray.forEach(([id, note]) => {
            sortedNotes[id] = note;
        });
        notes = sortedNotes;
    }  
    
    saveNotes();
    reloadNoteHTML();
    console.log(tags);
}

/**
 * Generates the actual HTML element in the DOM
 * don't call directly unless you're reloading
 * @param {string} title - title of a note
 * @param {string} text - textual/body content of a note
 * @param {string[]} tags - list containing all tags of a given note
 * parameter id = id 
 * @param {object} insertAfter - the note that precedes the new note you're trying to add
 */
function addNoteHTML(title, text, tags, id, insertAfter = null) {
    if (!id) {
        console.log("no ID provided!!!");
    }
    // create note elements, then add event listeners
    const note = document.createElement("div");
    note.className = "note";
    note.id = id;
    note.draggable = true;

    const deleteButton = document.createElement("button");
    deleteButton.className = "close-btn del";
    deleteButton.textContent = "";
    deleteButton.style.display = "none";
    deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        deleteNote(id);
        note.remove();
        customMenu.style.display = "none";

        // remove overlay
        let ove = document.getElementsByClassName("overlay");
        if (ove.length !== 0) document.body.removeChild(ove[0]);
    });
    note.appendChild(deleteButton);

    addDraggingEvents(note);
    addContextMenuToNote(note);

    note.addEventListener("mouseover", function () {
        deleteButton.style.display = "block";
    });

    note.addEventListener("mouseout", function () {
        deleteButton.style.display = "none";
    });

    note.addEventListener("click", function (event) {
        // if the user clicks on a link inside the note, don't change into edit mode
        if (event.target.nodeName === "A") return;

        if (!this.classList.contains("overlay-created")) {
            const overlay = document.createElement("div");
            overlay.className = "overlay";
            document.body.appendChild(overlay);

            // show only noteContent
            const noteTitle = note.getElementsByClassName("note-title")[0];
            const noteContent = note.getElementsByClassName("note-content")[0];
            const noteDisplay = note.getElementsByClassName("note-display")[0];
            noteContent.classList.remove("displayNone");
            noteDisplay.classList.add("displayNone");
            
            setTimeout(() => resizeTextarea(noteContent), 0);

            if (!noteContent.hasResizeListener) {
                noteContent.addEventListener("input", e => resizeTextarea(e.target));
                noteContent.hasResizeListener = true;
            }

            // Disable dragging if note in focused mode
            note.draggable = false;
            overlay.addEventListener("click", function () {
                // remove overlay
                document.body.removeChild(overlay);
                note.classList.remove("overlay-created");
                note.style.zIndex = null;
                note.draggable = true;

                // update noteDisplay, persist to notes
                notes[note.id].title = noteTitle.innerText;
                notes[note.id].content = noteContent.value;
                //TODO: persist tags as well
                noteDisplay.innerHTML = DOMPurify.sanitize(marked.parse(noteContent.value));

                // only show noteDisplay
                noteContent.classList.add("displayNone");
                noteDisplay.classList.remove("displayNone");
            });

            this.classList.add("overlay-created");
            this.style.zIndex = "999";
        }
    });

    const noteTitle = document.createElement("div");
    noteTitle.contentEditable = "plaintext-only";
    noteTitle.className = "note-title title";
    noteTitle.innerText = title;
    const noteContent = document.createElement("textarea");
    noteContent.className = "note-content displayNone body";
    noteContent.value = text;

    const noteDisplay = document.createElement("div");
    noteDisplay.className = "note-display body";
    noteDisplay.innerHTML = DOMPurify.sanitize(marked.parse(text));

    note.appendChild(noteTitle);
    note.appendChild(noteContent);
    note.appendChild(noteDisplay);

    const tagBar = document.createElement("div");
    tagBar.className = "tag-bar";

    if(tags) {
        tags.forEach((tag) => {
            const tagElement = document.createElement("div");
            tagElement.className = "note-tag";
            tagElement.textContent = tag;

            tagBar.appendChild(tagElement);
        });
    }


    const bottomBar = createFormatBar();

    const timeText = document.createElement("div");
    timeText.className = "time-text";
    timeText.style = "justify-content: right";
    const noteCreatedTime = new Date(+id);
    timeText.textContent = `${noteCreatedTime.toLocaleString([], {
        timeStyle: "short",
        dateStyle: "short"
    })}`;
    const bottomDiv = document.createElement("div");
    bottomDiv.className = "bottomDiv";
    bottomDiv.appendChild(bottomBar);
    bottomDiv.appendChild(tagBar);
    bottomDiv.appendChild(timeText);
    note.appendChild(bottomDiv);

    if (insertAfter && insertAfter.nextElementSibling) {
        container.insertBefore(note, insertAfter.nextElementSibling);
    } else {
        container.prepend(note);
    }
}

function saveNotesOrder() {
    const newNotesOrder = {};
    const noteElements = Array.from(container.getElementsByClassName("note"));

    noteElements.forEach(noteElement => {
        const id = noteElement.id;
        newNotesOrder[id] = notes[id];
    });

    notes = newNotesOrder;
    saveNotes();
}

infoInput.addEventListener("keydown", evt => {
    if (evt.ctrlKey && evt.key === "Enter") {
        evt.preventDefault();
        addNote(""); // that was easy
    }
});

function addContextMenuToNote(note) {
    console.log(note);
    note.addEventListener("contextmenu", function(event) {
        event.preventDefault(); 

        customMenu.style.display = "block";
        customMenu.style.left = `${event.clientX}px`;
        customMenu.style.top = `${event.clientY}px`;

        document.getElementById("rem").addEventListener("click", function() {
            let tagBar = note.querySelector('.tag-bar');
            while (tagBar.firstChild) {
                tagBar.removeChild(tagBar.firstChild);
            }
            notes[note.id].tags = [];
            saveNotes();

            customMenu.style.display = "none"; 
        });

        document.getElementById("rem").addEventListener("mouseover", function() {
            tagMenu.style.display = "none"; 
        });
        
        document.getElementById("addtofolder").addEventListener("mouseover", function(event) {
            const tagInputs = document.querySelectorAll('.tag-input');
        
            tagMenu.innerHTML = '';
        
            tagInputs.forEach(input => {
                const menuItem = document.createElement('div');
                menuItem.className = "menu-item";
                menuItem.textContent = input.textContent; 

                menuItem.addEventListener("click", () => {
                    let tagBar = note.querySelector('.tag-bar');
                    const tagElement = document.createElement("div");
                    tagElement.className = "note-tag";
                    tagElement.textContent = menuItem.textContent;

                    while (tagBar.firstChild) {
                        tagBar.removeChild(tagBar.firstChild);
                    }
                    tagBar.appendChild(tagElement);

                    notes[note.id].tags = [];
                    notes[note.id].tags.push(menuItem.textContent);
                    saveNotes();
                });

                tagMenu.appendChild(menuItem);
            });
    
            const customMenuRect = customMenu.getBoundingClientRect();
            tagMenu.style.left = `${customMenuRect.right + 10}px`; 
            tagMenu.style.top = `${customMenuRect.top}px`;
            tagMenu.style.display = "block"; 
        });
    });
}

const customMenu = document.createElement("div");
customMenu.className = "custom-context-menu";

customMenu.innerHTML = `
<div class="menu-item" id="addtofolder">Add to Folder...</div>
<div class="menu-item" id="rem">Remove from Folder</div>
`;

document.body.appendChild(customMenu);

const tagMenu = document.createElement('div');
tagMenu.className = "custom-context-menu";
tagMenu.style.display = "none";

tagMenu.addEventListener("mouseleave", () => {
    tagMenu.style.display = "none";
});

document.body.appendChild(tagMenu);

document.addEventListener("click", function () {
    customMenu.style.display = "none";
    tagMenu.style.display = "none"; 
});

document.addEventListener("contextmenu", () => {
    tagMenu.style.display = "none";
});