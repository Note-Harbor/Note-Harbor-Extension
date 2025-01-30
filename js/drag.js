/**
 * Creates dragging events for note objects
 * @param {object} note
 */
function addDraggingEvents(note) {
    let startY = 0;

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
}

