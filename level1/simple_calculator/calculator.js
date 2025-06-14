function calculate() {
    // Get user input
    // By default, the value retrieved from an HTML input element is a string
    let num1 = parseFloat(document.getElementById('num1').value);
    let num2 = parseFloat(document.getElementById('num2').value);
    let operation = document.getElementById('operation').value;

    let result;

    // Perform the calculation
    if (operation === "add") {
        result = num1 + num2;
    } else if (operation === "subtract") {
        result = num1 - num2;
    } else if (operation === "multiply") {
        result = num1 * num2;
    } else if (operation === "divide") {
        result = num1 / num2;
    } else {
        result = "Invalid operation";
    }

    // Display the result
    document.getElementById('result').textContent = "Result: " + result;
}
