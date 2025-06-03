"use strict";

console.log("--- DOM Manipulation Examples ---");

// --- 1. Selecting Elements ---
console.log("\n--- 1. Selecting Elements ---");

// Get element by ID
const myParagraph = document.getElementById('my-paragraph');
console.log("Selected element by ID:", myParagraph);

// Get elements by class name (returns HTMLCollection)
const boxes = document.getElementsByClassName('box');
console.log("Selected elements by ClassName:", boxes);
// HTMLCollection is like an array but lacks some array methods (e.g., forEach needs conversion or a regular for loop)
// We'll often convert it to a true array if we need full array methods.
const boxesArray = Array.from(boxes); // Convert to Array
console.log("Converted boxes to Array:", boxesArray);

// Get elements by tag name (returns HTMLCollection)
const paragraphs = document.getElementsByTagName('p');
console.log("Selected elements by TagName (all p tags):", paragraphs);

// querySelector - selects the FIRST matching element
const firstBox = document.querySelector('.box'); // Selects the first div with class 'box'
console.log("Selected first .box with querySelector:", firstBox);

const myInput = document.querySelector('#my-input'); // Selects element with ID 'my-input'
console.log("Selected input with querySelector:", myInput);

// querySelectorAll - selects ALL matching elements (returns NodeList)
const allBoxes = document.querySelectorAll('.box'); // Selects all divs with class 'box'
console.log("Selected all .box with querySelectorAll:", allBoxes);
// NodeList is array-like, and DOES have forEach!
allBoxes.forEach((box, index) => {
    console.log(`Box ${index} selected by querySelectorAll:`, box);
});

// Select complex CSS selectors
const spanInsideBox = document.querySelector('.box #box-span');
console.log("Span inside box:", spanInsideBox);


// --- 2. Accessing/Modifying Content ---
console.log("\n--- 2. Accessing/Modifying Content ---");

const changeTextButton = document.getElementById('change-text-button');
if (changeTextButton) { // Always check if element exists before manipulating
    changeTextButton.addEventListener('click', () => {
        // textContent: Gets/sets pure text content, ignoring HTML tags
        console.log("Current paragraph text (textContent):", myParagraph.textContent);
        myParagraph.textContent = "Text changed by JavaScript! This is new content.";
        console.log("New paragraph text (textContent):", myParagraph.textContent);

        // innerHTML: Gets/sets HTML content. Use with caution!
        // myParagraph.innerHTML = "<strong>Text changed by JavaScript!</strong> This is <em>new</em> content.";
        // console.log("New paragraph HTML (innerHTML):", myParagraph.innerHTML);
    });
}

// Example for input value
const getInputBtn = document.getElementById('get-input-value');
const setInputBtn = document.getElementById('set-input-value');
const inputDisplay = document.getElementById('input-display');

if (getInputBtn && myInput && inputDisplay) {
    getInputBtn.addEventListener('click', () => {
        // .value: For input elements
        const inputValue = myInput.value;
        inputDisplay.textContent = `Input value: "${inputValue}"`;
        console.log("Input value:", inputValue);
    });
}
if (setInputBtn && myInput) {
    setInputBtn.addEventListener('click', () => {
        myInput.value = "New Value Set!";
        console.log("Input value set to:", myInput.value);
    });
}


// --- 3. Accessing/Modifying Attributes ---
console.log("\n--- 3. Accessing/Modifying Attributes ---");
const dynamicImage = document.getElementById('dynamic-image');
const changeImageButton = document.getElementById('change-image-button');

if (dynamicImage && changeImageButton) {
    changeImageButton.addEventListener('click', () => {
        // getAttribute
        const currentSrc = dynamicImage.getAttribute('src');
        console.log("Current image src:", currentSrc);

        // setAttribute
        dynamicImage.setAttribute('src', 'https://picsum.photos/200/300');
        dynamicImage.setAttribute('alt', 'Changed Placeholder Image');
        console.log("Image src and alt attributes changed.");
    });
}


// --- 4. Modifying Styles (Inline) & ClassList ---
console.log("\n--- 4. Modifying Styles & ClassList ---");
const addClassBtn = document.getElementById('add-class-button');
const removeClassBtn = document.getElementById('remove-class-button');
const toggleClassBtn = document.getElementById('toggle-class-button');
const changeStyleBtn = document.getElementById('change-style-button');
const resetStyleBtn = document.getElementById('reset-style-button');

// Change single style property directly (inline style)
if (changeStyleBtn && firstBox) {
    changeStyleBtn.addEventListener('click', () => {
        firstBox.style.backgroundColor = '#ccffcc'; // Light green
        firstBox.style.border = '2px dashed #008000';
        firstBox.style.padding = '25px';
        console.log("First box style changed directly.");
    });
}
if (resetStyleBtn && firstBox) {
    resetStyleBtn.addEventListener('click', () => {
        firstBox.style.backgroundColor = ''; // Reset to default (from CSS)
        firstBox.style.border = '';
        firstBox.style.padding = '';
        console.log("First box style reset.");
    });
}

// Manipulating CSS Classes (Preferred way for styling)
if (addClassBtn && myParagraph) {
    addClassBtn.addEventListener('click', () => {
        myParagraph.classList.add('highlight');
        console.log("Added 'highlight' class to paragraph.");
    });
}
if (removeClassBtn && myParagraph) {
    removeClassBtn.addEventListener('click', () => {
        myParagraph.classList.remove('highlight');
        console.log("Removed 'highlight' class from paragraph.");
    });
}
if (toggleClassBtn && myParagraph) {
    toggleClassBtn.addEventListener('click', () => {
        myParagraph.classList.toggle('highlight');
        console.log("Toggled 'highlight' class on paragraph.");
        if (myParagraph.classList.contains('highlight')) {
            console.log("Paragraph now HAS 'highlight' class.");
        } else {
            console.log("Paragraph now DOES NOT HAVE 'highlight' class.");
        }
    });
}


// --- 5. Creating & Adding/Removing Elements ---
console.log("\n--- 5. Creating & Adding/Removing Elements ---");

const createItemBtn = document.getElementById('create-element-button');
const removeLastItemBtn = document.getElementById('remove-last-item-button');
const itemList = document.getElementById('item-list');
let itemCounter = 2; // Start from 2 as Item 1 and Item 2 are in HTML

if (createItemBtn && itemList) {
    createItemBtn.addEventListener('click', () => {
        itemCounter++;
        // Create new list item element
        const newLi = document.createElement('li');
        // Set its text content using a template literal
        newLi.textContent = `Dynamically added Item ${itemCounter}`;
        // You could also add classes or styles here if needed
        // newLi.classList.add('new-item');

        // Append the new item to the unordered list
        itemList.appendChild(newLi);
        console.log("New list item added:", newLi);
    });
}

if (removeLastItemBtn && itemList) {
    removeLastItemBtn.addEventListener('click', () => {
        // Check if there are any list items to remove
        if (itemList.lastElementChild) { // Use lastElementChild for the last <li>
            const removedItem = itemList.lastElementChild;
            itemList.removeChild(removedItem); // Remove the element
            console.log("Removed last list item:", removedItem.textContent);
        } else {
            console.warn("No more items to remove!");
        }
    });
}

// A more advanced example: creating multiple elements and appending
// Not tied to a button, just for demonstration
const messageContainer = document.createElement('div');
messageContainer.id = 'dynamic-message';
document.body.appendChild(messageContainer); // Append to body or another container

function showMessage(type, text) {
    messageContainer.innerHTML = ''; // Clear previous messages
    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.classList.add(type); // 'success' or 'error' class
    messageContainer.appendChild(messageElement);
}

setTimeout(() => showMessage('success', 'Operation completed successfully!'), 2000);
setTimeout(() => showMessage('error', 'An error occurred!'), 5000);