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

chrome.commands.onCommand.addListener((command) => {
	console.log(`Command "${command}" triggered`)
})

// open panel onclick
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));