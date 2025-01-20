loadSettings();
loadNotes();
insertTag();
formatBar.append(createFormatBar());

add.addEventListener("click", _ => { addNote(); });
document.addEventListener("DOMContentLoaded", _ => { reloadNoteHTML(); });
document.addEventListener("visibilitychange", _ => { saveNotesOrder(); });

// context menu --> add new note
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {title, content} = request;
    console.log(title, content);

    // make that new message if it's non-empty
    if (content) addNote(title, content);
});