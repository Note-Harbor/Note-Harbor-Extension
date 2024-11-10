const add = document.getElementById("add");
const container = document.getElementById("container");
const titleInput = document.getElementById("title");
const infoInput = document.getElementById("info");
const sort = document.getElementById("sort");
const tagContainer = document.getElementById("tagRow");
const search = document.getElementById("search");
const formatBar = document.getElementById("formatBar");

// settings
const dialog = document.getElementById("settingsModal");
const openSettingsButton = document.getElementById("openSettings");
const deleteAllButton = document.getElementById("delall");
const customBackgroundColor = document.getElementById("SI-color");
const sortDropdown = document.getElementById("sortBy");

let startY = 0;
let sortChoice = "date";

// notes are stored as an object
// key: Date.now()
// value: {content: string, tags: string[], title: string}
// this lets us sort the notes by date, and delete by some ID
let notes = {};
const defaultSettings = {
  customColor: "#97BCC7"
}
let settings = {};
Object.assign(settings, defaultSettings);

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
  Object.entries(notes).map(([id, {title, content, tags}]) => addNoteHTML(title, content, tags, id));
}
function deleteNote(id) {
  delete notes[id];
  saveNotes();
}
function deleteAllNotes() {
  notes = {};
  reloadNoteHTML();
  saveNotes();
}

function loadSettings() {
  const settingsObject = JSON.parse(localStorage.getItem("settings")) || {};
  const keys = Object.keys(settingsObject);
  console.log("keys!!", keys);
  
  // avoid overwriting default settings object every time we load the settings
  // instead just loop over the saved settings object and add new properties
  for (let i=0; i<keys.length; i++) {
    settings[keys[i]] = settingsObject[keys[i]];
  }

  console.log("Current Settings: ", settingsObject);
  saveSettings();

  applySettings();
}

function applySettings() {
  // assume that all settings have valid values
  document.body.style.backgroundColor = settings.customColor;
}

function saveSettings() {
  if (settings === undefined || settings === null) {
    console.log("WARNING: Settings object empty?");
    settings = defaultSettings;
  }

  localStorage.setItem("settings", JSON.stringify(settings));
}

// Insert empty tag to tagContainer
function insertTag() {
  const tag = document.createElement("div");
  tag.className = "new-tag";
  tag.contentEditable = true;
  tag.textContent = "New Tag";

  // If user press enter, create new tag
  tag.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      tag.className = "tag";
      tag.contentEditable = false;
      tag.removeEventListener("keydown", this);

      const deleteButton = document.createElement("button");
      deleteButton.className = "del";
      deleteButton.textContent = "x";
      deleteButton.style.display = "none";
      deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        tag.remove();
      });

      tag.addEventListener("mouseover", function () {
        deleteButton.style.display = "block";
      });

      tag.addEventListener("mouseout", function () {
        deleteButton.style.display = "none";
      });

      tag.appendChild(deleteButton);

      insertTag();
    }
  });

  tagContainer.appendChild(tag);
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

function sortNotesByDate() {
  const notesArray = Object.entries(notes);
  notesArray.sort(([idA], [idB]) => idA - idB);

  const sortedNotes = {};
  notesArray.forEach(([id, text]) => {
    sortedNotes[id] = text;
  });

  notes = sortedNotes;
  reloadNoteHTML();
  saveNotes();
}

function sortNotesByTag() {
  const notesArray = Object.entries(notes);

  notesArray.sort(([, noteA], [, noteB]) => {
    const tagsA = noteA.tags.map(tag => tag.toLowerCase());
    const tagsB = noteB.tags.map(tag => tag.toLowerCase());

    for (let i = 0; i < Math.min(tagsA.length, tagsB.length); i++) {
      const tagA = tagsA[i];
      const tagB = tagsB[i];

      if (tagA < tagB) {
        return -1;
      }
      if (tagA > tagB) {
        return 1;
      }
    }

    if (tagsA.length > tagsB.length) {
      return 1; 
    }
    if (tagsA.length < tagsB.length) {
      return -1;
    }

    return 0; 
  });

  const sortedNotes = {};
  notesArray.forEach(([id, note]) => {
    sortedNotes[id] = note;
  });

  notes = sortedNotes;
  reloadNoteHTML();
  saveNotes();
}


loadSettings();
loadNotes();
console.log("Current Notes: ", notes);
insertTag();

// this function only creates the note in the notes[] array, then calls addNoteHTML
function addNote(text, insertAfter) {
  const title = titleInput.value || "";
  const content = text === "" ? infoInput.value : text;
  infoInput.value = ""; // empty out the textbox
  titleInput.value = "";

  // stop if no text is provided
  if (title === "" && content === "") return;

  const id = Date.now();
  const tags = Array.from(document.getElementsByClassName("tag")).map(
    (tag) => tag.textContent.slice(0, -1)
  );

  notes[id] = { title, content, tags, };
  saveNotes();

  // Delete all tags in tagContainer
  const currentTags = Array.from(document.getElementsByClassName("tag"));
  for (let i = 0; i < currentTags.length; i++) {
    currentTags[i].remove();
  }
  console.log(tags);

  // create the actual HTML element
  addNoteHTML(title, content, tags, id, insertAfter);
}

// don't call directly unless you're reloading
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
  deleteButton.className = "del";
  deleteButton.textContent = "x";
  deleteButton.style.display = "none";
  deleteButton.addEventListener("click", function (event) {
    event.stopPropagation();
    deleteNote(id);
    note.remove();

    // remove overlay
    let ove = document.getElementsByClassName("overlay");
    if (ove.length !== 0) document.body.removeChild(ove[0]);
  });
  note.appendChild(deleteButton);

  note.addEventListener("dragstart", function (event) {
    event.dataTransfer.setData("text/plain", note.id);
    note.classList.add("dragging");
    startY = event.clientY;
  });

  note.addEventListener("dragend", function () {
    note.classList.remove("dragging");
  });

  note.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  note.addEventListener("drop", function (event) {
    event.preventDefault();
    const draggedNoteId = event.dataTransfer.getData("text/plain");
    const draggedNote = document.getElementById(draggedNoteId);
    const endY = event.clientY;

    if (draggedNote && draggedNote !== note) {
      if (endY < startY) {
        note.insertAdjacentElement("beforebegin", draggedNote);
      } else {
        note.insertAdjacentElement("afterend", draggedNote);
      }
    }
  });

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

      overlay.addEventListener("click", function () {
        // remove overlay
        document.body.removeChild(overlay);
        note.classList.remove("overlay-created");
        note.style.zIndex = null;

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
  noteTitle.contentEditable = true;
  noteTitle.className = "note-title";
  noteTitle.innerText = title;
  const noteContent = document.createElement("textarea");
  noteContent.className = "note-content displayNone";
  noteContent.value = text;
  const noteDisplay = document.createElement("div");
  noteDisplay.className = "note-display";
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

  note.appendChild(tagBar);

  const bottomBar = createFormatBar();

  const timeText = document.createElement("div");
  timeText.className = "time-text";
  timeText.style = "justify-content: right";
  const noteCreatedTime = new Date(+id);
  timeText.textContent = `Created: ${noteCreatedTime.toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  })}`;

  bottomBar.appendChild(timeText);
  note.appendChild(bottomBar);

  if (insertAfter && insertAfter.nextElementSibling) {
    container.insertBefore(note, insertAfter.nextElementSibling);
  } else {
    container.appendChild(note);
  }
}

function createFormatBar() {
  const bottomBar = document.createElement("div");
  bottomBar.className = "bottom-bar";

  const bold = document.createElement("button");
  bold.textContent = "B";
  bold.style.fontWeight = "bold";
  bold.addEventListener("pointerdown", evt => {
    evt.preventDefault();
    document.execCommand("bold");
  });

  const italic = document.createElement("button");
  italic.textContent = "I";
  italic.style.fontStyle = "italic";
  italic.addEventListener("pointerdown", evt => {
    evt.preventDefault();
    document.execCommand("italic");
  });

  const underline = document.createElement("button");
  underline.textContent = "U";
  underline.style.textDecoration = "underline";
  underline.addEventListener("pointerdown", evt => {
    evt.preventDefault();
    document.execCommand("underline");
  });

  bottomBar.appendChild(bold);
  bottomBar.appendChild(italic);
  bottomBar.appendChild(underline);
  

  return bottomBar;
}

// formatBar.append(createFormatBar());

add.addEventListener("click", function () {
  addNote("");
});

document.addEventListener("DOMContentLoaded", function () {
  reloadNoteHTML();
});

document.addEventListener("visibilitychange", function () {
  saveNotesOrder();
});

deleteAllButton.addEventListener("click", function (event) {
  deleteAllNotes();
});

openSettingsButton.addEventListener("click", function (event) {
  dialog.showModal();
});

closeSettings.addEventListener("click", function() {
  dialog.close();
});

dialog.addEventListener("click", function(event) {
  const modalContent = document.querySelector(".modal-content");
  if (!modalContent.contains(event.target)) {
    dialog.close();
  }
});

resetSettings.addEventListener("click", function() {
  Object.assign(settings, defaultSettings);
  applySettings();
  saveSettings();
});

customBackgroundColor.addEventListener("input", function (event) {
  const customColor = event.target.value;

  if (customColor !== "" && CSS.supports("color", customColor)) {
    settings.customColor = customColor;
    document.body.style.backgroundColor = settings.customColor;
    saveSettings();
  }
});

sort.addEventListener("click", function (event) {
  event.stopPropagation();
  if(sortChoice == "date") {
    sortNotesByDate();
  }
  else if(sortChoice == "tag") {
    sortNotesByTag();
  }
});

function handleInput(input) {
  const tagPrefix = 'tag:';
  
  if (input.startsWith(tagPrefix)) {
    const tag = input.slice(tagPrefix.length).trim();
    searchNotesByTag(tag);
  } else {
    showAllNotes();
  }
}

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

function showAllNotes() {
  const noteElements = document.getElementsByClassName('note');
  
  for (let i = 0; i < noteElements.length; i++) {
    noteElements[i].style.display = 'block'; 
  }
}

search.addEventListener("input", function () {
  const searchTag = search.value.trim().toLowerCase();
  handleInput(searchTag);
});

function sortEntries() {
  const sortBy = sortDropdown.value;
  console.log(sortBy);
  if (sortBy === "date") {
    sortChoice = "date";
    sort.textContent = "Sort By Date";
  } else if (sortBy === "tag") {
    sortChoice = "tag";
    sort.textContent = "Sort By Tag";
  }
}

sortDropdown.addEventListener("change", sortEntries);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const content = request.content;

  // make that new message if it's non-empty
  if (content) addNote(content);
});

