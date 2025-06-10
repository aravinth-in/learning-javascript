"use strict";

console.log("--- Simple Drawing App ---");

const canvas = document.getElementById('drawingCanvas');
// The getContext() method returns the drawing context on the canvas
// '2d' means we're drawing in 2D space.
const ctx = canvas.getContext('2d');

// Get references to controls
const colorPalette = document.getElementById('colorPalette');
const lineWidthInput = document.getElementById('lineWidth');
const lineWidthValueSpan = document.getElementById('lineWidthValue');
const clearCanvasButton = document.getElementById('clearCanvas');
const saveImageButton = document.getElementById('saveImage');
const undoButton = document.getElementById('undoButton');
const redoButton = document.getElementById('redoButton');
const penButton = document.getElementById('penButton');
const eraserButton = document.getElementById('eraserButton');
const rectButton = document.getElementById('rectButton');
const lineButton = document.getElementById('lineButton');

let drawingColor = '#000000'; // Default to black for consistency
let drawingWidth = parseInt(lineWidthInput.value); // Ensure it's a number

let isDrawing = false;
let lastX = 0;         // Last X coordinate of the mouse
let lastY = 0;         // Last Y coordinate of the mouse

// Variables to store the starting point for shapes
let startX = 0;
let startY = 0;

let currentTool = 'pen'; // Default tool
let drawingHistory = [];
let redoHistory = [];
let currentStroke = null;

const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
    '#808080', // Gray
    '#00FFFF', // Cyan
    '#FF00FF'  // Magenta
];

// Redraws the entire canvas from drawingHistory ---
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set composite operation to source-over for consistent redrawing
    // This is crucial: we redraw everything as if it's new content,
    // and "erasing" is done by drawing with the background color.
    ctx.globalCompositeOperation = 'source-over';

    drawingHistory.forEach(stroke => {
        ctx.save();

        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.color;
        ctx.save(); // Save the current canvas context state for this stroke

        // Apply properties specific to this stroke for redrawing
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.color;

        // --- NEW/MODIFIED: Tool-specific line styles and fill handling for redrawing ---
        if (stroke.tool === 'eraser') {
            ctx.strokeStyle = '#ffffff'; // Draw eraser strokes with background color
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        } else if (stroke.tool === 'pen') {
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        } else if (stroke.tool === 'rectangle') {
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'butt';   // Ends at the exact endpoint
            ctx.fillStyle = 'transparent';
        } else if (stroke.tool === 'line') {
            ctx.lineJoin = 'round'; // Lines often look good with rounded ends/joins
            ctx.lineCap = 'round';
        }

        ctx.beginPath();
        if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
            if (stroke.points.length > 0) {
                ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                for (let i = 1; i < stroke.points.length; i++) {
                    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                }
            }
        } else if (stroke.tool === 'rectangle') {
            ctx.rect(stroke.x, stroke.y, stroke.rectWidth, stroke.rectHeight);
        } else if (stroke.tool === 'line') {
            ctx.moveTo(stroke.x1, stroke.y1);
            ctx.lineTo(stroke.x2, stroke.y2);
        }
        ctx.stroke(); // Render the outline of the stroke/shape

        ctx.restore(); // Restore the canvas context state to before this stroke was drawn
    });

    setActiveTool(currentTool); // This will re-apply the correct strokeStyle, lineWidth, and globalCompositeOperation
}

function saveDrawingToLocalStorage() {
    try {
        localStorage.setItem('drawingData', JSON.stringify(drawingHistory));
        console.log("Drawing saved to local storage.");
    } catch (e) {
        console.error("Error saving drawing to local storage:", e);
        alert("Could not save drawing. Local storage might be full or blocked.");
    }
}

function loadDrawingFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('drawingData');
        if (savedData) {
            drawingHistory = JSON.parse(savedData);
            console.log("Drawing loaded from local storage.");
            redoHistory = []; // Clear redo history on load to prevent inconsistencies
            redrawCanvas();
        } else {
            console.log("No saved drawing found in local storage.");
            drawingHistory = [];
            redoHistory = [];
        }
    } catch (e) {
        console.error("Error loading drawing from local storage:", e);
        localStorage.removeItem('drawingData');
        drawingHistory = [];
        redoHistory = [];
        alert("Could not load drawing. Saved data might be corrupt and was cleared.");
    }
}

function addStrokeToHistory(stroke) {
    drawingHistory.push(stroke);
    redoHistory = []; // Clear redo history whenever a new stroke is drawn
    saveDrawingToLocalStorage();
}

function undo() {
    if (drawingHistory.length > 0) {
        const undoneStroke = drawingHistory.pop();
        redoHistory.push(undoneStroke);
        saveDrawingToLocalStorage();
        redrawCanvas();
        console.log("Undo performed.");
    } else {
        console.log("Nothing to undo.");
    }
}

function redo() {
    if (redoHistory.length > 0) {
        const redoneStroke = redoHistory.pop();
        drawingHistory.push(redoneStroke);
        saveDrawingToLocalStorage();
        redrawCanvas();
        console.log("Redo performed.");
    } else {
        console.log("Nothing to redo.");
    }
}

function setActiveTool(toolName) {
    currentTool = toolName;
    console.log(`Tool set to: ${currentTool}`);

    // Update button styling - remove from all, add to active
    const toolButtons = [penButton, eraserButton, rectButton, lineButton];
    toolButtons.forEach(button => button.classList.remove('active-tool'));
    document.getElementById(`${toolName}Button`)?.classList.add('active-tool');

    // Adjust context properties based on tool
    if (currentTool === 'pen' || currentTool === 'rectangle' || currentTool === 'line') { // Shapes also use normal drawing
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawingColor; // Set stroke style to current drawing color
        ctx.fillStyle = 'transparent';
    } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#ffffff'; // The actual color doesn't matter for destination-out, but setting it to background can help
        ctx.fillStyle = 'transparent';
    }

    // Set line specific properties for live drawing
    ctx.lineWidth = drawingWidth;
    if (currentTool === 'pen' || currentTool === 'eraser' || currentTool === 'line') {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    } else if (currentTool === 'rectangle') {
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'butt';
    }

    // Adjust cursor based on tool
    canvas.style.cursor = ['pen', 'rectangle', 'line'].includes(toolName) ? 'crosshair' : 'cell';
}

// Dynamically generate color swatches
function generateColorPalette() {
    colorPalette.innerHTML = ''; // Clear existing swatches
    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color; // Store the color value for easy retrieval
        colorPalette.appendChild(swatch);
    });

    // Set initial active color (e.g., black)
    const initialSwatch = colorPalette.querySelector(`[data-color="${drawingColor}"]`);
    if (initialSwatch) {
        initialSwatch.classList.add('active');
    }
}

// Update line width display when slider moves
lineWidthInput.addEventListener('input', () => {
    drawingWidth = parseInt(lineWidthInput.value);
    lineWidthValueSpan.textContent = drawingWidth;
    ctx.lineWidth = drawingWidth;
});


colorPalette.addEventListener('click', (e) => {
    const clickedSwatch = e.target.closest('.color-swatch');
    if (clickedSwatch) {
        // Remove 'active' class from all swatches
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('active');
        });

        // Add 'active' class to the clicked swatch
        clickedSwatch.classList.add('active');

        // Update drawingColor and context strokeStyle
        drawingColor = clickedSwatch.dataset.color;
        if (currentTool !== 'eraser') { // Only update if not on eraser tool
            ctx.strokeStyle = drawingColor;
        }
        console.log(`Drawing Color changed to: ${drawingColor}`);
    }
});

// Clear canvas button event
clearCanvasButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory = [];
    redoHistory = [];
    saveDrawingToLocalStorage();
    console.log("Canvas and drawing history cleared!");
});

saveImageButton.addEventListener('click', () => {
    // Before saving, ensure composite operation is source-over for correct image generation
    const originalCompositeOperation = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'source-over';

    // 1. Get the image data URL from the canvas
    // 'image/png' is default. Can also be 'image/jpeg' with quality (e.g., 0.9)
    const dataURL = canvas.toDataURL('image/png');
    console.log("Canvas image data URL created:", dataURL);

    // Restore original composite operation
    ctx.globalCompositeOperation = originalCompositeOperation;

    // 2. Create a temporary anchor (<a>) element
    const a = document.createElement('a');

    // 3. Set the href to the data URL
    a.href = dataURL;

    // 4. Set the download attribute with a desired filename
    // You can dynamically create a filename, e.g., using current date
    const now = new Date();
    const filename = `drawing-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.png`;
    a.download = filename;

    // 5. Programmatically click the anchor element to trigger the download
    document.body.appendChild(a); // Append to body (required for Firefox, though often not visible)
    a.click(); // Simulate a click
    document.body.removeChild(a); // Clean up the temporary element
    console.log("Drawing downloaded as:", filename);
});

undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);
penButton.addEventListener('click', () => setActiveTool('pen'));
eraserButton.addEventListener('click', () => setActiveTool('eraser'));
rectButton.addEventListener('click', () => setActiveTool('rectangle'));
lineButton.addEventListener('click', () => setActiveTool('line'));

// ===============================================
// Core Drawing Logic (Next Step!)
// ===============================================

// Event listeners for drawing
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    startX = e.offsetX; // Store initial point for shapes
    startY = e.offsetY;

    // Update lastX and lastY to the current mouse position
    // offsetLeft/Top gets the canvas position relative to the document
    // e.clientX/Y gets the mouse position relative to the viewport
    lastX = e.offsetX; // Alternative: e.clientX - canvas.offsetLeft;
    lastY = e.offsetY; // Alternative: e.clientY - canvas.offsetTop;

    // Set context properties for live drawing at start of new stroke/shape
    // This is crucial to ensure correct behavior from the very first mousemove
    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#ffffff';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.fillStyle = 'transparent';
    } else if (currentTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawingColor;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.fillStyle = 'transparent';
    } else { // Shapes: 'rectangle', 'line'
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawingColor;
        ctx.fillStyle = 'transparent';
        if (currentTool === 'rectangle') {
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'butt';
        } else if (currentTool === 'line') {
            ctx.lineJoin = 'round'; // Lines often look good with rounded ends/joins
            ctx.lineCap = 'round';
        }
    }

    ctx.lineWidth = drawingWidth;

    // For freehand drawing, immediately begin path
    if (currentTool === 'pen' || currentTool === 'eraser') {
        currentStroke = {
            color: drawingColor,
            width: drawingWidth,
            tool: currentTool,
            points: [{ x: lastX, y: lastY }] // Start with first point
        };
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }
    console.log(`Drawing started at (${startX}, ${startY}) for tool: ${currentTool}`);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return; // Stop the function from running if not drawing

    // No need to set ctx.globalCompositeOperation here repeatedly,
    // it's set once in mousedown and setActiveTool.
    // However, if the tool changes *during* a draw (which shouldn't happen with button clicks),
    // this would be needed. For now, it's fine.

    const currentX = e.offsetX; // Alternative: e.clientX - canvas.offsetLeft;
    const currentY = e.offsetY; // Alternative: e.clientY - canvas.offsetTop;

    if (currentTool === 'pen' || currentTool === 'eraser') {
        // Freehand/Eraser: continue path
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        currentStroke.points.push({ x: currentX, y: currentY });

    } else if (currentTool === 'rectangle') {
        // Rectangle: Clear and redraw history, then draw temporary rectangle
        redrawCanvas(); // Clear canvas and redraw history
        ctx.beginPath();
        ctx.rect(startX, startY, currentX - startX, currentY - startY);
        ctx.stroke();

    } else if (currentTool === 'line') {
        // Straight Line: Clear and redraw history, then draw temporary line
        redrawCanvas();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    }

    // Update last position for next freehand segment (or next shape preview)
    lastX = currentX;
    lastY = currentY;
});

const endDrawing = () => {
    if (!isDrawing) return;

    const currentX = lastX;
    const currentY = lastY;

    if (currentTool === 'pen' || currentTool === 'eraser') {
        // For freehand/eraser, currentStroke is already populated in mousemove
        if (currentStroke && currentStroke.points.length > 1) { // Ensure it's a line, not just a click
            addStrokeToHistory(currentStroke);
        }
    } else if (currentTool === 'rectangle') {
        // For rectangle, create the stroke object based on start and end points
        const calculatedRectWidth = currentX - startX;
        const calculatedRectHeight = currentY - startY;
        currentStroke = {
            tool: 'rectangle',
            color: drawingColor,
            width: drawingWidth, // This is the line thickness for the rectangle's border
            x: startX,
            y: startY,
            rectWidth: calculatedRectWidth,
            rectHeight: calculatedRectHeight
        };
        addStrokeToHistory(currentStroke);
    } else if (currentTool === 'line') {
        // For line, create the stroke object based on start and end points
        currentStroke = {
            tool: 'line',
            color: drawingColor,
            width: drawingWidth,
            x1: startX,
            y1: startY,
            x2: currentX,
            y2: currentY
        };
        addStrokeToHistory(currentStroke);
    }

    isDrawing = false;
    currentStroke = null;
    redrawCanvas();
    console.log("Drawing ended.");

    // Ensure globalCompositeOperation matches current tool for *next* potential stroke
    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }
};


canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseout', endDrawing); // Stop drawing if mouse leaves canvas

// Call loadDrawingFromLocalStorage when the script loads (on page refresh/initial visit)
loadDrawingFromLocalStorage();
setActiveTool(currentTool);
generateColorPalette();