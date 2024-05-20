// temp code taken from https://github.com/avirads/sidepanel_mvp/tree/main
function setupContextMenu(){
	chrome.contextMenus.create({
		id: "test",
		title: "test",
		contexts: ["selection"]
	})
}

chrome.runtime.onInstalled.addListener(()=>{
	setupContextMenu()
})

chrome.runtime.onStartup.addListener(()=>{
	setupContextMenu()
	chrome.storage.sync.get(["savedNotes"]).then((result) => {
		for (i = 0; i < result.savedNotes.length; i++) {
			container.appendChild(result.savedNotes[i])
		}
	})
})