// Example of var
function exampleVar() {
    var x = 10;
    if (true) {
        var x = 20; // Same variable, function-scoped
        console.log(x); // 20
    }
    console.log(x); // 20
}

// Example of let
function exampleLet() {
    let y = 10;
    if (true) {
        let y = 20; // Different variable, block-scoped
        console.log(y); // 20
    }
    console.log(y); // 10
}

// Example of const
function exampleConst() {
    const z = 10;
    console.log(z); // 10

    // z = 20; // Error: Assignment to constant variable

    const obj = { a: 1 };
    obj.a = 2; // Allowed: modifying properties of an object
    console.log(obj.a); // 2
}

// Call the functions to see the output
exampleVar();
exampleLet();
exampleConst();