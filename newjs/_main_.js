chrome.runtime.sendMessage('getNotes', (response) => {
    console.log('received user data', response);
});