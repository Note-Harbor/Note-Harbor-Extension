/** Helpful type definitions
 * @typedef {Object} Note
 * @property {string} title - Title of the note
 * @property {string} content - Content of the note
 * @property {Date} createdDate - The date the note was created
 * @property {number} folderID - unique ID of the folder
 * 
 * @typedef {Object} Folder
 * @property {string} folderName
 * @property {number} folderID
 * 
 * @typedef AppData
 * @property {Note[]} notes
 * @property {number[]} folders
 */

/** @type AppData - Stores the app's state */
const appData = {
	notes: [],
	folders: []
}

// Our service worker loses all state every 30s, so we're treating chrome.storage.local as the single source of truth
// To persist data, make changes to storage
const initAppData = chrome.storage.local.get().then((items) => {
	Object.assign(appData, items);
});


async function saveStorage() {
	return chrome.storage.local.set(appData);
}

async function PaulRevere() {
	chrome.runtime.sendMessage("updateNotes");
}



chrome.runtime.onInstalled.addListener(async () => {
	// setup chrome context menus
	chrome.contextMenus.create({
		id: "addnote",
		title: "Add to Harbor",
		contexts: ["selection"]
	})

	// initialize storage
	await initAppData
	chrome.storage.local.set(appData);
});

// handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "addnote") {
		chrome.runtime.sendMessage({
			command: "addNote",
			data: { /** @type Note */
				title: "",
				content: info.selectionText,
				createdDate: Date.now(),
				folderID: -1
			}
		});
	}
});

// open panel onclick
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error))

/** Usage
 * chrome.runtime.sendMessage({command: "getData"})
 * chrome.runtime.sendMessage({command: "addNote", data: {title: "test", content: "hello world"}})
 **/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message === null || message.command === null) {
		sendResponse("CHECK YOU FORMATTED THE COMMAND PROPERLY");
		return;
	};
	const command = message.command;
	
	switch (command) {
		case "getData": {
			sendResponse(appData);
			break;
		}

		case "addNote": {
			/** @type Note */
			const noteData = message.data;
			const {title, content, createdDate, folderID} = noteData;
			appData.notes.push({title, content, createdDate, folderID});
			chrome.runtime.message("addNoteUI")
			saveStorage();
		}

		default: {
			sendResponse("I DONT KNOW WHAT YOU WANT ME TO DO");
			break;
		}
	}
});