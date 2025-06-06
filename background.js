/** Helpful type definitions
 * @typedef {Object} Note
 * @property {string|number} noteID - Unique ID identifying the note
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
	chrome.runtime.sendMessage({command: "UpdateUI"});
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
		processCommand({
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
chrome.runtime.onMessage.addListener(processCommand);

/**
 * The core event loop for the extension
 * @param {{command: string, data?: Object}} message 
 * @param {chrome.runtime.MessageSender} sender 
 * @param {(response?: any) => void} sendResponse
 */
function processCommand(message, sender, sendResponse) {
	if (message === null || message.command === null) return;
	const command = message.command;
	const data = message.data;
	
	switch (command) {
		case "getData": {
			sendResponse(appData);
			break;
		}
		case "getNotes": {
			sendResponse(appData.notes);
			break;
		}
		case "getStructure": {
			sendResponse(appData.folders);
			break;
		}

		case "addNote": {
			/** @type Note */
			const noteData = data;
			// you can replace the noteID with whatever you want, as long as it's a unique string/number
			let noteObject = {
				noteID: (Math.random()+"").slice(2) + (Math.random()+"").slice(2),
				title: noteData.title,
				content: noteData.content,
				createdDate: noteData.createdDate,
				folderID: noteData.folderID || -1
			}

			appData.notes.push(noteObject);
			chrome.runtime.sendMessage({command: "addNoteUI", data: noteObject});
			saveStorage();
			break;
		}

		case "deleteNote": {
			const noteID = data.id;

			let deletedNoteIndex = appData.notes.find(note => note.noteID === noteID);
			if (deletedNoteIndex !== -1) {
				let noteObject = appData.notes.splice(deletedNoteIndex, 1)[0];
				chrome.runtime.sendMessage({command: "deleteNoteUI", data: noteObject});
				saveStorage();
			} else {
				console.error(`Trying to delete note ${noteID}, which can't be found`);
			}
			
			break;
		}

		case "deleteAllNotes": {
			appData.notes = [];
			chrome.runtime.sendMessage({command: "deleteAllNotesUI"});
			saveStorage();
			break;
		}

		default: {
			sendResponse("I DONT KNOW WHAT YOU WANT ME TO DO");
			break;
		}
	}
}