const add = document.getElementById("add");
const del = document.getElementById("delete");
const container = document.getElementById("container");
const info = document.getElementById("info");
let x = 0;

function addNote(text) {
  if (x == 550) {
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
    updateStorageDelete();
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
  note.style.position = "absolute";
  note.style.left = "15%";
  note.style.top = x + "px";

  container.appendChild(note);

  updateStorage(text);

  x += 110;
}

function updateStorage(text) {
  const i = x / 110;
  localStorage.setItem("notes", i);
  localStorage.setItem("note" + i, text);
}

function updateStorageDelete() {
  const notes = document.querySelectorAll(".note");
  const noteCount = localStorage.getItem("notes");

  for (let i = 0; i <= noteCount; i++) {
    localStorage.removeItem("note" + i);
  }

  localStorage.setItem("notes", notes.length - 1);

  notes.forEach((note, i) => {
    const text = note.querySelector(".note-content").textContent;
    localStorage.setItem("note" + i, text);
  });

  x = 0;
  notes.forEach((note) => {
    note.style.top = x + "px";
    x += 110;
  });
}

add.addEventListener("click", function () {
  addNote("");
});

document.addEventListener("DOMContentLoaded", function () {
  const noteCount = localStorage.getItem("notes");
  for (let i = 0; i <= noteCount; i++) {
    const text = localStorage.getItem("note" + i);
    addNote(text);
  }
});

del.addEventListener("click", function () {
  const notes = document.querySelectorAll(".note");
  const lastNote = notes[notes.length - 1];

  if (x > 0 && lastNote) {
    container.removeChild(lastNote);
    updateStorageDelete();
  }
});
