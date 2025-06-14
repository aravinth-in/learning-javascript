// Ensure strict mode for cleaner code and error checking
"use strict";

console.log("--- E-commerce Product Catalog Application ---");

// ==========================================================
// 1. Product Class
//    Demonstrates: ES6 Classes, Encapsulation (Private Fields), Static Methods
// ==========================================================
class Product {
    #stock; // Private field for stock, ensures it's only modified via methods
    static #nextId = 1; // Private static field for generating unique IDs

    constructor(name, price, category, initialStock, imageUrl = 'https://via.placeholder.com/150') {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error("Product name must be a non-empty string.");
        }
        if (typeof price !== 'number' || price <= 0) {
            throw new Error("Product price must be a positive number.");
        }
        if (typeof initialStock !== 'number' || initialStock < 0) {
            throw new Error("Initial stock must be a non-negative number.");
        }
        if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
            throw new Error("Product image URL must be a non-empty string.");
        }

        this.id = Product.#generateId(); // Use static method to assign unique ID
        this.name = name.trim();
        this.price = price;
        this.category = category;
        this.#stock = initialStock; // Initialize private stock
        this.imageUrl = imageUrl.trim(); // Store image URL
    }

    // Public method to get current stock (read-only access to private field)
    getStock() {
        return this.#stock;
    }

    // Public method to check if product is available
    isAvailable() {
        return this.#stock > 0;
    }

    // Public method to decrease stock (encapsulated logic)
    decreaseStock(quantity) {
        if (typeof quantity !== 'number' || quantity <= 0) {
            console.warn(`Attempted to decrease stock by invalid quantity: ${quantity}`);
            return false;
        }
        if (this.#stock >= quantity) {
            this.#stock -= quantity;
            console.log(`${this.name}: Stock decreased by ${quantity}. New stock: ${this.#stock}`);
            return true;
        } else {
            console.warn(`Not enough stock for ${this.name}. Available: ${this.#stock}, Requested: ${quantity}`);
            return false;
        }
    }

    // Public method to increase stock (encapsulated logic)
    increaseStock(quantity) {
        if (typeof quantity !== 'number' || quantity <= 0) {
            console.warn(`Attempted to increase stock by invalid quantity: ${quantity}`);
            return false;
        }
        this.#stock += quantity;
        console.log(`${this.name}: Stock increased by ${quantity}. New stock: ${this.#stock}`);
        return true;
    }

    // Static method: Belongs to the Product class, not an instance
    // Demonstrates: Static Methods
    static #generateId() {
        // Simple incremental ID for now
        return `prod_${Product.#nextId++}`;
    }

    // Static method to validate a price
    static isValidPrice(price) {
        return typeof price === 'number' && price > 0;
    }
}

// ==========================================================
// 2. Specialized Product Classes (Inheritance)
//    Demonstrates: Class Inheritance (extends, super)
// ==========================================================

class ElectronicsProduct extends Product {
    constructor(name, price, initialStock, warrantyMonths, imageUrl) {
        super(name, price, "Electronics", initialStock, imageUrl); // Call parent constructor
        this.warrantyMonths = warrantyMonths;
    }

    getWarrantyInfo() {
        return `${this.name} comes with a ${this.warrantyMonths}-month warranty.`;
    }
}

class BookProduct extends Product {
    constructor(name, price, initialStock, author, isbn, imageUrl) {
        super(name, price, "Books", initialStock, imageUrl); // Call parent constructor
        this.author = author;
        this.isbn = isbn;
    }

    getBookInfo() {
        return `${this.name} by ${this.author} (ISBN: ${this.isbn})`;
    }
}

// ==========================================================
// 3. ShoppingCart Class
//    Demonstrates: ES6 Classes, Encapsulation (Private Fields), Higher-Order Functions
// ==========================================================
class ShoppingCart {
    #items = []; // Private array to store cart items { product: Product, quantity: number }
    #discountApplied = null; // Stores the discount function to apply, or null if none
    #discountAmount = 0; // Stores the calculated discount amount for display

    constructor() {
        this.#renderCart(); // Initial render for an empty cart
    }

    // Public method to add an item to the cart
    addItem(product, quantity = 1) {
        if (!(product instanceof Product)) {
            console.error("Attempted to add non-Product item to cart.");
            return;
        }
        if (typeof quantity !== 'number' || quantity <= 0) {
            console.warn("Invalid quantity for adding item.");
            return;
        }
        if (!product.isAvailable() || product.getStock() < quantity) {
            console.warn(`Cannot add ${product.name}: Not enough stock available.`);
            return;
        }

        const existingItem = this.#items.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
            console.log(`Increased quantity of ${product.name} to ${existingItem.quantity}.`);
        } else {
            this.#items.push({ product, quantity });
            console.log(`Added ${quantity} x ${product.name} to cart.`);
        }
        product.decreaseStock(quantity); // Decrease product stock when added to cart
        this.#recalculateDiscount(); // Recalculate discount if items change
        this.#renderCart(); // Re-render cart after modification
    }

    // Public method to update item quantity in cart
    updateItemQuantity(productId, newQuantity) {
        const item = this.#items.find(item => item.product.id === productId);

        if (!item) {
            console.warn(`Item with ID ${productId} not found in cart.`);
            return false;
        }

        if (typeof newQuantity !== 'number' || newQuantity < 0) {
            console.warn("Invalid quantity for updating item.");
            return false;
        }

        const quantityChange = newQuantity - item.quantity;

        if (quantityChange > 0) { // Increasing quantity
            if (item.product.getStock() >= quantityChange) {
                item.quantity = newQuantity;
                item.product.decreaseStock(quantityChange);
                console.log(`Updated quantity of ${item.product.name} to ${newQuantity}.`);
            } else {
                console.warn(`Not enough stock to increase ${item.product.name} to ${newQuantity}.`);
                return false;
            }
        } else if (quantityChange < 0) { // Decreasing quantity
            item.quantity = newQuantity;
            item.product.increaseStock(Math.abs(quantityChange));
            console.log(`Updated quantity of ${item.product.name} to ${newQuantity}.`);
        }

        if (item.quantity === 0) {
            this.removeItem(productId); // Remove item if quantity becomes 0
        } else {
            this.#recalculateDiscount();
            this.#renderCart();
        }
        return true;
    }

    // Public method to remove an item from the cart
    removeItem(productId) {
        const index = this.#items.findIndex(item => item.product.id === productId);

        if (index > -1) {
            const removedItem = this.#items.splice(index, 1)[0];
            removedItem.product.increaseStock(removedItem.quantity); // Return stock
            console.log(`Removed ${removedItem.quantity} x ${removedItem.product.name} from cart.`);
            this.#recalculateDiscount();
            this.#renderCart(); // Re-render cart after modification
            renderProducts();
            return true;
        } else {
            console.warn(`Item with ID ${productId} not found in cart.`);
            return false;
        }
    }

    // Public method to get a copy of cart items
    getCartItems() {
        // Return a copy to prevent external modification of the private #items array
        return [...this.#items];
    }

    // Public method to calculate the subtotal before discount
    // Demonstrates: Higher-Order Function (reduce)
    getSubtotalPrice() {
        return this.#items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    // Public method to get the total price after discount
    // Demonstrates: Higher-Order Function (reduce), and applying a Closure for discount
    getTotalPrice() {
        const subtotal = this.getSubtotalPrice();
        if (this.#discountApplied) {
            const discountedPrice = this.#discountApplied(subtotal);
            this.#discountAmount = subtotal - discountedPrice; // Store discount for display
            return discountedPrice;
        }
        this.#discountAmount = 0; // No discount
        return subtotal;
    }

    // Public method to apply a discount
    // Demonstrates: Setting a private closure-based function
    applyDiscount(discountFunction) {
        if (typeof discountFunction === 'function') {
            this.#discountApplied = discountFunction;
            this.#recalculateDiscount(); // Update discount immediately
            this.#renderCart();
            return true;
        } else {
            console.warn("Invalid discount function provided.");
            return false;
        }
    }

    // Public method to remove any applied discount
    removeDiscount() {
        this.#discountApplied = null;
        this.#discountAmount = 0;
        this.#renderCart();
        console.log("Discount removed.");
    }

    // Private method to recalculate discount amount when cart changes
    #recalculateDiscount() {
        this.getTotalPrice(); // Calling this will update #discountAmount if a discount is applied
    }

    // Public method to clear the entire cart
    clearCart() {
        this.#items.forEach(item => item.product.increaseStock(item.quantity)); // Return all stock
        this.#items = [];
        this.removeDiscount(); // Also remove any applied discount
        console.log("Cart cleared.");
        this.#renderCart(); // Re-render cart after modification
    }

    // ==========================================================
    // UI Rendering Logic (Private Method - internal to cart class)
    // ==========================================================
    #renderCart() {
        const cartItemsElement = document.getElementById('cartItems');
        const cartTotalElement = document.querySelector('#cartTotal .total-price');
        const discountedTotalDiv = document.getElementById('discountedTotal');
        const discountedPriceSpan = document.querySelector('#discountedTotal .discounted-price');
        
        cartItemsElement.innerHTML = ''; // Clear current cart display

        if (this.#items.length === 0) {
            cartItemsElement.innerHTML = '<li>Your cart is empty.</li>';
        } else {
            this.#items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-info">
                        <span>${item.product.name}</span>
                        <small>($${item.product.price.toFixed(2)} x ${item.quantity})</small>
                    </div>
                    <div>
                        <button class="quantity-btn minus" data-product-id="${item.product.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-product-id="${item.product.id}">+</button>
                    </div>
                    <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-from-cart" data-product-id="${item.product.id}">Remove</button>
                `;

                // Add event listener to the "Remove" button
                // Demonstrates: Callback Functions, 'this' context (implicitly handled by arrow function if `this` was in the outer scope)
                // However, `removeButton` is local, so no `this` binding issue here.
                const removeButton = li.querySelector('.remove-from-cart');
                removeButton.addEventListener('click', (event) => {
                    this.removeItem(event.target.dataset.productId); // Call public removeItem method
                    renderProducts(); // Re-render products to update stock display
                });

                const plusButton = li.querySelector('.quantity-btn.plus');
                plusButton.addEventListener('click', (event) => {
                    const productId = event.target.dataset.productId;
                    const currentItem = this.#items.find(i => i.product.id === productId);
                    if (currentItem) {
                        this.updateItemQuantity(productId, currentItem.quantity + 1);
                        renderProducts(); // Re-render products to update stock display
                    }
                });

                const minusButton = li.querySelector('.quantity-btn.minus');
                minusButton.addEventListener('click', (event) => {
                    const productId = event.target.dataset.productId;
                    const currentItem = this.#items.find(i => i.product.id === productId);
                    if (currentItem && currentItem.quantity > 0) { // Prevent negative quantity
                        this.updateItemQuantity(productId, currentItem.quantity - 1);
                        renderProducts(); // Re-render products to update stock display
                    }
                });

                cartItemsElement.appendChild(li);
            });
        }

        cartTotalElement.textContent = `$${this.getSubtotalPrice().toFixed(2)}`;

        // Update discounted total display
        if (this.#discountApplied && this.#discountAmount > 0) {
            discountedTotalDiv.style.display = 'flex'; // Show the discounted total row
            discountedPriceSpan.textContent = `$${this.getTotalPrice().toFixed(2)}`; // Get actual total after discount
        } else {
            discountedTotalDiv.style.display = 'none'; // Hide if no discount
        }
    }
}


// ==========================================================
// 4. Wishlist Class (NEW!)
//    Demonstrates: ES6 Classes, Encapsulation (Private Fields)
// ==========================================================
class Wishlist {
    #items = []; // Private array to store wishlist items (Product objects)

    constructor() {
        this.#renderWishlist(); // Initial render for an empty wishlist
    }

    // Public method to add a product to the wishlist
    addItem(product) {
        if (!(product instanceof Product)) {
            console.error("Attempted to add non-Product item to wishlist.");
            return false;
        }
        if (!this.#items.find(item => item.id === product.id)) {
            this.#items.push(product);
            console.log(`Added ${product.name} to wishlist.`);
            this.#renderWishlist();
            return true;
        } else {
            console.warn(`${product.name} is already in the wishlist.`);
            return false;
        }
    }

    // Public method to remove a product from the wishlist
    removeItem(productId) {
        const initialLength = this.#items.length;
        this.#items = this.#items.filter(item => item.id !== productId);
        if (this.#items.length < initialLength) {
            console.log(`Removed product with ID ${productId} from wishlist.`);
            this.#renderWishlist();
            return true;
        } else {
            console.warn(`Product with ID ${productId} not found in wishlist.`);
            return false;
        }
    }

    // Public method to get a copy of wishlist items
    getWishlistItems() {
        return [...this.#items];
    }

    // Public method to check if a product is in the wishlist
    isProductInWishlist(productId) {
        return this.#items.some(item => item.id === productId);
    }

    // Private method to render the wishlist UI
    #renderWishlist() {
        const wishlistItemsElement = document.getElementById('wishlistItems');
        wishlistItemsElement.innerHTML = ''; // Clear current wishlist display

        if (this.#items.length === 0) {
            wishlistItemsElement.innerHTML = '<li>Your wishlist is empty.</li>';
        } else {
            this.#items.forEach(product => {
                const li = document.createElement('li');
                li.className = 'wishlist-item';
                li.innerHTML = `
                    <div class="wishlist-item-info">
                        <span>${product.name}</span>
                        <small>($${product.price.toFixed(2)})</small>
                    </div>
                    <div>
                        <button class="add-to-cart-from-wishlist" data-product-id="${product.id}"
                                ${!product.isAvailable() ? 'disabled' : ''}>
                            ${product.isAvailable() ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button class="remove-from-wishlist" data-product-id="${product.id}">Remove</button>
                    </div>
                `;

                // Event listener to add from wishlist to cart
                const addToCartBtn = li.querySelector('.add-to-cart-from-wishlist');
                addToCartBtn.addEventListener('click', (event) => {
                    const productId = event.target.dataset.productId;
                    const productToAdd = products.find(p => p.id === productId); // Find from main products list
                    if (productToAdd && productToAdd.isAvailable()) {
                        myCart.addItem(productToAdd, 1); // Add to cart
                        this.removeItem(productId); // Remove from wishlist after adding to cart
                        renderProducts(); // Update product grid (stock/button state)
                    } else {
                        alert(`${productToAdd.name} is out of stock!`);
                    }
                });

                // Event listener to remove from wishlist
                const removeBtn = li.querySelector('.remove-from-wishlist');
                removeBtn.addEventListener('click', (event) => {
                    myWishlist.removeItem(event.target.dataset.productId);
                });

                wishlistItemsElement.appendChild(li);
            });
        }
    }
}


// ==========================================================
// 5. Discount Functions (Closures & Potential for Currying)
// ==========================================================

// This is a Higher-Order Function that RETURNS another function (a Closure).
// The returned function "remembers" the 'percentage' value.
function createPercentageDiscount(percentage) {
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
        throw new Error("Percentage must be between 0 and 100.");
    }
    const discountFactor = 1 - (percentage / 100); // Remember this
    return function(price) { // This is the closure
        return price * discountFactor;
    };
}

// This is a Higher-Order Function for a fixed amount discount.
// It returns a closure that remembers the fixed amount.
function createFixedDiscount(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
        throw new Error("Fixed discount amount must be positive.");
    }
    return function(price) { // This is the closure
        return Math.max(0, price - amount); // Ensure price doesn't go below zero
    };
}

// Example of a Curried discount (more advanced, can be composed)
// This function returns a function that returns a function...
function createMinPurchaseDiscount(minPurchase) {
    return function(discountFunction) { // This part takes the actual discount logic
        return function(price) { // This is the final closure
            if (price >= minPurchase) {
                return discountFunction(price);
            }
            return price; // No discount if minimum not met
        };
    };
}


// Predefined discount codes (could come from a backend)
// Demonstrates: Using Closures to store specific discount logic
const discountCodes = {
    "SAVE10": createPercentageDiscount(10),   // 10% off
    "BIGSAVE20": createPercentageDiscount(20), // 20% off
    "FLAT50": createMinPurchaseDiscount(1000)(createFixedDiscount(50)), // $50 off
    "MIN100GET20": createMinPurchaseDiscount(100)(createFixedDiscount(20)) // $20 off if over $100
};

// ==========================================================
// 6. Initial Product Data & Application Setup
// ==========================================================

// Create instances of our Product classes
const products = [
    new Product("Laptop Pro", 1200.00, "Computers", 10, "img/laptop.jpg"),
    new ElectronicsProduct("Wireless Mouse", 25.50, 50, 12, "img/wireless_mouse.webp"),
    new Product("Mechanical Keyboard", 75.00, "Computers", 20, "img/mechanical_keyboard.webp"),
    new BookProduct("The JavaScript Way", 35.00, 15, "Marijn Haverbeke", "978-0134682334", "img/javascript.jpg"),
    new Product("Smart Speaker", 99.99, "Audio", 30, "img/smart_speaker.webp"),
    new BookProduct("Clean Code", 45.00, 8, "Robert C. Martin", "978-0132350884", "img/clean_code.jpeg"),
    new ElectronicsProduct("4K Monitor", 300.00, 5, 24, "img/monitor.jpg"),
    new Product("Webcam HD", 49.99, "Accessories", 25, "img/webcam.webp"),
    new BookProduct("Designing Data-Intensive Applications", 55.00, 12, "Martin Kleppmann", "978-1449373320", "img/design_data_book.webp")
];



const myCart = new ShoppingCart(); // Create a single instance of our ShoppingCart
const myWishlist = new Wishlist(); // Wishlist instance

// ==========================================================
// 7. UI Rendering & Event Handling (Application Logic)
// ==========================================================

const productGrid = document.getElementById('productGrid');
const categoryFilter = document.getElementById('categoryFilter');
const searchProductsInput = document.getElementById('searchProducts');
const sortProductsDropdown = document.getElementById('sortProducts');
const clearCartButton = document.getElementById('clearCartButton');
const checkoutButton = document.getElementById('checkoutButton');

const couponCodeInput = document.getElementById('couponCode');
const applyCouponButton = document.getElementById('applyCouponButton');
const discountMessage = document.getElementById('discountMessage');

// Function to render products into the grid
// Demonstrates: Higher-Order Functions (forEach, map), DOM manipulation
function renderProducts(filteredProducts = products) {
    productGrid.innerHTML = ''; // Clear existing products

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" title="${product.name}">
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            ${product instanceof BookProduct ? `<p>Author: ${product.author}</p>` : ''}
            ${product instanceof ElectronicsProduct ? `<p>Warranty: ${product.warrantyMonths} months</p>` : ''}
            <p class="price">$${product.price.toFixed(2)}</p>
            <p>Stock: ${product.getStock()}</p>
            <div class="actions">
                <button class="add-to-cart" data-product-id="${product.id}"
                        ${!product.isAvailable() ? 'disabled' : ''}>
                    ${product.isAvailable() ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button class="add-to-wishlist" data-product-id="${product.id}"
                        ${myWishlist.isProductInWishlist(product.id) ? 'disabled class="add-to-wishlist added"' : ''}>
                    ${myWishlist.isProductInWishlist(product.id) ? 'Added to Wishlist' : 'Add to Wishlist'}
                </button>
            </div>
        `;

        // Add event listener to the "Add to Cart" button
        // Demonstrates: Callback Functions, Event Delegation (or direct binding)
        const addButton = productCard.querySelector('.add-to-cart');
        if (addButton) {
            addButton.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const productToAdd = products.find(p => p.id === productId);
                if (productToAdd) {
                    myCart.addItem(productToAdd, 1);
                    // Update button state (disabled/text) immediately if stock runs out
                    event.target.disabled = !productToAdd.isAvailable();
                    event.target.textContent = productToAdd.isAvailable() ? 'Add to Cart' : 'Out of Stock';
                    // Also update stock display on the card
                    const stockDisplay = event.target.previousElementSibling; // Assuming <p>Stock:...</p> is just before button
                    if (stockDisplay && stockDisplay.textContent.startsWith('Stock:')) {
                         stockDisplay.textContent = `Stock: ${productToAdd.getStock()}`;
                    }
                    // If product was in wishlist, and is now added to cart, refresh wishlist state
                    if (myWishlist.isProductInWishlist(productId)) {
                        myWishlist.removeItem(productId); // Remove from wishlist if added to cart from product grid
                    }
                }
            });
        }

        const addWishlistButton = productCard.querySelector('.add-to-wishlist');
        if (addWishlistButton) {
            addWishlistButton.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const productToAdd = products.find(p => p.id === productId);
                if (productToAdd) {
                    if (myWishlist.isProductInWishlist(productId)) {
                        myWishlist.removeItem(productId); // If already in, remove it
                        event.target.textContent = 'Add to Wishlist';
                        event.target.classList.remove('added');
                    } else {
                        myWishlist.addItem(productToAdd); // Add to wishlist
                        event.target.textContent = 'Added to Wishlist';
                        event.target.classList.add('added');
                    }
                }
            });
        }

        productGrid.appendChild(productCard);
    });
}

// Populate category filter dropdown
function populateCategoryFilter() {
    const categories = [...new Set(products.map(p => p.category))]; // Unique categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Event Listeners for Filters
// Demonstrates: Callback Functions, Event Handling
categoryFilter.addEventListener('change', applyFiltersAndSort);
searchProductsInput.addEventListener('input', applyFiltersAndSort);
sortProductsDropdown.addEventListener('change', applyFiltersAndSort);

// Main filtering and sorting logic
// Demonstrates: Higher-Order Functions (filter, sort), function chaining
function applyFiltersAndSort() {
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchProductsInput.value.toLowerCase().trim();
    const sortOption = sortProductsDropdown.value;

    let processedProducts = [...products]; // Start with a copy of all products

    // 1. Filter by category
    if (selectedCategory !== 'all') {
        processedProducts = processedProducts.filter(product => product.category === selectedCategory);
    }

    // 2. Filter by search term (name)
    if (searchTerm) {
        processedProducts = processedProducts.filter(product => product.name.toLowerCase().includes(searchTerm));
    }

    // 3. Apply Sorting
    // Demonstrates: Higher-Order Function (sort)
    if (sortOption === 'price-asc') {
        processedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
        processedProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name-asc') {
        processedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name-desc') {
        processedProducts.sort((a, b) => b.name.localeCompare(a.name));
    }
    // 'default' option means no specific sort is applied, keeps original order if stable sort.

    renderProducts(processedProducts); // Re-render with filtered and sorted results
}

// Event Listeners for Cart Actions
// Demonstrates: Callback Functions
clearCartButton.addEventListener('click', () => {
    myCart.clearCart();
    renderProducts();
    discountMessage.textContent = "";
    couponCodeInput.value = "";
});


checkoutButton.addEventListener('click', () => {
    if (myCart.getCartItems().length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }
    const finalTotal = myCart.getTotalPrice().toFixed(2);
    alert(`Checkout initiated! Final Total: $${finalTotal}\n(This is a placeholder for actual checkout logic)`);
    myCart.clearCart();
    renderProducts();
    discountMessage.textContent = "";
    couponCodeInput.value = "";
});

function updateCouponMessage(discountFunction, couponCode){
    if (discountFunction) {
        myCart.applyDiscount(discountFunction, couponCode);
        if(myCart.getTotalPrice() != myCart.getSubtotalPrice()){
            discountMessage.style.color = '#27ae60'; // Green for success
            discountMessage.textContent = `Coupon '${couponCode}' applied!`;
        }
        else {
            discountMessage.style.color = '#e74c3c'; // Red for error
            discountMessage.textContent = "Coupon code not applicable to current cart total.";
        }
    } else {
        myCart.removeDiscount(); // Remove any previous discount
        discountMessage.style.color = '#e74c3c'; // Red for error
        discountMessage.textContent = "Invalid or expired coupon code.";
    }
}

applyCouponButton.addEventListener('click', () => {
    const couponCode = couponCodeInput.value.toUpperCase().trim();
    const discountFunction = discountCodes[couponCode]; // Get the discount function (closure)
    updateCouponMessage(discountFunction, couponCode);

    // No need to call renderCart explicitly here, applyDiscount calls it.
});

// Initial calls to set up the UI
populateCategoryFilter();
// Note: Initial cart render is handled by the ShoppingCart constructor, or first addItem/removeItem
// For an empty cart, #renderCart will show "Your cart is empty."
applyFiltersAndSort();