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
// value: {content: string, folders: string[], title: string}
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
    Object.entries(notes).reverse().forEach(([id, {title, content, folders}]) => {
        addNoteHTML(title, content, folders, id);
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

function measureNote(note) {
  const view   = note.querySelector('.note-content');
  const editor = note.querySelector(`#editor-${note.id} .ql-editor`);
  if (!view || !editor) return;

  view.style.height = 'auto';  // allow shrink
  void view.offsetHeight;

  const cap = 500;
  const pad = 10;
  const next = Math.min(editor.scrollHeight + pad, cap);
  view.style.height = next + 'px';
}

/**
 * this function only creates the note in the notes[] array, then calls addNoteHTML
 * @param {string} text - textual/body content of note
 * @param {object} insertAfter - the note that precedes the new note you're trying to add
 */

function eraseNote() {
    titleInput.value = "";
    mainQuill.setText("");
}

function addNote(noteDelta) {
    let title = titleInput.value || "";
    let content = "";

    if (noteDelta) {
        // simulate Quill data format for add to harbor text
        content = {ops: [{insert: noteDelta.insert}]};
        title = noteDelta.insert.slice(0,26).trimEnd() + "...";
    } else {
        content = mainQuill.getContents();
        // stop if no text is provided
        if (title === "" && mainQuill.editor.isBlank()) {
            showTimedMessage("Type Something First!", 3000)
            return;
        }

        // empty the textboxes
        titleInput.value = "";
        mainQuill.setText("");
    }

    const id = Date.now();
    const folders = [];

    notes[id] = { title, content, folders };

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
    console.log(folders);
}

/**
 * Generates the actual HTML element in the DOM
 * don't call directly unless you're reloading
 * @param {string} title - title of a note
 * @param {object} content - delta of a note
 * @param {string[]} folders - list containing all folders of a given note
 * parameter id = id 
 * @param {object} insertAfter - the note that precedes the new note you're trying to add
 */
function addNoteHTML(title, content, folders, id, insertAfter = null) {
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

            const noteTitle = note.getElementsByClassName("note-title")[0];
            const noteContent = note.getElementsByClassName("note-content")[0];
            
            setTimeout(() => resizeTextarea(noteContent), 0);

            if (!noteContent.hasResizeListener) {
                noteContent.addEventListener("input", e => resizeTextarea(e.target));
                noteContent.hasResizeListener = true;
            }
            
            //Show format bar when editing
            const formatBar = note.querySelector(`#format-${note.id}`);
            formatBar.classList.remove('hidden');

            // Enforce title character limit
            const char_limit = 30;
            let warningOn = false;
            noteTitle.addEventListener("input", function () {
                const text = noteTitle.innerText;
                if (text.length > char_limit) {
                    noteTitle.innerText = text.slice(0, char_limit);

                    // Reset caret to end
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(noteTitle);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);

                    if (!warningOn) {
                        warningOn = true;
                        showTimedMessage("Title character limit exceeded!", 3000);
                        setTimeout(() => warningOn = false, 3000);
                    }
                }
            });
            
            // disable dragging if not in focus mode
            note.draggable = false;
            overlay.addEventListener("click", function () {
                // remove overlay
                document.body.removeChild(overlay);
                note.classList.remove("overlay-created");
                note.style.zIndex = null;
                note.draggable = true;

                //remove format bar
                const formatBar = note.querySelector(`#format-${note.id}`);
                formatBar.classList.add('hidden');

                // persist to notes
                notes[note.id].title = noteTitle.innerText;
                notes[note.id].content = noteQuill.getContents().ops;
            });

            this.classList.add("overlay-created");
            this.style.zIndex = "999";
        }
    });

    const noteTitle = document.createElement("div");
    noteTitle.contentEditable = "plaintext-only";
    noteTitle.className = "note-title title";
    noteTitle.innerText = title;
    const noteContent = document.createElement("div");
    noteContent.className = "note-content body";
    // set the value when we initialize Quill
    noteContent.id = `editor-${note.id}`;

    note.appendChild(noteTitle);
    note.appendChild(noteContent);

    const folderBar = document.createElement("div");
    folderBar.className = "folder-bar";

    if (folders) {
        folders.forEach((folder) => {
            const folderElement = document.createElement("div");
            folderElement.className = "note-folder";
            folderElement.textContent = folder;

            folderBar.appendChild(folderElement);
        });
    }

    const bottomBar = createFormatBar();
    bottomBar.id = `format-${note.id}`
    bottomBar.classList.add('hidden');

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
    bottomDiv.appendChild(folderBar);
    bottomDiv.appendChild(timeText);
    note.appendChild(bottomDiv);

    if (insertAfter && insertAfter.nextElementSibling) {
        container.insertBefore(note, insertAfter.nextElementSibling);
    } else {
        container.prepend(note);
    }


    const noteQuill = new Quill(`#editor-${note.id}`, {
        theme: "snow",
        placeholder: "Write Here!",
        modules: {
            toolbar: `#format-${note.id}`
        }
    });
    //console.log("natsumi")
    console.log(content);
    noteQuill.setContents(content);
    noteQuill.on('text-change', () => {
        measureNote(note);
    });
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
        addNote(); // that was easy
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
            let folderBar = note.querySelector('.folder-bar');
            while (folderBar.firstChild) {
                folderBar.removeChild(folderBar.firstChild);
            }
            notes[note.id].folders = [];
            saveNotes();

            customMenu.style.display = "none"; 
        });

        document.getElementById("rem").addEventListener("mouseover", function() {
            folderMenu.style.display = "none"; 
        });
        
        document.getElementById("addtofolder").addEventListener("mouseover", function(event) {
            const folderInputs = document.querySelectorAll('.folder-input');
        
            folderMenu.innerHTML = '';
        
            folderInputs.forEach(input => {
                const menuItem = document.createElement('div');
                menuItem.className = "menu-item";
                menuItem.textContent = input.textContent; 

                menuItem.addEventListener("click", () => {
                    let folderBar = note.querySelector('.folder-bar');
                    const folderElement = document.createElement("div");
                    folderElement.className = "note-folder";
                    folderElement.textContent = menuItem.textContent;

                    while (folderBar.firstChild) {
                        folderBar.removeChild(folderBar.firstChild);
                    }
                    folderBar.appendChild(folderElement);

                    notes[note.id].folders = [];
                    notes[note.id].folders.push(menuItem.textContent);
                    saveNotes();
                });

                folderMenu.appendChild(menuItem);
            });
    
            const customMenuRect = customMenu.getBoundingClientRect();
            folderMenu.style.left = `${customMenuRect.right + 10}px`; 
            folderMenu.style.top = `${customMenuRect.top}px`;
            folderMenu.style.display = "block"; 
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

const folderMenu = document.createElement('div');
folderMenu.className = "custom-context-menu";
folderMenu.style.display = "none";

folderMenu.addEventListener("mouseleave", () => {
    folderMenu.style.display = "none";
});

document.body.appendChild(folderMenu);

document.addEventListener("click", function () {
    customMenu.style.display = "none";
    folderMenu.style.display = "none"; 
});

document.addEventListener("contextmenu", () => {
    folderMenu.style.display = "none";
});