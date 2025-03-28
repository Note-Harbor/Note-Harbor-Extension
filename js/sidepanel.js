loadSettings();
loadNotes();
//insertTag();
//formatBar.append(createFormatBar());

add.addEventListener("click", _ => { addNote(""); });
document.addEventListener("DOMContentLoaded", _ => { reloadNoteHTML(); loadFolders(); });
document.addEventListener("visibilitychange", _ => { saveNotesOrder(); saveFolders(); });

// context menu --> add new note
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const content = request.content;
    const title = request.url || "Untitled";

    // make that new message if it's non-empty
    if (content) addNote(content, title);
    
    sendResponse({ status: "Received" });
});
