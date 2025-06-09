"use strict";

console.log("--- Local Storage and Session Storage Examples ---");

const outputDiv = document.getElementById('output');

function updateOutput(message, data = null) {
    let outputText = message;
    if (data !== null) {
        // Use JSON.stringify for better readability of objects/arrays
        outputText += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    outputDiv.textContent = outputText;
    console.log(message, data);
}

// ===========================================
// Local Storage Examples
// ===========================================

document.getElementById('set-local-string').addEventListener('click', () => {
    localStorage.setItem('username', 'AliceSmith');
    updateOutput("Set 'username' in localStorage.", localStorage.getItem('username'));
    // Check in browser's DevTools -> Application -> Local Storage
});

document.getElementById('get-local-string').addEventListener('click', () => {
    const username = localStorage.getItem('username');
    if (username) {
        updateOutput("Retrieved 'username' from localStorage.", username);
    } else {
        updateOutput("'username' not found in localStorage.");
    }
});

document.getElementById('remove-local-string').addEventListener('click', () => {
    localStorage.removeItem('username');
    updateOutput("Removed 'username' from localStorage.");
});

document.getElementById('set-local-object').addEventListener('click', () => {
    const userSettings = {
        theme: 'dark',
        notifications: true,
        itemsPerPage: 10,
        lastLogin: new Date().toISOString() // Store Date as ISO string
    };
    // localStorage only stores strings, so convert object to JSON string
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    updateOutput("Set 'userSettings' object in localStorage.", userSettings);
});

document.getElementById('get-local-object').addEventListener('click', () => {
    const settingsString = localStorage.getItem('userSettings');
    if (settingsString) {
        // Convert JSON string back to JavaScript object
        const userSettings = JSON.parse(settingsString);
        updateOutput("Retrieved 'userSettings' object from localStorage.", userSettings);
        console.log("Type of retrieved userSettings:", typeof userSettings);
        console.log("Type of lastLogin in object:", typeof userSettings.lastLogin); // Will be string, not Date object!
    } else {
        updateOutput("'userSettings' not found in localStorage.");
    }
});

document.getElementById('clear-local').addEventListener('click', () => {
    localStorage.clear();
    updateOutput("Cleared ALL items from localStorage.");
    // Verify in DevTools -> Application -> Local Storage (it should be empty)
});


// ===========================================
// Session Storage Examples
// ===========================================

document.getElementById('set-session-string').addEventListener('click', () => {
    sessionStorage.setItem('tempMessage', 'Welcome back for this session!');
    updateOutput("Set 'tempMessage' in sessionStorage.", sessionStorage.getItem('tempMessage'));
    // Check in browser's DevTools -> Application -> Session Storage
});

document.getElementById('get-session-string').addEventListener('click', () => {
    const message = sessionStorage.getItem('tempMessage');
    if (message) {
        updateOutput("Retrieved 'tempMessage' from sessionStorage.", message);
    } else {
        updateOutput("'tempMessage' not found in sessionStorage.");
    }
});

document.getElementById('remove-session-string').addEventListener('click', () => {
    sessionStorage.removeItem('tempMessage');
    updateOutput("Removed 'tempMessage' from sessionStorage.");
});

document.getElementById('set-session-array').addEventListener('click', () => {
    const shoppingCart = [
        { id: 1, name: "Laptop", qty: 1, price: 1200 },
        { id: 2, name: "Mouse", qty: 2, price: 25 }
    ];
    // Convert array to JSON string for sessionStorage
    sessionStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
    updateOutput("Set 'shoppingCart' array in sessionStorage.", shoppingCart);
});

document.getElementById('get-session-array').addEventListener('click', () => {
    const cartString = sessionStorage.getItem('shoppingCart');
    if (cartString) {
        // Convert JSON string back to JavaScript array
        const shoppingCart = JSON.parse(cartString);
        updateOutput("Retrieved 'shoppingCart' array from sessionStorage.", shoppingCart);
        console.log("Type of retrieved shoppingCart:", typeof shoppingCart); // object
        console.log("Is it an array?", Array.isArray(shoppingCart)); // true
    } else {
        updateOutput("'shoppingCart' not found in sessionStorage.");
    }
});

document.getElementById('clear-session').addEventListener('click', () => {
    sessionStorage.clear();
    updateOutput("Cleared ALL items from sessionStorage.");
    // Verify in DevTools -> Application -> Session Storage (it should be empty)
});

// --- Understanding Session Storage Persistence ---
// 1. After setting session storage, try closing the tab and reopening it.
//    You will lose the data.
// 2. Try navigating to another page within the same tab, then use the back button.
//    You will notice the data is still there, as it's the same session.

// --- Storage Event (for cross-tab communication) ---
// Open two tabs to the same HTML file.
// In one tab, click "Set Local String".
// Observe the console in the *other* tab.
window.addEventListener('storage', (event) => {
    console.log("--- Storage Event Fired ---");
    console.log("Key changed:", event.key);
    console.log("Old value:", event.oldValue);
    console.log("New value:", event.newValue);
    console.log("URL of change:", event.url);
    console.log("Storage Area (localStorage or sessionStorage):", event.storageArea);

    if (event.key === 'username') {
        outputDiv.textContent = `A storage event for 'username' occurred in another tab!\nNew value: ${event.newValue}`;
    }
});