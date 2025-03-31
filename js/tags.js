const tagContainer = document.getElementById("folderRow");
const addTag = document.getElementById("addTagButton");

addTag.addEventListener("click", () => insertTag(""));

function loadFolders() {
    const notesText = localStorage.getItem("folders");
    let allFolders = JSON.parse(notesText);

    for (const folderName of allFolders.reverse()) {
        insertTag(folderName);
    }
}

function saveFolders() {
    const tagInputs = document.querySelectorAll('.tag-input');
    const uniqueFolders = [];
    const seenFolders = new Set();

    tagInputs.forEach((input) => {
        const content = input.textContent.trim();
        if (content !== "" && !seenFolders.has(content)) {
            uniqueFolders.push(content);
            seenFolders.add(content); // track what has been added and preserve order
        }
    });

    const allFoldersArray = Array.from(uniqueFolders);
    localStorage.setItem("folders", JSON.stringify(allFoldersArray));
}

function reloadFolders() {
    // delete all folders
    const currentNotes = Array.from(document.getElementsByClassName("tag"));
    for (let i = 0; i < currentNotes.length; i++) {
        currentNotes[i].remove();
    }

    // add them all back from notes[]
    // Object.entries(notes).map(([id, {title, content, tags}]) => addNoteHTML(title, content, tags, id));
}

function deleteFolders(name) {
    delete folders[name];
    saveFolders();
}

function updateVisible() {
    const visibleTags = Array.from(tagContainer.children);
    visibleTags.forEach((tag, index) => {
        tag.style.display = index < 4 ? "flex" : "none";
    });
}

function insertTag(folderName) {
    if (tagContainer.querySelector('.new-tag')) {
        return; 
    }

    saveFolders();
    // tag as wrapper, tag-input for inputs, del-tag for delete button to avoid any editable issues
    const tag = document.createElement("div");
    tag.className = "new-tag";
    tag.setAttribute("tabindex", "0"); // make tag focusable
    let disableInput = true;

    tag.addEventListener('dragover', function(event) {
        event.preventDefault(); // Prevent the default to allow drop
        tag.classList.add('drag-over');
    });
    
    tag.addEventListener('dragleave', function(event) {
        tag.classList.remove('drag-over'); 
    });

    tag.addEventListener("dblclick", function(event) {
        event.preventDefault(); // prevent default of highlighting selected text
        if (tagInput.textContent.trim() === "") {
            tagInput.textContent = "";
        }
        else {
            tag.className = "tag";
        }

        disableInput = false;
        tagInput.style.marginRight = "7px";
        deleteButton.style.display = "block";
        tagInput.contentEditable = true;
        tagInput.focus();
        disableInput = true;
    });

    const tagInput = document.createElement("div");
    tagInput.className = "tag-input";
    tagInput.contentEditable = true;
    tagInput.textContent = "";

    tag.handleTagFocus = function () {
        update();
        this.tagInput.focus();
    };

    tag.addEventListener("focus", tag.handleTagFocus);

    function update() { // selects the notes that contain selected folder
        if(tag.className == "new-tag") {
            return;
        }

        const currentNotes = Array.from(document.getElementsByClassName("note"));
        for (let i = 0; i < currentNotes.length; i++) {
            let currentNote = currentNotes[i];
            const tagBar = currentNote.querySelector(".tag-bar").children;

            if (tagBar) {
                let tagExists = false;
                for (const tag of tagBar) {
                    if (tag.textContent.trim() === tagInput.textContent.trim()) {
                        tagExists = true;
                        break;
                    }
                }

                if(!tagExists) {
                    currentNote.style.display = "none";
                }
                else {
                    currentNote.style.display = "block";
                }
            }
            else {
                currentNote.style.display = "none";
            }
        }
    }

    tag.blurTag = function() {
        if (tagInput.textContent.trim() === "") {
            tagInput.textContent = "";
            tag.className = "new-tag"; // Reset to new-tag if text is empty
        }
        if(!disableInput) {
            return;
        }

        tagInput.style.marginRight = "0px";
        deleteButton.style.display = "none";
    
        const currentNotes = Array.from(document.getElementsByClassName("note"));
        for (let i = 0; i < currentNotes.length; i++) {
            let currentNote = currentNotes[i];
            currentNote.style.display = "block";
        }

        tagInput.contentEditable = false;
    }

    tag.addEventListener("blur", function(event) {
        tag.blurTag();
    });

    tagInput.addEventListener("blur", function(event) {
        tag.blurTag();
    });

    tagInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); //prevent new-line
        }
    });

    tagInput.addEventListener("keyup", function(event) {
        update();
        if (tagInput.textContent.trim() !== "") {
            tag.className = "tag";
        } else {
            tag.className = "new-tag";

            const currentNotes = Array.from(document.getElementsByClassName("note"));
            for (let i = 0; i < currentNotes.length; i++) {
                let currentNote = currentNotes[i];
                currentNote.style.display = "block";
            }
        }
    });

    // for dropping a note on top of a folder
    tag.addEventListener('drop', function(event) {
        event.preventDefault();
        
        const draggedNoteId = event.dataTransfer.getData('text/plain');
        let draggedNote = document.getElementById(draggedNoteId);

        if (draggedNote) {
            let tagText = tag.querySelector('.tag-input').textContent.trim();
            if (tagText) {
                let tagBar = draggedNote.querySelector('.tag-bar');
                let existingTags = Array.from(tagBar.getElementsByClassName('note-tag')).map(tag => tag.textContent.trim());

                if (!existingTags.includes(tagText)) {
                    const tagElement = document.createElement("div");
                    tagElement.className = "note-tag";
                    tagElement.textContent = tagText;

                    while (tagBar.firstChild) {
                        tagBar.removeChild(tagBar.firstChild);
                    }
                    tagBar.appendChild(tagElement);

                    notes[draggedNoteId].tags = [];
                    notes[draggedNoteId].tags.push(tagText);
                    saveNotes();
                }
            }

        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "del-tag";
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", function(event) {
        event.stopPropagation();
        tag.blurTag();

        for (let [id, note] of Object.entries(notes)) {
            console.log(note.tags, tag.textContent);
            if (note.tags.includes(tagInput.textContent)) {
                let tagBar = document.getElementById(id).querySelector('.tag-bar');
                while (tagBar.firstChild) {
                    tagBar.removeChild(tagBar.firstChild);
                }
                note.tags = []; 
            }
        }

        tag.remove();
        updateVisible();
    });

    deleteButton.addEventListener("mousedown", function(event) {
        event.preventDefault(); // prevent blur on click
    });

    if (folderName && folderName !== "") {
        tag.className = "tag";
        tagInput.textContent = folderName;
        tagInput.style.marginRight = "0px";
        deleteButton.style.display = "none";
    }

    tag.appendChild(tagInput);
    tag.tagInput = tagInput;

    tag.appendChild(deleteButton);

    tagContainer.prepend(tag);
    
    // automatically focus on new tag input
    tagInput.focus();
    updateVisible();
}

document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("dropdown");
    const menu = document.getElementById("dropdown-menu");

    dropdown.addEventListener("click", () => {
        const tags = document.querySelectorAll('.tag');
        menu.innerHTML = '';

        const allNotes = document.createElement('div');
        allNotes.className = "dropdown-item";
        allNotes.textContent = "All Notes";

        allNotes.addEventListener("click", () => {
            tags.forEach(tag => {
                tag.blurTag();
            });
        });

        menu.appendChild(allNotes);
    
        tags.forEach(tag => {
            const menuItem = document.createElement('div');
            menuItem.className = "dropdown-item";
            menuItem.textContent = tag.tagInput.textContent;

            menuItem.addEventListener("click", () => {
                if (typeof tag.handleTagFocus === "function") {
                    tag.handleTagFocus();
                    tagContainer.prepend(tag);
                    updateVisible();
                }
            });
            
            menu.appendChild(menuItem);
        });

        menu.classList.toggle("hidden");
        
    });

    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
            menu.classList.add("hidden");
        }
    });
});
