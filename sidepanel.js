const add = document.getElementById("add");
const container = document.getElementById("container");
const info = document.getElementById("info");
const sort = document.getElementById("sort");
const tagContainer = document.getElementById("tagRow");
const search = document.getElementById("search");

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
// value: note contents
// this lets us sort the notes by date, and delete by some ID
let notes = {};
const defaultSettings = {
  customColor: "aliceblue"
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
  Object.entries(notes).map(([id, {content, tags}]) => addNoteHTML(content, tags, id));
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
  const content = text === "" ? info.value : text;
  info.value = ""; // empty out the textbox

  // stop if no text is provided
  if (content === "") return;

  const id = Date.now();
  const tags = Array.from(document.getElementsByClassName("tag")).map(
    (tag) => tag.textContent.slice(0, -1)
  );
  notes[id] = { content, tags };
  saveNotes();

  // Delete all tags in tagContainer
  const currentTags = Array.from(document.getElementsByClassName("tag"));
  for (let i = 0; i < currentTags.length; i++) {
    currentTags[i].remove();
  }
  console.log(tags);

  // create the actual HTML element
  addNoteHTML(content, tags, id, insertAfter);
}

// don't call directly unless you're reloading
function addNoteHTML(text, tags, id, insertAfter = null) {
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
    startY = event.clientY;
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
    if (!this.classList.contains("overlay-created")) {
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      document.body.appendChild(overlay);

      overlay.addEventListener("click", function () {
        document.body.removeChild(overlay);
        note.classList.remove("overlay-created");
        note.style.zIndex = null;
      });

      this.classList.add("overlay-created");
      this.style.zIndex = "999";
    }
  });

  const noteContent = document.createElement("div");
  noteContent.contentEditable = true;
  noteContent.className = "note-content";
  noteContent.innerHTML = text;
  
  note.appendChild(noteContent);

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

  const bottomBar = document.createElement("div");
  bottomBar.className = "flex";

  const bold = document.createElement("button");
  bold.textContent = "B";
  bold.style.fontWeight = "bold";
  bold.addEventListener("click", () => {
    document.execCommand("bold");
  });

  const italic = document.createElement("button");
  italic.textContent = "I";
  italic.style.fontStyle = "italic";
  italic.addEventListener("click", () => {
    document.execCommand("italic");
  });

  const underline = document.createElement("button");
  underline.textContent = "U";
  underline.style.textDecoration = "underline";
  underline.addEventListener("click", () => {
    document.execCommand("underline");
  });

  const timeText = document.createElement("div");
  timeText.className = "time-text";
  timeText.style = "justify-content: right";
  const noteCreatedTime = new Date(+id);
  timeText.textContent = `Created: ${noteCreatedTime.toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  })}`;

  bottomBar.appendChild(bold);
  bottomBar.appendChild(italic);
  bottomBar.appendChild(underline);
  bottomBar.appendChild(timeText);

  note.appendChild(bottomBar);

  if (insertAfter && insertAfter.nextElementSibling) {
    container.insertBefore(note, insertAfter.nextElementSibling);
  } else {
    container.appendChild(note);
  }
}

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
  console.log(event)
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

info.onload = info.oninput = () => {
  info.style.height = "auto";
  info.style.height = info.scrollHeight + "px";
};

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

