const tagContainer = document.getElementById("tagRow");
const addTag = document.getElementById("addTagButton");

addTag.addEventListener("click", insertTag);

function insertTag() {
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

    tag.addEventListener("focus", function(event) { 
        update();
        tagInput.focus();
    });

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

    tag.addEventListener("blur", function(event) {
        blurTag();
    });

    tagInput.addEventListener("blur", function(event) {
        blurTag();
    });

    function blurTag() {
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
        const draggedNote = document.getElementById(draggedNoteId);

        if (draggedNote) {
            const tagText = tag.querySelector('.tag-input').textContent.trim();
            if (tagText) {
                const tagBar = draggedNote.querySelector('.tag-bar');
                const existingTags = Array.from(tagBar.getElementsByClassName('note-tag')).map(tag => tag.textContent.trim());

                if (!existingTags.includes(tagText)) {
                    const tagElement = document.createElement("div");
                    tagElement.className = "note-tag";
                    tagElement.textContent = tagText;
                    tagBar.appendChild(tagElement);
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
        blurTag();
        tag.remove();
    });

    deleteButton.addEventListener("mousedown", function(event) {
        event.preventDefault(); // prevent blur on click
    });

    tag.appendChild(tagInput);
    tag.appendChild(deleteButton);

    tagContainer.appendChild(tag);
    
    // automatically focus on new tag input
    tagInput.focus();
}
