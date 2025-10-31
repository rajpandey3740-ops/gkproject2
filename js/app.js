// GK General Store - Main Application JavaScript
let cart = JSON.parse(localStorage.getItem('cart')) || []
let currentCategory = 'all'
let allProducts = []
let currentUser = JSON.parse(localStorage.getItem('user')) || null
let savedAddresses = JSON.parse(localStorage.getItem('addresses')) || []
let savedCards = JSON.parse(localStorage.getItem('cards')) || []
let savedUPIs = JSON.parse(localStorage.getItem('upis')) || []
let currentPaymentTab = 'cards'
let selectedAddress = null
let selectedPayment = 'cod'

// Initialize user state
function initUser() {
    // Check if user is logged in from localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const username = localStorage.getItem('username')
    
    const loginBtn = document.getElementById('login-btn')
    
    if (isLoggedIn === 'true' && username) {
        // User is logged in, update button to show account
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user-circle mr-2"></i>${username}`
            loginBtn.onclick = () => {
                if (confirm('Logged in as ' + username + '. Do you want to logout?')) {
                    localStorage.removeItem('isLoggedIn')
                    localStorage.removeItem('username')
                    localStorage.removeItem('rememberMe')
                    window.location.reload()
                }
            }
        }
    }
    
    // Legacy support for old user object
    if (currentUser) {
        const userBtn = document.getElementById('user-btn')
        if (userBtn && loginBtn) {
            loginBtn.classList.add('hidden')
            userBtn.classList.remove('hidden')
            document.getElementById('user-name').textContent = currentUser.name.split(' ')[0]
        }
    }
}

// Toggle login modal
function toggleLogin() {
    const modal = document.getElementById('login-modal')
    modal.classList.toggle('hidden')
}

// Switch to register form
function switchToRegister() {
    document.getElementById('login-form').classList.add('hidden')
    document.getElementById('register-form').classList.remove('hidden')
    document.getElementById('auth-title').textContent = 'Create Account'
}

// Switch to login form
function switchToLogin() {
    document.getElementById('register-form').classList.add('hidden')
    document.getElementById('login-form').classList.remove('hidden')
    document.getElementById('auth-title').textContent = 'Welcome Back!'
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value

    if (!email || !password) {
        alert('Please fill in all fields')
        return
    }

    try {
        const response = await axios.post('/api/login', { email, password })
        
        if (response.data.success) {
            currentUser = response.data.user
            localStorage.setItem('user', JSON.stringify(currentUser))
            
            document.getElementById('login-btn').classList.add('hidden')
            document.getElementById('user-btn').classList.remove('hidden')
            document.getElementById('user-name').textContent = currentUser.name.split(' ')[0]
            
            toggleLogin()
            alert('Login successful! Welcome back, ' + currentUser.name)
            
            // Clear form
            document.getElementById('login-email').value = ''
            document.getElementById('login-password').value = ''
        }
    } catch (error) {
        alert(error.response?.data?.error || 'Login failed. Please try again.')
    }
}

// Handle register
async function handleRegister() {
    const name = document.getElementById('register-name').value
    const email = document.getElementById('register-email').value
    const phone = document.getElementById('register-phone').value
    const password = document.getElementById('register-password').value
    const confirm = document.getElementById('register-confirm').value

    if (!name || !email || !phone || !password || !confirm) {
        alert('Please fill in all fields')
        return
    }

    if (password !== confirm) {
        alert('Passwords do not match')
        return
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters')
        return
    }

    try {
        const response = await axios.post('/api/register', { name, email, phone, password })
        
        if (response.data.success) {
            currentUser = response.data.user
            localStorage.setItem('user', JSON.stringify(currentUser))
            
            document.getElementById('login-btn').classList.add('hidden')
            document.getElementById('user-btn').classList.remove('hidden')
            document.getElementById('user-name').textContent = currentUser.name.split(' ')[0]
            
            toggleLogin()
            alert('Registration successful! Welcome, ' + currentUser.name)
            
            // Clear form
            document.getElementById('register-name').value = ''
            document.getElementById('register-email').value = ''
            document.getElementById('register-phone').value = ''
            document.getElementById('register-password').value = ''
            document.getElementById('register-confirm').value = ''
            switchToLogin()
        }
    } catch (error) {
        alert(error.response?.data?.error || 'Registration failed. Please try again.')
    }
}

// Show user menu
function showUserMenu() {
    if (!currentUser) return
    
    document.getElementById('profile-name').textContent = currentUser.name
    document.getElementById('profile-email').textContent = currentUser.email
    document.getElementById('user-menu-modal').classList.remove('hidden')
}

// Close user menu
function closeUserMenu() {
    document.getElementById('user-menu-modal').classList.add('hidden')
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null
        localStorage.removeItem('user')
        
        document.getElementById('user-btn').classList.add('hidden')
        document.getElementById('login-btn').classList.remove('hidden')
        
        closeUserMenu()
        alert('Logged out successfully')
    }
}

// View orders
function viewOrders() {
    alert('Orders page coming soon!')
}

// View profile
function viewProfile() {
    alert('Profile editing coming soon!')
}

// Manage Addresses
function manageAddresses() {
    closeUserMenu()
    loadAddresses()
    document.getElementById('addresses-modal').classList.remove('hidden')
}

function closeAddresses() {
    document.getElementById('addresses-modal').classList.add('hidden')
}

function loadAddresses() {
    const container = document.getElementById('addresses-list')
    
    if (savedAddresses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-map-marker-alt text-6xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No saved addresses yet</p>
            </div>
        `
        return
    }
    
    container.innerHTML = savedAddresses.map((addr, index) => `
        <div class="p-4 bg-gray-50 rounded-xl">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold mb-2">
                        ${addr.type.toUpperCase()}
                        ${addr.isDefault ? ' • DEFAULT' : ''}
                    </span>
                    <h4 class="font-semibold text-gray-800">${addr.name}</h4>
                    <p class="text-sm text-gray-600">${addr.phone}</p>
                </div>
                <button onclick="deleteAddress(${index})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="text-gray-700 text-sm">
                ${addr.street}<br>
                ${addr.city}, ${addr.state} - ${addr.pin}
            </p>
        </div>
    `).join('')
}

function showAddAddressForm() {
    document.getElementById('address-form-title').textContent = 'Add New Address'
    document.getElementById('address-type').value = 'home'
    document.getElementById('address-name').value = ''
    document.getElementById('address-phone').value = ''
    document.getElementById('address-street').value = ''
    document.getElementById('address-city').value = ''
    document.getElementById('address-pin').value = ''
    document.getElementById('address-state').value = ''
    document.getElementById('address-default').checked = false
    document.getElementById('address-form-modal').classList.remove('hidden')
}

function closeAddressForm() {
    document.getElementById('address-form-modal').classList.add('hidden')
}

function saveAddress(event) {
    event.preventDefault()
    
    const address = {
        type: document.getElementById('address-type').value,
        name: document.getElementById('address-name').value,
        phone: document.getElementById('address-phone').value,
        street: document.getElementById('address-street').value,
        city: document.getElementById('address-city').value,
        pin: document.getElementById('address-pin').value,
        state: document.getElementById('address-state').value,
        isDefault: document.getElementById('address-default').checked
    }
    
    if (address.isDefault) {
        savedAddresses.forEach(addr => addr.isDefault = false)
    }
    
    savedAddresses.push(address)
    localStorage.setItem('addresses', JSON.stringify(savedAddresses))
    
    closeAddressForm()
    loadAddresses()
    
    // If opened from checkout, reopen checkout and select the new address
    const checkoutModal = document.getElementById('checkout-modal')
    if (checkoutModal && !checkoutModal.classList.contains('hidden')) {
        selectAddressForCheckout(address)
    } else {
        // Reopen checkout modal if it was closed
        document.getElementById('checkout-modal').classList.remove('hidden')
        selectAddressForCheckout(address)
    }
    
    alert('Address saved successfully!')
}

function deleteAddress(index) {
    if (confirm('Are you sure you want to delete this address?')) {
        savedAddresses.splice(index, 1)
        localStorage.setItem('addresses', JSON.stringify(savedAddresses))
        loadAddresses()
    }
}

// Manage Payment Methods
function manageCards() {
    closeUserMenu()
    currentPaymentTab = 'cards'
    switchPaymentTab('cards')
    loadCards()
    loadUPIs()
    document.getElementById('cards-modal').classList.remove('hidden')
}

function closeCards() {
    document.getElementById('cards-modal').classList.add('hidden')
}

function switchPaymentTab(tab) {
    currentPaymentTab = tab
    
    // Update tab buttons
    const tabs = ['cards', 'upi', 'wallet']
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`)
        const content = document.getElementById(`${t}-tab-content`)
        
        if (t === tab) {
            btn.classList.remove('bg-gray-100', 'text-gray-700')
            btn.classList.add('bg-purple-600', 'text-white')
            content.classList.remove('hidden')
        } else {
            btn.classList.remove('bg-purple-600', 'text-white')
            btn.classList.add('bg-gray-100', 'text-gray-700')
            content.classList.add('hidden')
        }
    })
}

function loadCards() {
    const container = document.getElementById('cards-list')
    
    if (savedCards.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-credit-card text-6xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No saved cards yet</p>
            </div>
        `
        return
    }
    
    container.innerHTML = savedCards.map((card, index) => `
        <div class="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white relative">
            ${card.isDefault ? '<span class="absolute top-2 right-2 bg-yellow-400 text-purple-900 px-2 py-1 rounded-full text-xs font-bold">DEFAULT</span>' : ''}
            <div class="mb-4">
                <i class="fas fa-credit-card text-2xl"></i>
            </div>
            <div class="mb-2">
                <p class="text-sm opacity-80">Card Number</p>
                <p class="font-semibold tracking-wider">•••• •••• •••• ${card.last4}</p>
            </div>
            <div class="flex justify-between items-end">
                <div>
                    <p class="text-sm opacity-80">Cardholder</p>
                    <p class="font-semibold">${card.name}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm opacity-80">Expires</p>
                    <p class="font-semibold">${card.expiry}</p>
                </div>
            </div>
            <button onclick="deleteCard(${index})" class="absolute bottom-2 right-2 text-white hover:text-red-200">
                <i class="fas fa-trash text-sm"></i>
            </button>
        </div>
    `).join('')
}

function showAddCardForm() {
    document.getElementById('card-number').value = ''
    document.getElementById('card-name').value = ''
    document.getElementById('card-expiry').value = ''
    document.getElementById('card-cvv').value = ''
    document.getElementById('card-default').checked = false
    document.getElementById('card-form-modal').classList.remove('hidden')
}

function closeCardForm() {
    document.getElementById('card-form-modal').classList.add('hidden')
}

function saveCard(event) {
    event.preventDefault()
    
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '')
    const card = {
        number: cardNumber,
        last4: cardNumber.slice(-4),
        name: document.getElementById('card-name').value,
        expiry: document.getElementById('card-expiry').value,
        isDefault: document.getElementById('card-default').checked
    }
    
    if (card.isDefault) {
        savedCards.forEach(c => c.isDefault = false)
    }
    
    savedCards.push(card)
    localStorage.setItem('cards', JSON.stringify(savedCards))
    
    closeCardForm()
    loadCards()
    alert('Card saved successfully!')
}

function deleteCard(index) {
    if (confirm('Are you sure you want to delete this card?')) {
        savedCards.splice(index, 1)
        localStorage.setItem('cards', JSON.stringify(savedCards))
        loadCards()
    }
}

// Format card number input
document.addEventListener('DOMContentLoaded', function() {
    // Initialize voice search
    initVoiceSearch()
    
    const cardNumberInput = document.getElementById('card-number')
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '')
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
            e.target.value = formattedValue
        })
    }
    
    const expiryInput = document.getElementById('card-expiry')
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '')
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4)
            }
            e.target.value = value
        })
    }
})

// UPI Functions
function loadUPIs() {
    const container = document.getElementById('upi-list')
    
    if (savedUPIs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fab fa-google-pay text-6xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No saved UPI IDs yet</p>
            </div>
        `
        return
    }
    
    container.innerHTML = savedUPIs.map((upi, index) => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center">
                <i class="fas fa-mobile-alt text-2xl text-purple-600 mr-3"></i>
                <div>
                    <p class="font-semibold">${upi.id}</p>
                    <p class="text-sm text-gray-600">${upi.provider}</p>
                    ${upi.isDefault ? '<span class="inline-block px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold mt-1">DEFAULT</span>' : ''}
                </div>
            </div>
            <button onclick="deleteUPI(${index})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('')
}

function showAddUPIForm() {
    document.getElementById('upi-id').value = ''
    document.getElementById('upi-provider').value = 'gpay'
    document.getElementById('upi-default').checked = false
    document.getElementById('upi-form-modal').classList.remove('hidden')
}

function closeUPIForm() {
    document.getElementById('upi-form-modal').classList.add('hidden')
}

function saveUPI(event) {
    event.preventDefault()
    
    const upi = {
        id: document.getElementById('upi-id').value,
        provider: document.getElementById('upi-provider').value,
        isDefault: document.getElementById('upi-default').checked
    }
    
    if (upi.isDefault) {
        savedUPIs.forEach(u => u.isDefault = false)
    }
    
    savedUPIs.push(upi)
    localStorage.setItem('upis', JSON.stringify(savedUPIs))
    
    closeUPIForm()
    loadUPIs()
    alert('UPI ID saved successfully!')
}

function deleteUPI(index) {
    if (confirm('Are you sure you want to delete this UPI ID?')) {
        savedUPIs.splice(index, 1)
        localStorage.setItem('upis', JSON.stringify(savedUPIs))
        loadUPIs()
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await axios.get('/api/categories')
        const categories = response.data
        const container = document.getElementById('categories')
        
        container.innerHTML = categories.map(cat => `
            <button 
                onclick="selectCategory('${cat.id}')"
                class="category-btn px-6 py-3 rounded-full font-semibold whitespace-nowrap ${cat.id === 'all' ? 'active' : 'bg-gray-100 text-gray-700'}"
            >
                <span class="mr-2">${cat.icon}</span>
                ${cat.name}
            </button>
        `).join('')
    } catch (error) {
        console.error('Error loading categories:', error)
    }
}

// Load products
async function loadProducts(category = 'all', search = '') {
    try {
        let url = '/api/products?'
        if (category !== 'all') url += `category=${category}&`
        if (search) url += `search=${search}`
        
        const response = await axios.get(url)
        allProducts = response.data
        displayProducts(allProducts)
        
        document.getElementById('product-count').textContent = `${allProducts.length} products available`
    } catch (error) {
        console.error('Error loading products:', error)
    }
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('products')
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-500">No products found</p>
            </div>
        `
        return
    }
    
    container.innerHTML = products.map(product => {
        const cartItem = cart.find(item => item.id === product.id)
        const inCart = cartItem ? cartItem.quantity : 0
        
        return `
            <div class="product-card bg-white rounded-2xl shadow-md overflow-hidden">
                <div class="relative">
                    <div class="bg-gradient-to-br from-purple-100 to-pink-100 h-48 flex items-center justify-center">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain p-4" />
                    </div>
                    ${product.discount > 0 ? `
                        <div class="badge-discount absolute top-3 right-3 text-white px-3 py-1 rounded-full text-sm font-bold">
                            ${product.discount}% OFF
                        </div>
                    ` : ''}
                    ${product.popular ? `
                        <div class="badge-popular absolute top-3 left-3 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ⭐ POPULAR
                        </div>
                    ` : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 mb-2 h-12 line-clamp-2">${product.name}</h3>
                    <p class="text-sm text-gray-500 mb-3">${product.unit}</p>
                    <div class="flex items-center mb-4">
                        <span class="text-2xl font-bold text-gray-900">₹${product.price}</span>
                        ${product.discount > 0 ? `
                            <span class="text-sm text-gray-400 line-through ml-2">₹${product.originalPrice}</span>
                        ` : ''}
                    </div>
                    <div id="cart-control-${product.id}">
                        ${inCart > 0 ? `
                            <div class="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl shadow-md">
                                <button 
                                    onclick="updateQuantity(${product.id}, -1)"
                                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition-all"
                                >
                                    <i class="fas fa-minus text-sm"></i>
                                </button>
                                <span class="font-bold text-lg">${inCart} in cart</span>
                                <button 
                                    onclick="updateQuantity(${product.id}, 1)"
                                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition-all"
                                >
                                    <i class="fas fa-plus text-sm"></i>
                                </button>
                            </div>
                        ` : `
                            <button 
                                onclick="addToCart(${product.id})"
                                class="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md"
                            >
                                <i class="fas fa-plus mr-2"></i>Add to Cart
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `
    }).join('')
}

// Select category
function selectCategory(category) {
    currentCategory = category
    const buttons = document.querySelectorAll('.category-btn')
    buttons.forEach(btn => {
        btn.classList.remove('active')
        btn.classList.add('bg-gray-100', 'text-gray-700')
    })
    event.target.closest('button').classList.add('active')
    event.target.closest('button').classList.remove('bg-gray-100', 'text-gray-700')
    
    const categoryNames = {
        'all': 'All Products',
        'namkeen': 'Namkeen & Snacks',
        'pickles': 'Pickles',
        'spices': 'Spices',
        'ghee': 'Ghee',
        'dalda': 'Dalda/Vegetable Ghee',
        'biscuits': 'Biscuits',
        'pulses': 'Pulses & Dals',
        'rice': 'Rice',
        'wheat': 'Wheat & Flour',
        'oil': 'Cooking Oil',
        'essentials': 'Kitchen Essentials',
        'instant': 'Instant Foods',
        'beverages': 'Beverages',
        'personal': 'Personal Care'
    }
    
    document.getElementById('category-title').textContent = categoryNames[category]
    loadProducts(category, document.getElementById('searchInput')?.value || '')
}

// Handle search
function handleSearch() {
    const search = document.getElementById('searchInput').value
    const searchMobile = document.getElementById('search-input-mobile')
    if (searchMobile) {
        searchMobile.value = search
    }
    loadProducts(currentCategory, search)
}

// Handle mobile search
function handleSearchMobile() {
    const search = document.getElementById('search-input-mobile').value
    const searchDesktop = document.getElementById('searchInput')
    if (searchDesktop) {
        searchDesktop.value = search
    }
    loadProducts(currentCategory, search)
}

// Voice Search Functionality
let recognition = null
let isListening = false

function initVoiceSearch() {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onstart = function() {
            isListening = true
            const micBtn = document.getElementById('micBtn')
            const searchBox = document.querySelector('.search-box')
            const searchInput = document.getElementById('searchInput')
            
            if (micBtn) {
                micBtn.classList.add('listening')
            }
            if (searchBox) {
                searchBox.classList.add('listening')
            }
            if (searchInput) {
                searchInput.classList.add('listening')
                searchInput.placeholder = '🎤 Listening...'
            }
        }
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript
            const searchInput = document.getElementById('searchInput')
            if (searchInput) {
                searchInput.value = transcript
                handleSearch()
            }
        }
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error)
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please enable microphone permissions.')
            } else if (event.error === 'no-speech') {
                alert('No speech detected. Please try again.')
            }
            stopVoiceSearch()
        }
        
        recognition.onend = function() {
            stopVoiceSearch()
        }
    }
}

function toggleVoiceSearch() {
    if (!recognition) {
        alert('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.')
        return
    }
    
    if (isListening) {
        stopVoiceSearch()
    } else {
        startVoiceSearch()
    }
}

function startVoiceSearch() {
    if (recognition && !isListening) {
        try {
            recognition.start()
        } catch (error) {
            console.error('Error starting voice recognition:', error)
        }
    }
}

function stopVoiceSearch() {
    isListening = false
    const micBtn = document.getElementById('micBtn')
    const searchBox = document.querySelector('.search-box')
    const searchInput = document.getElementById('searchInput')
    
    if (micBtn) {
        micBtn.classList.remove('listening')
    }
    if (searchBox) {
        searchBox.classList.remove('listening')
    }
    if (searchInput) {
        searchInput.classList.remove('listening')
        searchInput.placeholder = 'Search products...'
    }
    if (recognition) {
        try {
            recognition.stop()
        } catch (error) {
            // Ignore errors when stopping
        }
    }
}

// Add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return
    
    const existingItem = cart.find(item => item.id === productId)
    
    if (existingItem) {
        existingItem.quantity++
    } else {
        cart.push({ ...product, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
    updateProductCard(productId)
    
    // Visual feedback
    const countBadge = document.getElementById('cart-count')
    countBadge.classList.remove('cart-badge')
    void countBadge.offsetWidth
    countBadge.classList.add('cart-badge')
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId)
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId)
    if (!item) return
    
    item.quantity += change
    
    if (item.quantity <= 0) {
        removeFromCart(productId)
    } else {
        localStorage.setItem('cart', JSON.stringify(cart))
        updateCart()
    }
    updateProductCard(productId)
}

// Update individual product card
function updateProductCard(productId) {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return
    
    const cartItem = cart.find(item => item.id === productId)
    const inCart = cartItem ? cartItem.quantity : 0
    const cardControl = document.getElementById(`cart-control-${productId}`)
    
    if (!cardControl) return
    
    if (inCart > 0) {
        cardControl.innerHTML = `
            <div class="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl shadow-md">
                <button 
                    onclick="updateQuantity(${productId}, -1)"
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition-all"
                >
                    <i class="fas fa-minus text-sm"></i>
                </button>
                <span class="font-bold text-lg">${inCart} in cart</span>
                <button 
                    onclick="updateQuantity(${productId}, 1)"
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition-all"
                >
                    <i class="fas fa-plus text-sm"></i>
                </button>
            </div>
        `
    } else {
        cardControl.innerHTML = `
            <button 
                onclick="addToCart(${productId})"
                class="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md"
            >
                <i class="fas fa-plus mr-2"></i>Add to Cart
            </button>
        `
    }
}

// Update cart display
function updateCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    document.getElementById('cart-count').textContent = count
    
    const subtotal = cart.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0)
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const savings = subtotal - total
    
    const cartHTML = cart.length === 0 ? `
        <div class="empty-cart text-center py-8">
            <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">Your cart is empty</p>
        </div>
    ` : cart.map(item => `
        <div class="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
            <div class="bg-white rounded-lg p-2">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-contain" />
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate">${item.name}</p>
                <p class="text-xs text-gray-500">${item.unit}</p>
                <p class="font-bold text-purple-600">₹${item.price}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="updateQuantity(${item.id}, -1)" class="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold">-</button>
                <span class="font-bold w-8 text-center">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)" class="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold">+</button>
            </div>
        </div>
    `).join('')
    
    document.getElementById('cart-items-mobile').innerHTML = cartHTML
    
    document.getElementById('subtotal-mobile').textContent = `₹${subtotal}`
    document.getElementById('savings-mobile').textContent = `₹${savings}`
    document.getElementById('total-mobile').textContent = `₹${total}`
}

// Toggle cart modal (mobile)
function toggleCart() {
    const modal = document.getElementById('cart-modal')
    modal.classList.toggle('hidden')
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!')
        return
    }
    
    // Close cart modal and open checkout modal
    document.getElementById('cart-modal').classList.add('hidden')
    
    // Load checkout data
    loadCheckoutData()
    
    // Show checkout modal
    document.getElementById('checkout-modal').classList.remove('hidden')
}

function loadCheckoutData() {
    const subtotal = cart.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0)
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const savings = subtotal - total
    
    // Load order items
    const itemsHTML = cart.map(item => `
        <div class="flex items-center justify-between py-2 border-b">
            <div class="flex items-center">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-contain rounded-lg mr-3" />
                <div>
                    <p class="font-semibold text-sm">${item.name}</p>
                    <p class="text-xs text-gray-600">${item.unit} × ${item.quantity}</p>
                </div>
            </div>
            <p class="font-bold text-purple-600">₹${item.price * item.quantity}</p>
        </div>
    `).join('')
    
    document.getElementById('checkout-items').innerHTML = itemsHTML
    document.getElementById('checkout-subtotal').textContent = `₹${subtotal}`
    document.getElementById('checkout-savings').textContent = `₹${savings}`
    document.getElementById('checkout-total').textContent = `₹${total}`
    
    // Set default address if available
    if (savedAddresses.length > 0) {
        const defaultAddr = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0]
        selectAddressForCheckout(defaultAddr)
    } else {
        // Show message to add address
        document.getElementById('selected-address').innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-map-marker-alt text-3xl text-gray-300 mb-2"></i>
                <p class="text-gray-500 text-sm">No address added yet</p>
                <button onclick="selectDeliveryAddress()" class="mt-2 text-purple-600 font-semibold hover:text-purple-700">
                    <i class="fas fa-plus mr-1"></i>Add Address
                </button>
            </div>
        `
    }
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.add('hidden')
}

function selectPaymentMethod(method) {
    selectedPayment = method
    
    // Show/hide UPI details
    const upiDetails = document.getElementById('upi-details')
    if (method === 'upi') {
        upiDetails.classList.remove('hidden')
    } else {
        upiDetails.classList.add('hidden')
    }
}

function copyUPIId() {
    const upiId = document.getElementById('upi-id-display').textContent
    navigator.clipboard.writeText(upiId).then(() => {
        alert('UPI ID copied to clipboard: ' + upiId)
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = upiId
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('UPI ID copied to clipboard: ' + upiId)
    })
}

function selectDeliveryAddress() {
    // If no addresses exist, directly open the add address form
    if (savedAddresses.length === 0) {
        document.getElementById('checkout-modal').classList.add('hidden')
        showAddAddressForm()
        return
    }
    
    loadAddressSelection()
    document.getElementById('address-select-modal').classList.remove('hidden')
}

function closeAddressSelect() {
    document.getElementById('address-select-modal').classList.add('hidden')
}

function loadAddressSelection() {
    const container = document.getElementById('address-selection-list')
    
    if (savedAddresses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-map-marker-alt text-6xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No saved addresses</p>
            </div>
        `
        return
    }
    
    container.innerHTML = savedAddresses.map((addr, index) => `
        <label class="flex items-start p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 cursor-pointer transition-all">
            <input type="radio" name="address-select" value="${index}" class="mt-1 mr-3 w-5 h-5" onchange="selectAddressForCheckout(savedAddresses[${index}])">
            <div class="flex-1">
                <div class="flex items-center mb-2">
                    <span class="inline-block px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold mr-2">
                        ${addr.type.toUpperCase()}
                    </span>
                    ${addr.isDefault ? '<span class="inline-block px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">DEFAULT</span>' : ''}
                </div>
                <p class="font-semibold">${addr.name}</p>
                <p class="text-sm text-gray-600">${addr.phone}</p>
                <p class="text-sm text-gray-700 mt-1">
                    ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pin}
                </p>
            </div>
        </label>
    `).join('')
}

function selectAddressForCheckout(address) {
    selectedAddress = address
    document.getElementById('selected-address').innerHTML = `
        <div class="bg-white border-2 border-purple-500 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                    ${address.type.toUpperCase()}
                </span>
                <i class="fas fa-check-circle text-purple-600 text-xl"></i>
            </div>
            <p class="font-semibold text-gray-800">${address.name}</p>
            <p class="text-sm text-gray-600"><i class="fas fa-phone mr-1"></i>${address.phone}</p>
            <p class="text-sm text-gray-700 mt-2">
                <i class="fas fa-map-marker-alt mr-1"></i>${address.street}, ${address.city}, ${address.state} - ${address.pin}
            </p>
        </div>
    `
    closeAddressSelect()
}

function addNewAddressFromCheckout() {
    closeAddressSelect()
    showAddAddressForm()
}

function placeOrder() {
    if (!selectedAddress) {
        alert('⚠️ Please select a delivery address!')
        return
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const savings = cart.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0)
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    
    const paymentMethods = {
        'cod': 'Cash on Delivery',
        'upi': 'UPI Payment',
        'card': 'Card Payment',
        'netbanking': 'Net Banking',
        'wallet': 'Digital Wallet'
    }
    
    alert(`🎉 Order Placed Successfully!

📦 Order Summary:
Total Items: ${itemCount}
💰 You Saved: ₹${savings}
💳 Total Amount: ₹${total}

📍 Delivery Address:
${selectedAddress.name}
${selectedAddress.street}, ${selectedAddress.city}
${selectedAddress.state} - ${selectedAddress.pin}
📞 ${selectedAddress.phone}

💵 Payment Method: ${paymentMethods[selectedPayment]}

Your order will be delivered soon!
Thank you for shopping at GK General Store! 🛒`)
    
    // Clear cart
    cart = []
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
    
    // Refresh product display to reset all cart buttons
    displayProducts(allProducts)
    
    // Close checkout modal
    closeCheckout()
}

// Initialize
initUser()
loadCategories()
loadProducts()
updateCart()
