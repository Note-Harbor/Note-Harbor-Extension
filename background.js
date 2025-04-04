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
		
		// Open sidepanel to ensure connection is met for event listener
		chrome.sidePanel.open({ tabId: tab.id })
		
		// Ensure content scripts have time to activate
		setTimeout(() => {
			chrome.runtime.sendMessage({
				content: info.selectionText,
				url: extractedUrl
			});
		  }, 200);
	}
})

// open panel onclick
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error))