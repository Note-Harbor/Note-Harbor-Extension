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
	console.log(info, tab);

	let extractedUrl = info.linkUrl || info.pageUrl;

	if (info.menuItemId === "addnote") {
		console.log(`Adding the note "${info.selectionText}"`);
		
		// we don't need a response, don't bother waiting for one
		chrome.runtime.sendMessage({
			content: info.selectionText,
			url: extractedUrl
		});

	}
})


// open panel onclick
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error))