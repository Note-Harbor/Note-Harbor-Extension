(async _ => {
    // notes are stored as an object
    // key: Date.now()
    // value: {content: string, tags: string[], title: string}
    // this lets us sort the notes by date, and delete by some ID
    let notes = {};

    await loadSettings();
    await loadNotes();
    //insertTag();
    //formatBar.append(createFormatBar());

    add.addEventListener("click", _ => { addNote(""); });
    document.addEventListener("DOMContentLoaded", _ => { reloadNoteHTML(); loadFolders(); });
    document.addEventListener("visibilitychange", _ => { saveNotesOrder(); saveFolders(); });

    // context menu --> add new note
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const content = request.content;

        // make that new message if it's non-empty
        if (content) addNote(content);
    });
})()

