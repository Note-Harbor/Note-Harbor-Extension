/**
 * Creates dragging events for note objects
 * @param {object} note
 */
let draggedNote = null;

function addDraggingEvents(note) {
  note.draggable = true;

  note.addEventListener("dragstart", (event) => {
    draggedNote = note;
    note.classList.add("dragging");
  });

  note.addEventListener("dragend", () => {
    note.classList.remove("dragging");
    draggedNote = null;
    saveNotesOrder()
  });

  note.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (!draggedNote || draggedNote === note) {
        return;
    }
    const rect = note.getBoundingClientRect();
    const halfway = rect.top + rect.height / 2;

    if (event.clientY < halfway) {
      note.parentNode.insertBefore(draggedNote, note);
    } else {
      note.parentNode.insertBefore(draggedNote, note.nextSibling);
    }
  });

  note.addEventListener("drop", (event) => event.preventDefault());
}