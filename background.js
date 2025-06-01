// our service worker loses all state every 30s, so we're treating chrome.storage.local as the single source of truth
// to persist data, make changes to storage
const appData = {
	notes: [],
	folders: []
}
const initAppData = chrome.storage.local.get().then((items) => {
	Object.assign(appData, items);
});


async function saveStorage() {
	return chrome.storage.local.set(appData);
}



chrome.runtime.onInstalled.addListener(async () => {
	// setup chrome context menus
	chrome.contextMenus.create({
		id: "addnote",
		title: "Add to Harbor",
		contexts: ["selection"]
	})

	// initialize storage
	try {
		await initAppData;
	} catch (e) {
		// no error handling ?
	}
	chrome.storage.local.set(appData);
});

// handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
	console.log(info, tab);
	if (info.menuItemId === "addnote") {
		console.log(`Adding the note "${info.selectionText}"`);
		
		// we don't need a response, don't bother waiting for one
		chrome.runtime.sendMessage({content: info.selectionText});
	}
})

// open panel onclick
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error))

/** Usage:
 * chrome.runtime.sendMessage({command: "getData"})
 * chrome.runtime.sendMessage({command: "addNote", title: "test", content: "hello world"})
 **/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message === null) return;
	const command = message.command;
	
	switch (command) {
		case "getData": {
			sendResponse(appData);
			break;
		}

		case "addNote": {
			const {title, content, folder} = message;
		}


		default: {
			sendResponse("I DONT KNOW WHAT YOU WANT ME TO DO");
			break;
		}
	}
});