"use strict";

console.log("--- Events and Event Listeners Examples ---");

// --- 1. Basic Click Event ---
console.log("\n--- 1. Basic Click Event ---");
const myButton = document.getElementById('my-button');
const clickMessage = document.getElementById('click-message');

if (myButton && clickMessage) {
    // Add an event listener to the button for the 'click' event
    myButton.addEventListener('click', function() {
        clickMessage.textContent = "Button was clicked!";
        console.log("My button clicked!");
    });
}


// --- 2. Multiple Listeners & Removing Listeners ---
console.log("\n--- 2. Multiple Listeners & Removing Listeners ---");
const multiListenerButton = document.getElementById('multi-listener-button');
const removeListenerButton = document.getElementById('remove-listener-button');

// Function to be added/removed (must be a named function or variable-assigned)
function firstListener() {
    console.log("First listener fired!");
    clickMessage.textContent = "First listener activated!";
}

function secondListener() {
    console.log("Second listener fired!");
    // clickMessage.textContent += " Second listener activated!"; // Could append
}

if (multiListenerButton && removeListenerButton && clickMessage) {
    // Add multiple listeners to the same event on the same element
    multiListenerButton.addEventListener('click', firstListener); // Using the named function
    multiListenerButton.addEventListener('click', secondListener);
    multiListenerButton.addEventListener('click', function() { // Anonymous function
        console.log("Third listener (anonymous) fired!");
    });

    // Remove a specific listener
    removeListenerButton.addEventListener('click', () => {
        // You MUST pass the exact same function reference to remove it
        multiListenerButton.removeEventListener('click', firstListener);
        console.log("First listener has been removed from 'Multi-Listener Button'.");
        clickMessage.textContent = "First listener removed. Try clicking the multi-listener button again!";
    });
}


// --- 3. Mouse Events ---
console.log("\n--- 3. Mouse Events ---");
const hoverBox = document.getElementById('hover-box');
const mouseCoordsDisplay = document.getElementById('mouse-coords');

if (hoverBox && mouseCoordsDisplay) {
    // Mouseover event: when mouse enters the element's area
    hoverBox.addEventListener('mouseover', () => {
        hoverBox.classList.add('hovered');
        console.log("Mouse over box!");
    });

    // Mouseout event: when mouse leaves the element's area
    hoverBox.addEventListener('mouseout', () => {
        hoverBox.classList.remove('hovered');
        console.log("Mouse out of box!");
    });

    // Mousemove event: constantly fires as mouse moves over the element
    hoverBox.addEventListener('mousemove', (event) => {
        // event.clientX and event.clientY give coordinates relative to the viewport
        mouseCoordsDisplay.textContent = `Mouse X: ${event.clientX}, Y: ${event.clientY}`;
    });
}


// --- 4. Keyboard Events ---
console.log("\n--- 4. Keyboard Events ---");
const keyInput = document.getElementById('key-input');
const keyDisplay = document.getElementById('key-display');

if (keyInput && keyDisplay) {
    // keydown: fires when a key is pressed down
    keyInput.addEventListener('keydown', (event) => {
        // event.key: The value of the key pressed (e.g., 'a', 'Enter', 'Shift')
        // event.code: The physical key on the keyboard (e.g., 'KeyA', 'Enter', 'ShiftLeft')
        keyDisplay.textContent = `KeyDown: Key = "${event.key}", Code = "${event.code}"`;
        console.log(`KeyDown: Key=${event.key}, Code=${event.code}`);
    });

    // keyup: fires when a key is released
    keyInput.addEventListener('keyup', (event) => {
        // keyDisplay.textContent = `KeyUp: Key = "${event.key}", Code = "${event.code}"`;
        console.log(`KeyUp: Key=${event.key}, Code=${event.code}`);
    });

    // input event: fires whenever the value of an input element changes (e.g., typing, pasting)
    keyInput.addEventListener('input', (event) => {
        console.log("Input value changed:", event.target.value);
    });
}


// --- 5. Form Events & preventDefault() ---
console.log("\n--- 5. Form Events & preventDefault() ---");
const myForm = document.getElementById('my-form');
const formMessage = document.getElementById('form-message');

if (myForm && formMessage) {
    // submit event: fires when the form is submitted
    myForm.addEventListener('submit', (event) => {
        // event.preventDefault() is CRUCIAL for forms if you want to handle submission with JS
        // It stops the default browser behavior (which is to reload the page or navigate)
        event.preventDefault();

        const usernameInput = document.getElementById('username');
        const useremailInput = document.getElementById('useremail');

        const username = usernameInput.value;
        const useremail = useremailInput.value;

        console.log("Form submitted!");
        console.log("Username:", username);
        console.log("Email:", useremail);

        if (username && useremail) {
            formMessage.textContent = `Form Submitted! User: ${username}, Email: ${useremail}`;
            formMessage.classList.add('success');
            formMessage.classList.remove('error');
            myForm.reset(); // Clear form fields
        } else {
            formMessage.textContent = "Please fill in all fields.";
            formMessage.classList.add('error');
            formMessage.classList.remove('success');
        }
    });
}


// --- 6. Event Delegation ---
console.log("\n--- 6. Event Delegation ---");
const delegationList = document.getElementById('event-delegation-list');
const addDelegatedItemBtn = document.getElementById('add-delegated-item');
let delegatedItemCounter = 4; // Start after existing items

if (delegationList && addDelegatedItemBtn) {
    // Attach ONE listener to the parent UL, not to each LI
    delegationList.addEventListener('click', (event) => {
        // Check if the clicked element (event.target) is an LI
        if (event.target.tagName === 'LI') {
            const clickedItemText = event.target.textContent;
            const itemId = event.target.dataset.itemId; // Access data-item-id attribute
            console.log(`Event delegated: Clicked item "${clickedItemText}" with ID "${itemId}"`);

            // Example: Remove the item if it's item 4 (or any item with specific ID)
            if (event.target.textContent.includes('Click to Remove') || itemId === '4') {
                event.target.remove(); // Remove the clicked list item
                console.log("Removed item:", clickedItemText);
            }
        }
        // event.stopPropagation(); // If you want to prevent bubbling further up the DOM tree
    });

    addDelegatedItemBtn.addEventListener('click', () => {
        delegatedItemCounter++;
        const newLi = document.createElement('li');
        newLi.textContent = `New Dynamic Item ${delegatedItemCounter}`;
        newLi.dataset.itemId = delegatedItemCounter; // Set a data attribute
        delegationList.appendChild(newLi);
        console.log("Added new dynamic item:", newLi.textContent);
    });
}

// Event bubbling demonstration (run this in console, click inner, then outer)
// document.getElementById('my-button').parentElement.addEventListener('click', () => {
//     console.log("Parent of my-button clicked (due to bubbling)");
// });