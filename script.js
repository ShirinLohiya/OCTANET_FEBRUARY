// Initialize cart from localStorage or create empty cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Update cart count in the header
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        // Count total items (accounting for quantities)
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
}

// Add item to cart
function addToCart(name, price) {
    if (!currentUser) {
        alert('Please login to add items to cart!');
        showLoginForm();
        return;
    }
    
    // Check if item is already in cart
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        // Increment quantity if item already exists
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        // Add new item with quantity 1
        cart.push({ name, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Item added to cart!');
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Update item quantity
function updateQuantity(index, change) {
    const item = cart[index];
    const newQuantity = (item.quantity || 1) + change;
    
    if (newQuantity <= 0) {
        // Remove item if quantity becomes 0 or negative
        removeFromCart(index);
    } else {
        // Update quantity
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
        updateCartCount();
    }
}

// Display cart items and calculate totals
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (!cartItems) return; // Only run on cart page

    // Clear current cart display
    cartItems.innerHTML = '';
    
    // Calculate subtotal
    let subtotal = 0;
    
    // Display each cart item
    cart.forEach((item, index) => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <span class="item-total">$${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Update totals
    const deliveryCharge = cart.length > 0 ? 5.00 : 0.00;
    const total = subtotal + deliveryCharge;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Auth Modal Functions
function showLoginForm() {
    document.getElementById('auth-modal').style.display = 'block';
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
}

function showSignupForm() {
    document.getElementById('auth-modal').style.display = 'block';
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

function closeModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function switchForm(type) {
    if (type === 'login') {
        showLoginForm();
    } else {
        showSignupForm();
    }
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful!');
        closeModal();
        updateAuthButtons();
    } else {
        alert('Invalid email or password!');
    }
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered!');
        return;
    }
    
    // Add new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    alert('Account created successfully!');
    closeModal();
    updateAuthButtons();
}

// Update auth buttons based on login state
function updateAuthButtons() {
    const loginBtn = document.querySelector('button[onclick="showLoginForm()"]');
    const signupBtn = document.querySelector('button[onclick="showSignupForm()"]');
    
    if (currentUser) {
        loginBtn.textContent = `Hi, ${currentUser.name}`;
        loginBtn.onclick = handleLogout;
        signupBtn.style.display = 'none';
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = showLoginForm;
        signupBtn.style.display = 'inline-block';
    }
}

// Handle Logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthButtons();
    alert('Logged out successfully!');
}

// Initialize the page
updateCartCount();
displayCart();
updateAuthButtons();

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    if (event.target === modal) {
        closeModal();
    }
}