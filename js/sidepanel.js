loadSettings();
loadNotes();
//insertFolder();
formatBar.append(createFormatBar());

add.addEventListener("click", _ => { addNote(""); });
erase.addEventListener("click", _ => { eraseNote(); });
document.addEventListener("DOMContentLoaded", _ => { reloadNoteHTML(); loadFolders(); });
document.addEventListener("visibilitychange", _ => { saveNotesOrder(); saveFolders(); });

// context menu --> add new note
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const content = request.content;
    const url = request.url

    // make that new message if it's non-empty
    if (content) addNote({insert: content, url: url});
});

