const add = document.getElementById("add");
const del = document.getElementById("delete");
const container = document.getElementById("container");
const info = document.getElementById("info");

const dAdd = document.createElement("button");
dAdd.id = "dAdd";
dAdd.textContent = "Add Note";
let startY = 0;

// dAdd.addEventListener("click", function () {
//   addNote("", insertAfterNote);
// });

let trans = "";

container.appendChild(dAdd);

function generateId(existingIds) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';

  while (true) {
    id = '';
    for (let i = 0; i < 32; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      id += charset[randomIndex];
    }
    if (!existingIds.has(id)) break;
  }

  return id;
}

function addNote(text, insertAfter = null) {
  // don't make empty notes
  if (text === "" && info.value === "") return;
  
  // create note elements, then add event listeners
  const note = document.createElement("div");
  note.className = "note";
  note.draggable = "true";

  const existingIds = new Set(Array.from(document.querySelectorAll(".note")).map(n => n.id));
  note.id = generateId(existingIds);

  const deleteButton = document.createElement("button");
  deleteButton.className = "del";
  deleteButton.textContent = "x";
  deleteButton.style.display = "none";

  deleteButton.addEventListener("click", function (event) {
    event.stopPropagation();
    note.remove();
    
    // remove overlay
    let ove = document.getElementsByClassName("overlay");
    if (ove.length !== 0) {
      document.body.removeChild(ove[0]);
    }
  });

  note.appendChild(deleteButton);

  note.addEventListener("mouseover", function () {
    deleteButton.style.display = "block";
  });

  note.addEventListener("mouseout", function () {
    deleteButton.style.display = "none";
  });

  note.addEventListener("click", function () {
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

  noteContent.innerHTML = text === "" ? info.value : text;
  info.value = "";

  note.appendChild(noteContent);

  const formatBar = document.createElement("div");
  formatBar.className = "format-bar";
  
  const bold = document.createElement("button");
  bold.textContent = "B";
  bold.style.fontWeight = "bold";
  bold.addEventListener("click", function () {
    document.execCommand('bold');
  });
  
  const italic = document.createElement("button");
  italic.textContent = "I";
  italic.style.fontStyle = "italic";
  italic.addEventListener("click", function () {
    document.execCommand('italic');
  });
  
  const underline = document.createElement("button");
  underline.textContent = "U";
  underline.style.textDecoration = "underline";
  underline.addEventListener("click", function () {
    document.execCommand('underline');
  });
  
  formatBar.appendChild(bold);
  formatBar.appendChild(italic);
  formatBar.appendChild(underline);
  
  note.appendChild(formatBar);

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
        note.insertAdjacentElement('beforebegin', draggedNote);
      } else {
        note.insertAdjacentElement('afterend', draggedNote);
      }
    }
  });


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
  const noteCount = localStorage.getItem("notes");
  for (let i = 0; i < noteCount; i++) {
    const text = localStorage.getItem("note" + (i + 1));
    addNote(text);
  }
});

document.addEventListener("visibilitychange", function () {
  localStorage.clear();

  if (document.visibilityState === "hidden") {
    const notes = document.querySelectorAll(".note");
    localStorage.setItem("notes", notes.length);

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const text = note.querySelector(".note-content").innerHTML;
      localStorage.setItem("note" + (i + 1), text);
    }
  }
});

info.onload = info.oninput = () => {
  info.style.height = "100px";
  info.style.height = info.scrollHeight + "px";
}
