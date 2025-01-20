// add context menu on select
function setupContextMenu(){
	chrome.contextMenus.create({
		id: "addnote",
		title: "Add to Harbor",
		contexts: ["selection"]
	})
}
chrome.runtime.onInstalled.addListener(() => { setupContextMenu() })

// handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
	// console.log(info, tab);
	if (info.menuItemId === "addnote") {
		// we don't need a response, don't bother waiting for one
		chrome.runtime.sendMessage({title: tab.title, content: info.selectionText});
	}
})


// open panel onclick
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error))