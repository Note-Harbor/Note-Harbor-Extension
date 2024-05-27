chrome.commands.onCommand.addListener((command) => {
	console.log(`Command "${command}" triggered`)
})

// open panel onclick
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));