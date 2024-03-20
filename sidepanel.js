const add = document.getElementById("add");
const del = document.getElementById("delete");
const container = document.getElementById("container");
const info = document.getElementById("info");

const dAdd = document.createElement("button");
dAdd.id = "dAdd";
dAdd.textContent = "Add Note";
dAdd.style.marginTop = "10px";
dAdd.style.padding = "10px";
dAdd.style.border = "none";
dAdd.style.borderRadius = "5px";
dAdd.style.marginLeft = "auto";
dAdd.style.marginRight = "auto";
dAdd.style.width = "fit-content";
dAdd.style.display = "none";

dAdd.addEventListener("click", function () {
  addNote("",insertAfterNote);
});

container.appendChild(dAdd);

function addNote(text, insertAfter = null) {
  const notes = document.querySelectorAll(".note");
  if(notes.length == 5) {
    return;
  }

  const note = document.createElement("div");
  note.className = "note";

  const deleteButton = document.createElement("button");
  deleteButton.className = "del";
  deleteButton.textContent = "x";
  deleteButton.style.display = "none";

  deleteButton.addEventListener("click", function () {
    this.parentElement.remove();
  });

  note.appendChild(deleteButton);

  note.addEventListener("mouseover", function () {
    deleteButton.style.display = "block";
  });

  note.addEventListener("mouseout", function () {
    deleteButton.style.display = "none";
  });

  const noteContent = document.createElement("div");
  noteContent.contentEditable = true;
  noteContent.className = "note-content";
  
  noteContent.textContent = text === "" ? info.value : text;

  note.appendChild(noteContent);

  note.style.width = "200px";
  note.style.height = "100px";
  note.style.left = "15%";
  note.style.margin = "10px 0";

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
    const text = localStorage.getItem("note" + (i+1));
    addNote(text);
  }
});

document.addEventListener("visibilitychange", function() {
  localStorage.clear();

  if (document.visibilityState === "hidden") {
    const notes = document.querySelectorAll(".note");
    localStorage.setItem("notes", notes.length);

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const text = note.querySelector(".note-content").textContent;
      localStorage.setItem("note" + (i + 1), text);
    }
  }
});

let pushedNote = null;
let insertAfterNote = null;

container.addEventListener("mousemove", function(event) {
    const notes = container.querySelectorAll('.note');
    let foundGap = false;

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const nextNote = notes[i + 1];

        const noteRect = note.getBoundingClientRect();
        const nextNoteRect = nextNote ? nextNote.getBoundingClientRect() : null;

        const gapTop = noteRect.bottom-5;
        const gapBottom = nextNoteRect ? nextNoteRect.top-10 : container.getBoundingClientRect().bottom;
        
        if (event.clientY > gapTop && event.clientY < gapBottom) {
            dAdd.style.position = "absolute";
            dAdd.style.left = `${noteRect.left + (noteRect.width - dAdd.offsetWidth) / 2}px`;
            dAdd.style.top = `${gapTop-25}px`;
            dAdd.style.display = "block";

            if (nextNote) {
                nextNote.style.marginTop = `${dAdd.offsetHeight + 10}px`; 
                pushedNote = nextNote;
            }
            insertAfterNote = note;
            foundGap = true;
            break;
        }
    }

    if (!foundGap && dAdd.style.display !== "none") {
        dAdd.style.display = "none";
        pushedNote.style.marginTop = "";
        pushedNote = null; 
        insertAfterNote = null;
    }
});