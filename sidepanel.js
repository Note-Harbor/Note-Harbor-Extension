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
  note.addEventListener("mouseover", function () {
    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "x";
    del.addEventListener("mouseover", function () {
      console.log("mouseover");
      del.parentElement.remove();
      chrome.storage.sync.set({ notes: notes });
    });
    note.appendChild(del);
  });
  note.addEventListener("mouseout", function () {
    const del = note.querySelector(".del");
    if (del) {
      // If the delete button exists, remove it
      del.remove();
    }
  });
  const noteInfo = document.createElement("p");
  if(text == "")
    text = info.value;
  noteInfo.textContent = text;
    
  note.appendChild(noteInfo);

  note.style.width = "200px";
  note.style.height = "100px";

  note.style.position = "absolute";
  note.style.left = "15%";

  note.style.top = x + "px";

  container.appendChild(note);

  localStorage.setItem("notes", x/110);
  localStorage.setItem("note" + (x / 110), text);

  x += 110;
}

add.addEventListener("click", function () {
  addNote("");
});

document.addEventListener("DOMContentLoaded", function () {
  noteCount = localStorage.getItem("notes");
  for (let i = 0; i <= noteCount; i++) {
    text = localStorage.getItem("note" + i);
    addNote(text);
  }
});

del.addEventListener("click", function () {
  const notes = document.querySelectorAll(".note");
  const lastNote = notes[notes.length - 1];

  if (x > 0) {
    container.removeChild(lastNote);

    x -= 110;
    localStorage.setItem("notes", x / 110 - 1);
    localStorage.removeItem("note" + (x / 110));
  }
});
/*
function drag(note) {
  let x = 0, y = 0, isDragging = false;

  note.addEventListener("mousedown", function (e) {
    isDragging = true;
    x = e.clientX - note.getBoundingClientRect().left;
    y = e.clientY - note.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      note.style.left = e.clientX - x + "px";
      note.style.top = e.clientY - y + "px";
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });
}
*/
