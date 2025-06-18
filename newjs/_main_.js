let notes = [];
let folders = [];
let currentFolder = -1;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);

    const { command, data } = request;

    if (command === "UpdateUI") {
        reloadNoteHTML();
    } else if (command === "addNoteUI") {
        let noteObject = data;
        addNoteHTML(noteObject)
    } else if (command === "deleteNoteUI") {
        let noteObject = data;
        let target = document.getElementById(noteObject.noteID);

        if (target) target.remove();
    }
});



add.addEventListener("click", _ => addNote());
document.addEventListener("DOMContentLoaded", _ => reloadNoteHTML());
document.addEventListener("visibilitychange", _ => reloadNoteHTML());

function reloadData(callback) {
    return chrome.runtime.sendMessage({command: "getData"}, (data) => {
        notes = data.notes;
        folders = data.folders;
        callback();
    });
}


const infoInput = document.getElementById("info");
const titleInput = document.getElementById("title");
const noteEditor = document.getElementById("noteEditor");

const closeButton = document.getElementById("noteEditor_close");
closeButton.addEventListener("click", _ => { noteEditor.close(); });


function deleteNote(id) {
    console.log(`deleting note ${id}`)
    chrome.runtime.sendMessage({command: "deleteNote", data: {noteID: id}});
}
function deleteAllNotes() {
    chrome.runtime.sendMessage({command: "deleteAllNotes"});
}

function addNote() {
    const title = titleInput.value || "";
    const content = infoInput.innerText || "";
    infoInput.innerText = ""; // empty out the textbox
    titleInput.value = "";

    // stop if no text is provided
    if (title === "" && content === "") return;

    const noteObject = { title, content, folderID: -1 }
    chrome.runtime.sendMessage({command: "addNote", data: noteObject});
}

// call on DOM reload and page init
function reloadNoteHTML() {
    chrome.runtime.sendMessage({command: "getNotes"}, (notes) => {
        // delete all the current notes
        Array.from(document.getElementsByClassName("note")).forEach(v => v.remove());

        // add them all back from notes[]
        notes.forEach(noteObject => {
            addNoteHTML(noteObject);
        });
    });
}

/**
 * Generates the actual HTML element in the DOM
 * don't call directly unless you're reloading
 * @param {Note} noteObject - The note we're trying to add
 * @param {object} insertAfter - the note that precedes the new note you're trying to add
 */
function addNoteHTML(noteObject, insertAfter) {
    let { noteID, title, content, createdDate, folderID } = noteObject;

    if (!noteID) console.log("no ID provided!!!");

    // create note elements, then add event listeners
    const note = document.createElement("div");
    note.className = "note";
    note.id = noteID;
    note.draggable = true;

    const deleteButton = document.createElement("button");
    deleteButton.className = "del";
    deleteButton.textContent = "X";
    deleteButton.addEventListener("click", evt => {
        evt.stopPropagation();
        deleteNote(noteID);
        customMenu.style.display = "none";
    });
    note.appendChild(deleteButton);

    note.addEventListener("mouseover", () => {
        deleteButton.style.display = "block";
    });
    note.addEventListener("mouseout", () => {
        // deleteButton.style.display = "none";
    });
    note.addEventListener("click", function (event) {
        // if the user clicks on a link inside the note, don't change into edit mode
        if (event.target.nodeName === "A") return;

        noteEditor.showModal();

        document.getElementById("noteEditor_title").value = title;
        document.getElementById("noteEditor_info").innerText = content;

        // show only noteContent
        const noteTitle = note.getElementsByClassName("note-title")[0];
        const noteContent = note.getElementsByClassName("note-content")[0];
        const noteDisplay = note.getElementsByClassName("note-display")[0];
        noteContent.classList.remove("displayNone");
        noteDisplay.classList.add("displayNone");
        

        noteEditor.addEventListener("click", evt => {
            
        })
        // Disable dragging if note in focused mode
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
    });

    const noteTitle = document.createElement("div");
    noteTitle.className = "note-title";
    noteTitle.innerText = title;
    const noteContent = document.createElement("div");
    noteContent.className = "note-content displayNone body";
    noteContent.value = content;
    const noteDisplay = document.createElement("div");
    noteDisplay.className = "note-display body";
    noteDisplay.innerHTML = DOMPurify.sanitize(marked.parse(content));

    note.appendChild(noteTitle);
    note.appendChild(noteContent);
    note.appendChild(noteDisplay);

    // const tagBar = document.createElement("div");
    // tagBar.className = "tag-bar";

    // if(tags) {
    //     tags.forEach((tag) => {
    //         const tagElement = document.createElement("div");
    //         tagElement.className = "note-tag";
    //         tagElement.textContent = tag;

    //         tagBar.appendChild(tagElement);
    //     });
    // }

    // note.appendChild(tagBar);

    // const bottomBar = createFormatBar();

    const timeText = document.createElement("div");
    timeText.className = "time-text";
    timeText.style = "justify-content: right";
    const noteCreatedTime = new Date(+createdDate);
    timeText.textContent = `${noteCreatedTime.toLocaleString([], {
        timeStyle: "short",
        dateStyle: "short"
    })}`;
    const bottomDiv = document.createElement("div");
    bottomDiv.className = "bottomDiv";
    // bottomDiv.appendChild(bottomBar);
    bottomDiv.appendChild(timeText);
    note.appendChild(bottomDiv);

    if (insertAfter && insertAfter.nextElementSibling) {
        container.insertBefore(note, insertAfter.nextElementSibling);
    } else {
        container.prepend(note);
    }
}

async function saveNotesOrder() {
    const newNotesOrder = {};
    const noteElements = Array.from(container.getElementsByClassName("note"));

    noteElements.forEach(noteElement => {
        const id = noteElement.id;
        newNotesOrder[id] = notes[id];
    });

    notes = newNotesOrder;
    await saveNotes();
}

async function addContextMenuToNote(note) {
    note.addEventListener("contextmenu", function(event) {
        event.preventDefault(); 

        customMenu.style.display = "block";
        customMenu.style.left = `${event.clientX}px`;
        customMenu.style.top = `${event.clientY}px`;

        document.getElementById("rem").addEventListener("click", async () => {
            let tagBar = note.querySelector('.tag-bar');
            while (tagBar.firstChild) {
                tagBar.removeChild(tagBar.firstChild);
            }
            notes[note.id].tags = [];
            await saveNotes();

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

                menuItem.addEventListener("click", async () => {
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
                    await saveNotes();
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












titleInput.addEventListener("keydown", evt => {
    if (evt.ctrlKey && evt.key === "Enter") {
        evt.preventDefault();
        addNote(""); // that was easy
    }
});
infoInput.addEventListener("keydown", evt => {
    if (evt.ctrlKey && evt.key === "Enter") {
        evt.preventDefault();
        addNote(""); // that was easy
    }
});

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