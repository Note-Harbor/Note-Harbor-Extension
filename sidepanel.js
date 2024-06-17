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
  addNote("", insertAfterNote);
});

container.appendChild(dAdd);

function addNote(text, insertAfter = null) {
  // don't make empty notes
  if (text === "" && info.value === "") return;
  
  // create note elements, then add event listeners
  const note = document.createElement("div");
  note.className = "note";
  const deleteButton = document.createElement("button");
  deleteButton.className = "del";
  deleteButton.textContent = "x";
  deleteButton.style.display = "none";

  deleteButton.addEventListener("click", function (event) {
    event.stopPropagation();
    note.remove();
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
            note.style.zIndex = "0";
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

let pushedNote = null;
let insertAfterNote = null;

// container.addEventListener("mousemove", function (event) {
//   const notes = container.querySelectorAll(".note");
//   let foundGap = false;

//   for (let i = 0; i < notes.length; i++) {
//     const note = notes[i];
//     const nextNote = notes[i + 1];

//     const noteRect = note.getBoundingClientRect();
//     const nextNoteRect = nextNote ? nextNote.getBoundingClientRect() : null;

//     const gapTop = noteRect.bottom - 5;
//     const gapBottom = nextNoteRect
//       ? nextNoteRect.top - 10
//       : container.getBoundingClientRect().bottom;

//     if (event.clientY > gapTop && event.clientY < gapBottom) {
//       dAdd.style.position = "absolute";
//       dAdd.style.display = "block";
//       dAdd.style.left = `${
//         noteRect.left + (noteRect.width - dAdd.offsetWidth) / 2
//       }px`;
//       dAdd.style.top = `${gapTop - 30}px`;

//       if (nextNote) {
//         nextNote.style.marginTop = `${dAdd.offsetHeight + 10}px`;
//         pushedNote = nextNote;
//       }
//       insertAfterNote = note;
//       foundGap = true;
//       break;
//     }
//   }

//   if (!foundGap && dAdd.style.display !== "none") {
//     dAdd.style.display = "none";
//     pushedNote.style.marginTop = "10px";
//     pushedNote = null;
//     insertAfterNote = null;
//   }
// });

info.onload = info.oninput = () => {
  info.style.height = "100px";
  info.style.height = info.scrollHeight + "px";
}
