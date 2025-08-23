const folderContainer = document.getElementById("folderContainer");
const addFolder = document.getElementById("addFolderButton");

addFolder.addEventListener("click", () => insertFolder(""));

function loadFolders() {
    const notesText = localStorage.getItem("folders");
    let allFolders = JSON.parse(notesText);

    for (const folderName of allFolders.reverse()) {
        insertFolder(folderName);
    }

    const allFolderInputs = document.querySelectorAll(".folder-input");
    allFolderInputs.forEach(input => {
        input.contentEditable = false;
    });
}

function saveFolders() {
    const folderInputs = document.querySelectorAll('.folder-input');
    const uniqueFolders = [];
    const seenFolders = new Set();

    folderInputs.forEach((input) => {
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
    const currentNotes = Array.from(document.getElementsByClassName("folder"));
    for (let i = 0; i < currentNotes.length; i++) {
        currentNotes[i].remove();
    }

    // add them all back from notes[]
    // Object.entries(notes).map(([id, {title, content, folders}]) => addNoteHTML(title, content, folders, id));
}

function deleteFolders(name) {
    delete folders[name];
    saveFolders();
}

function updateVisible() {
    const visibleFolders = Array.from(folderContainer.children);
    visibleFolders.forEach((folder, index) => {
        folder.style.display = index < 4 ? "flex" : "none";
    });
}

//creates error messages
function showTimedMessage(text, duration = 3000) {
    const messageBox = document.getElementById("errorMessage");

    messageBox.textContent = text;
    messageBox.style.display = "block";
    messageBox.style.opacity = "1";

    //fade away smoothly
    setTimeout(() => {
        messageBox.style.transition = "opacity 0.5s ease";
        messageBox.style.opacity = "0";
        setTimeout(() => {
            messageBox.style.display = "none";
            messageBox.style.transition = "";
        }, 1000);
    }, duration);
    }

function insertFolder(folderName) {
    if (folderContainer.querySelector('.new-folder')) {
        return; 
    }

    saveFolders();
    // folder as wrapper, folder-input for inputs, del-folder for delete button to avoid any editable issues
    const folder = document.createElement("div");
    folder.className = "new-folder";
    folder.setAttribute("tabindex", "0"); // make folder focusable
    let disableInput = true;

    folder.addEventListener('dragover', function(event) {
        event.preventDefault(); // Prevent the default to allow drop
        folder.classList.add('drag-over');
    });
    
    folder.addEventListener('dragleave', function(event) {
        folder.classList.remove('drag-over'); 
    });

    folder.addEventListener("contextmenu", function(event) {
        event.preventDefault(); // prevent default of highlighting selected text
        if (folderInput.textContent.trim() === "") {
            folderInput.textContent = "";
        }
        else {
            folder.className = "folder";
        }

        const currentNotes = Array.from(document.getElementsByClassName("note"));
        for (let i = 0; i < currentNotes.length; i++) {
            currentNotes[i].style.display = "block";
        }

        disableInput = false;
        folderInput.style.marginRight = "7px";
        deleteButton.style.display = "block";
        folderInput.contentEditable = true;
        folderInput.focus();
        disableInput = true;
    });

    //Creates character limit warning
    const char_limit = 20;
    let warningOn = false;
    folder.addEventListener("input", function () {
        if (folderInput.textContent.length > char_limit) {
            folderInput.textContent = folderInput.textContent.slice(0, char_limit);

            //adjusts caret
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(folderInput);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);

            if (!warningOn) {
                warningOn = true;
                showTimedMessage("Folder Character Limit Exceeded!", 3000);
                setTimeout(() => warningOn = false, 3000);
            }
        }
    });

    const folderInput = document.createElement("div");
    folderInput.className = "folder-input";
    folderInput.contentEditable = true;
    folderInput.textContent = "";

    folder.handleFolderFocus = function () {
        update();
        this.folderInput.focus();
    };

    folder.addEventListener("focus", folder.handleFolderFocus);

    function update() { // selects the notes that contain selected folder
        if(folder.className == "new-folder") {
            return;
        }
    }

    folder.addEventListener("click", function(event) {
        if (document.activeElement === folderInput) {
            return;
        }

        update();

        const currentNotes = Array.from(document.getElementsByClassName("note"));
        for (let i = 0; i < currentNotes.length; i++) {
            let currentNote = currentNotes[i];
            const folderBar = currentNote.querySelector(".folder-bar").children;

            if (folderBar) {
                let folderExists = false;
                for (const folder of folderBar) {
                    if (folder.textContent.trim() === folderInput.textContent.trim()) {
                        folderExists = true;
                        break;
                    }
                }

                if(!folderExists) {
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
    });

    folder.blurFolder = function() {
        if (folderInput.textContent.trim() === "")
        {
            // If it's still new and empty, remove it completely
            folder.remove();
            updateVisible();
            return;
        }
    
        folder.className = "folder";
    
        folderInput.style.marginRight = "0px";
        deleteButton.style.display = "none";
    
        const currentNotes = Array.from(document.getElementsByClassName("note"));
        for (let i = 0; i < currentNotes.length; i++) {
            let currentNote = currentNotes[i];
            currentNote.style.display = "block";
        }
    
        folderInput.contentEditable = false;
        saveFolders();
    }
    

    folder.addEventListener("blur", function(event) {
        folder.blurFolder();
    });

    folderInput.addEventListener("blur", function(event) {
        folder.blurFolder();
    });

    let oldFolderName = folder.textContent.trim();

    folderInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });

    folderInput.addEventListener("keyup", function(event) {
        update();

        const newFolderName = folderInput.textContent.trim();

        if (newFolderName !== "") {
            folder.className = "folder";

            if (newFolderName !== oldFolderName) {
                for (let [id, note] of Object.entries(notes)) {
                    if (note.folders.includes(oldFolderName)) {
                        note.folders = note.folders.map(t => t === oldFolderName ? newFolderName : t);

                        const folderBar = document.getElementById(id).querySelector('.folder-bar');
                        folderBar.innerHTML = "";
                        note.folders.forEach(folderText => {
                            const newFolder = document.createElement("span");
                            newFolder.className = "folder";
                            newFolder.textContent = folderText;
                            folderBar.appendChild(newFolder);
                        });
                    }
                }
                oldFolderName = newFolderName;
            }

        } else {
            folder.className = "new-folder";

            const currentNotes = Array.from(document.getElementsByClassName("note"));
            for (let i = 0; i < currentNotes.length; i++) {
                currentNotes[i].style.display = "block";
            }
        }
    });

    // for dropping a note on top of a folder
    folder.addEventListener('drop', function(event) {
        event.preventDefault();
        
        const draggedNoteId = event.dataTransfer.getData('text/plain');
        let draggedNote = document.getElementById(draggedNoteId);

        if (draggedNote) {
            let folderText = folder.querySelector('.folder-input').textContent.trim();
            if (folderText) {
                let folderBar = draggedNote.querySelector('.folder-bar');
                let existingFolders = Array.from(folderBar.getElementsByClassName('note-folder')).map(folder => folder.textContent.trim());

                if (!existingFolders.includes(folderText)) {
                    const folderElement = document.createElement("div");
                    folderElement.className = "note-folder";
                    folderElement.textContent = folderText;

                    while (folderBar.firstChild) {
                        folderBar.removeChild(folderBar.firstChild);
                    }
                    folderBar.appendChild(folderElement);

                    notes[draggedNoteId].folders = [];
                    notes[draggedNoteId].folders.push(folderText);
                    saveNotes();
                }
            }

        }
    });

    // Delete confirmation sequence
    const modal = document.getElementById("deleteFolderModal");

    const deleteButton = document.createElement("button");
    deleteButton.className = "close-btn del-folder";
    deleteButton.textContent = "";
    deleteButton.addEventListener("click", function(event) {
        event.stopPropagation();

        const confirmBtn = document.getElementById("confirmDeleteFolder");
        const cancelBtn = document.getElementById("cancelDeleteFolder");

        modal.showModal();

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.onclick = () => modal.close();

        newConfirmBtn.onclick = () => {
            folder.blurFolder();

            for (let [id, note] of Object.entries(notes)) {
                console.log(note.folders, folder.textContent);
                if (note.folders.includes(folderInput.textContent)) {
                    let folderBar = document.getElementById(id).querySelector('.folder-bar');
                    while (folderBar.firstChild) {
                        folderBar.removeChild(folderBar.firstChild);
                    }
                    note.folders = []; 
                }
            }

            folder.remove();
            updateVisible();
            modal.close();
        }
    });

    modal.addEventListener("click", function(event) {
        const modalContent = modal.querySelector(".modal-content");

        if (!modalContent.contains(event.target)) {
            modal.close();
        }
    });

    deleteButton.addEventListener("mousedown", function(event) {
        event.preventDefault(); // prevent blur on click
    });

    if (folderName && folderName !== "") {
        folder.className = "folder";
        folderInput.textContent = folderName;
        folderInput.style.marginRight = "0px";
        deleteButton.style.display = "none";
    }

    folder.appendChild(folderInput);
    folder.folderInput = folderInput;

    folder.appendChild(deleteButton);

    folderContainer.prepend(folder);
    
    // automatically focus on new folder input
    folderInput.focus();
    updateVisible();
}

document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("dropdown");
    const menu = document.getElementById("dropdown-menu");

    dropdown.addEventListener("click", () => {
        const folders = document.querySelectorAll('.folder');
        menu.innerHTML = '';

        const allNotes = document.createElement('div');
        allNotes.className = "dropdown-item";
        allNotes.textContent = "All Notes";

        allNotes.addEventListener("click", () => {
            folders.forEach(folder => {
                folder.blurFolder();
            });
        });

        menu.appendChild(allNotes);
    
        folders.forEach(folder => {
            const menuItem = document.createElement('div');
            menuItem.className = "dropdown-item";
            menuItem.textContent = folder.folderInput.textContent;

            menuItem.addEventListener("click", () => {
                if (typeof folder.handleFolderFocus === "function") {
                    folder.handleFolderFocus();
                    folderContainer.prepend(folder);
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