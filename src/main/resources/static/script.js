/* ==========================================================================
   Swad Ghar Main JavaScript
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Food database items
// --------------------------------------------------------------------------
let MENU_DATA = [];
let REST_DATA = [];
let activeRestaurantId = null;

const AREA_COORDINATES = {
    "Delhi": [28.6139, 77.2090],
    "Noida": [28.5355, 77.3910],
    "Lucknow": [26.8467, 80.9462],
    "Mumbai": [19.0760, 72.8777],
    "Gujarat": [23.0225, 72.5714],
    "Pune": [18.5204, 73.8567]
};

// Asynchronously load menu items and order history from the Spring Boot API
async function loadBackendData() {
    try {
        await loadRestaurants();
        
        const menuRes = await fetch('/api/menu');
        if (menuRes.ok) {
            MENU_DATA = await menuRes.json();
            renderMenu();
        } else {
            console.error("Failed to load menu data from backend. Status:", menuRes.status);
        }
        
        await fetchOrderHistoryAndRender();
    } catch (err) {
        console.error("Error loading backend data from Spring Boot:", err);
    }
}

async function loadRestaurants() {
    try {
        const res = await fetch('/api/restaurants');
        if (!res.ok) throw new Error("Failed to load restaurants");
        REST_DATA = await res.json();
        
        // Calculate distances based on selected delivery area
        updateRestaurantDistances();
    } catch (err) {
        console.error("Error fetching restaurants:", err);
    }
}

function updateRestaurantDistances() {
    const locationSelect = document.getElementById('user-location-select');
    const selectedArea = locationSelect ? locationSelect.value : "Delhi";
    const userCoords = AREA_COORDINATES[selectedArea] || [28.6139, 77.2090];
    
    REST_DATA.forEach(rest => {
        rest.distance = calculateDistance(userCoords[0], userCoords[1], rest.latitude, rest.longitude);
    });
    
    // Sort nearest first
    REST_DATA.sort((a, b) => a.distance - b.distance);
    
    // Set active restaurant to the nearest one if not currently selected
    if (REST_DATA.length > 0) {
        if (!activeRestaurantId || !REST_DATA.some(r => r.id === activeRestaurantId)) {
            activeRestaurantId = REST_DATA[0].id;
        }
    }
    
    renderRestaurants();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function renderRestaurants() {
    const grid = document.getElementById('restaurants-grid');
    if (!grid) return;
    
    grid.innerHTML = REST_DATA.map(rest => {
        const isActive = rest.id === activeRestaurantId;
        return `
            <div class="restaurant-card ${isActive ? 'active' : ''}" onclick="selectRestaurant(${rest.id})">
                <div class="restaurant-card-img-wrapper">
                    <img src="${rest.image}" alt="${rest.name}">
                    <span class="restaurant-badge-cuisine">${rest.cuisine}</span>
                    <span class="restaurant-badge-distance"><i class="fas fa-motorcycle"></i> ${rest.distance.toFixed(1)} km</span>
                </div>
                <div class="restaurant-card-details">
                    <h4>${rest.name}</h4>
                    <span class="address"><i class="fas fa-map-marker-alt"></i> ${rest.address}</span>
                </div>
                <div class="restaurant-card-footer">
                    <span class="restaurant-rating"><i class="fas fa-star"></i> ${rest.rating.toFixed(1)}</span>
                    <button class="restaurant-select-btn">${isActive ? 'Active Menu' : 'Select Branch'}</button>
                </div>
            </div>
        `;
    }).join('');
}

function selectRestaurant(id) {
    activeRestaurantId = id;
    renderRestaurants();
    renderMenu();
}

// --------------------------------------------------------------------------
// 2. Global State Variable Setup
// --------------------------------------------------------------------------
let cart = JSON.parse(localStorage.getItem('gustoCart')) || [];
let currentUser = JSON.parse(localStorage.getItem('gustoCustomerSession')) || null;
let activeCategory = 'all';
let searchQuery = '';
let currentHeroSlideIndex = 0;
let currentReviewSlideIndex = 0;
let isMobileMenuOpen = false;

// --------------------------------------------------------------------------
// 3. Document Ready / Initialize Setup
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader
    initPreloader();
    
    // Set Header on Scroll
    initHeaderScroll();
    
    // Toggle Mobile Navigation Menu
    initMobileNav();

    // Toggle Dark Mode Theme
    initThemeToggle();

    // Setup Expandable Search Bar in Header
    initHeaderSearch();

    // Setup Hero Image Slide Carousel
    initHeroCarousel();

    // Setup Promotion Countdown Timers
    initCountdowns();

    // Render Dynamic Food Menu Cards
    renderMenu();
    initMenuControls();

    // Setup Customer Reviews Slider
    initReviewsSlider();

    // Setup Contact Forms Validation
    initContactValidation();

    // Setup Cart Drawer Actions
    initCartDrawer();

    // Setup Checkout Modal Logic
    initCheckoutModal();

    // Update Cart UI Stats (Badge counts, items)
    updateCartUI();

    // Setup AI Chatbot Widget
    initChatbot();

    // Setup Order History
    initOrderHistory();

    // Setup Authentication System
    initAuthSystem();

    // Load dynamic data from H2 database via Spring Boot REST API
    loadBackendData();

    // Setup Location select listener for proximity sorting
    const userLocationSelect = document.getElementById('user-location-select');
    if (userLocationSelect) {
        userLocationSelect.addEventListener('change', () => {
            updateRestaurantDistances();
            // Automatically fill checkout delivery address area if empty/default
            const addressField = document.getElementById('checkout-address');
            if (addressField && !addressField.value.trim()) {
                addressField.value = `${userLocationSelect.value}`;
            }
        });
    }
});

// --------------------------------------------------------------------------
// 4. Preloader Logic
// --------------------------------------------------------------------------
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.remove();
            }, 600);
        });
        
        // Safety Fallback (if window load is delayed)
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('fade-out');
                setTimeout(() => preloader.remove(), 600);
            }
        }, 3000);
    }
}

// --------------------------------------------------------------------------
// 5. Header Scroll Effect
// --------------------------------------------------------------------------
function initHeaderScroll() {
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        // Sticky Header shadow
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Section Scroll Link Highlighter
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

// --------------------------------------------------------------------------
// 6. Mobile Menu Logic
// --------------------------------------------------------------------------
function initMobileNav() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const toggleIcon = document.getElementById('toggle-icon');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            isMobileMenuOpen = !isMobileMenuOpen;
            if (isMobileMenuOpen) {
                navMenu.classList.add('active');
                toggleIcon.classList.replace('fa-bars', 'fa-times');
            } else {
                navMenu.classList.remove('active');
                toggleIcon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Close when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                toggleIcon.classList.replace('fa-times', 'fa-bars');
                isMobileMenuOpen = false;
            });
        });
    }
}

// --------------------------------------------------------------------------
// 7. Theme Toggle (Dark & Light Mode)
// --------------------------------------------------------------------------
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check saved local theme
    const savedTheme = localStorage.getItem('gustoTheme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            
            if (isDark) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('gustoTheme', 'dark');
                showToast("Dark mode activated! 🌙", "success");
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('gustoTheme', 'light');
                showToast("Light mode activated! ☀️", "success");
            }
        });
    }
}

// --------------------------------------------------------------------------
// 8. Expandable Search Bar in Header
// --------------------------------------------------------------------------
function initHeaderSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchWrapper = document.getElementById('search-input-wrapper');
    const searchIcon = document.getElementById('search-icon');
    const navSearchInput = document.getElementById('nav-search-input');
    const menuSearchInput = document.getElementById('menu-search-input');

    if (searchBtn && searchWrapper) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchWrapper.classList.toggle('active');
            
            if (searchWrapper.classList.contains('active')) {
                searchIcon.classList.replace('fa-search', 'fa-times');
                navSearchInput.focus();
            } else {
                searchIcon.classList.replace('fa-times', 'fa-search');
                navSearchInput.value = '';
                // reset search query
                searchQuery = '';
                if (menuSearchInput) menuSearchInput.value = '';
                renderMenu();
            }
        });

        // Close search wrapper when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchWrapper.contains(e.target) && !searchBtn.contains(e.target)) {
                searchWrapper.classList.remove('active');
                searchIcon.classList.replace('fa-times', 'fa-search');
            }
        });

        // Handle navigation search input keystroke
        navSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            // Sync with secondary menu input if present
            if (menuSearchInput) menuSearchInput.value = e.target.value;
            
            // Scroll to menu section so they see the result immediately
            const menuSection = document.getElementById('menu');
            if (menuSection && searchQuery.length > 0) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
            }
            renderMenu();
        });
    }
}

// --------------------------------------------------------------------------
// 9. Hero Carousel/Slider Slider
// --------------------------------------------------------------------------
function initHeroCarousel() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const autoPlayInterval = 5000;
    let slideTimer;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentHeroSlideIndex = index;
    }

    function nextSlide() {
        let index = currentHeroSlideIndex + 1;
        if (index >= slides.length) index = 0;
        showSlide(index);
    }

    // Set auto timer
    function startAutoSlide() {
        slideTimer = setInterval(nextSlide, autoPlayInterval);
    }

    function resetAutoSlide() {
        clearInterval(slideTimer);
        startAutoSlide();
    }

    // Initialize dots clicking
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-slide'));
            showSlide(index);
            resetAutoSlide();
        });
    });

    if (slides.length > 0) {
        startAutoSlide();
    }
}

// --------------------------------------------------------------------------
// 10. Promotion Countdown Timers
// --------------------------------------------------------------------------
function initCountdowns() {
    // Generate static end hours for simulation
    const setCountdown = (elementId, hoursLimit) => {
        const timerWrapper = document.getElementById(elementId);
        if (!timerWrapper) return;

        // Set target to today + hoursLimit
        let targetTime = new Date().getTime() + (hoursLimit * 60 * 60 * 1000);

        const updateClock = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                // reset Target to loop simulation forever
                targetTime = new Date().getTime() + (hoursLimit * 60 * 60 * 1000);
                return;
            }

            const hrs = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((difference % (1000 * 60)) / 1000);

            timerWrapper.querySelector('.hours').textContent = hrs.toString().padStart(2, '0');
            timerWrapper.querySelector('.minutes').textContent = mins.toString().padStart(2, '0');
            timerWrapper.querySelector('.seconds').textContent = secs.toString().padStart(2, '0');
        };

        updateClock();
        setInterval(updateClock, 1000);
    };

    setCountdown('timer-burger', 2.75); // 2 hours 45 mins
    setCountdown('timer-pizza', 4.2);  // 4 hours 12 mins
}

// --------------------------------------------------------------------------
// 11. Render Food Menu Cards & Filter Action Bindings
// --------------------------------------------------------------------------
function renderMenu() {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;

    // Filter items based on activeCategory, searchQuery, and activeRestaurantId
    const filteredItems = MENU_DATA.filter(item => {
        const matchesRestaurant = true; // All branches serve all items
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery) || 
                              item.description.toLowerCase().includes(searchQuery);
        return matchesRestaurant && matchesCategory && matchesSearch;
    });

    // Handle Empty State
    if (filteredItems.length === 0) {
        menuGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <i class="fas fa-search-minus" style="font-size: 3rem; margin-bottom: 15px; color: var(--border-color)"></i>
                <h3>No delicacies found</h3>
                <p>Try searching for another food item or check your category filter.</p>
            </div>
        `;
        return;
    }

    // Build grid html
    menuGrid.innerHTML = filteredItems.map(item => {
        // Build star ratings
        let starHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= item.rating) {
                starHTML += '<i class="fas fa-star"></i>';
            } else {
                starHTML += '<i class="far fa-star"></i>';
            }
        }

        return `
            <article class="menu-item-card" data-id="${item.id}">
                <div class="card-img-wrapper">
                    <img src="${item.image}" alt="${item.name}">
                    <span class="card-tag">${item.tag}</span>
                    <button class="card-wishlist" title="Add to Wishlist" aria-label="Add to wishlist" onclick="toggleWishlist(this)">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="card-rating">
                        ${starHTML}
                    </div>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-desc">${item.description}</p>
                    <div class="card-footer">
                        <span class="card-price">₹${item.price.toFixed(2)}</span>
                        <button class="add-to-cart-btn" aria-label="Add to Cart" onclick="addToCart(${item.id})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function initMenuControls() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const menuSearchInput = document.getElementById('menu-search-input');
    const navSearchInput = document.getElementById('nav-search-input');

    // Filter Buttons clicking
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            activeCategory = e.target.getAttribute('data-filter');
            renderMenu();
        });
    });

    // Secondary search input box keypresses
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            // Sync main header input
            if (navSearchInput) navSearchInput.value = e.target.value;
            renderMenu();
        });
    }
}

// Global Wishlist Toggle Helper
window.toggleWishlist = function(button) {
    const icon = button.querySelector('i');
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        icon.classList.replace('far', 'fas');
        showToast("Added to wishlist! ❤️", "success");
    } else {
        icon.classList.replace('fas', 'far');
        showToast("Removed from wishlist. 💔", "info");
    }
};

// --------------------------------------------------------------------------
// 12. Reviews/Testimonials Slider
// --------------------------------------------------------------------------
function initReviewsSlider() {
    const wrapper = document.getElementById('reviews-wrapper');
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');
    const slides = document.querySelectorAll('.review-slide');

    if (!wrapper || slides.length === 0) return;

    function updateSlider() {
        wrapper.style.transform = `translateX(-${currentReviewSlideIndex * 100}%)`;
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentReviewSlideIndex--;
            if (currentReviewSlideIndex < 0) {
                currentReviewSlideIndex = slides.length - 1;
            }
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentReviewSlideIndex++;
            if (currentReviewSlideIndex >= slides.length) {
                currentReviewSlideIndex = 0;
            }
            updateSlider();
        });
    }
}

// --------------------------------------------------------------------------
// 13. Toast Notification Handler
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// --------------------------------------------------------------------------
// 14. Cart Management & Drawer Layout
// --------------------------------------------------------------------------
function initCartDrawer() {
    const cartBtn = document.getElementById('cart-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutDrawerBtn = document.getElementById('checkout-drawer-btn');
    const checkoutModal = document.getElementById('checkout-modal');

    // Open Drawer
    if (cartBtn && cartOverlay) {
        cartBtn.addEventListener('click', () => {
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock scrolling
        });
    }

    // Close Drawer
    const closeDrawer = () => {
        cartOverlay.classList.remove('open');
        document.body.style.overflow = 'auto'; // Unlock scrolling
    };

    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeDrawer);
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) closeDrawer();
        });
    }

    // Checkout Drawer Button Click
    if (checkoutDrawerBtn) {
        checkoutDrawerBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast("Your cart is empty! Add food first. 🍕", "info");
                return;
            }
            
            // Close Drawer & Open Checkout Modal
            closeDrawer();
            setTimeout(() => {
                if (checkoutModal) {
                    checkoutModal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                    
                    // Populate profile fields if logged in
                    populateCheckoutFields();
                    
                    // Update total price display inside modal
                    const modalTotalAmt = document.getElementById('modal-total-amt');
                    if (modalTotalAmt) {
                        const total = calculateCartTotal();
                        modalTotalAmt.textContent = `₹${total.toFixed(2)}`;
                    }
                }
            }, 300);
        });
    }
}

// Global Cart Modifiers
window.addToCart = function(productId) {
    const item = MENU_DATA.find(prod => prod.id === productId);
    if (!item) return;

    const existingCartItem = cart.find(ci => ci.id === productId);

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${item.name} to cart! 🍔`, "success");
};

window.changeQuantity = function(productId, delta) {
    const cartItem = cart.find(ci => ci.id === productId);
    if (!cartItem) return;

    cartItem.quantity += delta;

    if (cartItem.quantity <= 0) {
        // Remove item if quantity goes to zero
        cart = cart.filter(ci => ci.id !== productId);
        showToast(`${cartItem.name} removed from cart.`, "info");
    }

    saveCart();
    updateCartUI();
};

window.removeFromCart = function(productId) {
    const cartItem = cart.find(ci => ci.id === productId);
    if (cartItem) {
        cart = cart.filter(ci => ci.id !== productId);
        showToast(`${cartItem.name} removed from cart.`, "info");
        saveCart();
        updateCartUI();
    }
};

function saveCart() {
    localStorage.setItem('gustoCart', JSON.stringify(cart));
}

function calculateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal === 0) return 0;
    const delivery = subtotal >= 300 ? 0 : 40.00;
    return subtotal + delivery;
}

function updateCartUI() {
    const cartBadge = document.getElementById('cart-badge-count');
    const cartBody = document.getElementById('cart-body');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartDelivery = document.getElementById('cart-delivery');
    const cartTotal = document.getElementById('cart-total');

    // Total Count Badge
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) {
        cartBadge.textContent = totalCount;
        // Animation pop effect
        cartBadge.style.transform = 'scale(1.2)';
        setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
    }

    // Render Drawer List
    if (!cartBody) return;

    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="cart-empty-state">
                <i class="fas fa-shopping-basket"></i>
                <h3>Your basket is empty</h3>
                <p>Looks like you haven't added any meals yet. Head to the menu to explore!</p>
            </div>
        `;
        if (cartSubtotal) cartSubtotal.textContent = '₹0.00';
        if (cartDelivery) cartDelivery.textContent = '₹0.00';
        if (cartTotal) cartTotal.textContent = '₹0.00';
        return;
    }

    // List items HTML
    cartBody.innerHTML = `
        <div class="cart-items-list">
            ${cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
                        <div class="cart-item-qty">
                            <button class="qty-btn" aria-label="Decrease quantity" onclick="changeQuantity(${item.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="qty-num">${item.quantity}</span>
                            <button class="qty-btn" aria-label="Increase quantity" onclick="changeQuantity(${item.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="cart-item-remove-btn" title="Remove Item" aria-label="Remove item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    // Sum Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal >= 300 ? 0 : 40.00;
    const total = subtotal + delivery;

    if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    if (cartDelivery) cartDelivery.textContent = `₹${delivery.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `₹${total.toFixed(2)}`;
}

// --------------------------------------------------------------------------
// 15. Checkout Modal Logic
// --------------------------------------------------------------------------
function initCheckoutModal() {
    const checkoutModal = document.getElementById('checkout-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const checkoutForm = document.getElementById('checkout-form');

    const updateCheckoutTotalDisplay = () => {
        const modalTotalAmt = document.getElementById('modal-total-amt');
        if (!modalTotalAmt) return;
        
        const orderTypeEl = document.querySelector('input[name="order-type"]:checked');
        const orderType = orderTypeEl ? orderTypeEl.value : "Delivery";
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery = (orderType === 'Dine-In' || subtotal >= 300) ? 0 : 40.00;
        const total = subtotal + delivery;
        modalTotalAmt.textContent = `₹${total.toFixed(2)}`;
    };

    // Toggle fields based on order-type
    const orderTypeRadios = document.querySelectorAll('input[name="order-type"]');
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const val = radio.value;
            const addressGroup = document.getElementById('checkout-group-address');
            const dineinContainer = document.getElementById('dinein-details-container');
            const addressField = document.getElementById('checkout-address');
            const timeField = document.getElementById('checkout-dinein-time');

            if (val === 'Dine-In') {
                if (addressGroup) addressGroup.style.display = 'none';
                if (dineinContainer) dineinContainer.style.display = 'block';
                if (addressField) addressField.removeAttribute('required');
                if (timeField) timeField.setAttribute('required', 'required');
            } else {
                if (addressGroup) addressGroup.style.display = 'block';
                if (dineinContainer) dineinContainer.style.display = 'none';
                if (addressField) addressField.setAttribute('required', 'required');
                if (timeField) timeField.removeAttribute('required');
            }
            updateCheckoutTotalDisplay();
        });
    });

    // Run this whenever modal opens to set total price
    if (checkoutModal) {
        const observer = new MutationObserver(() => {
            if (checkoutModal.classList.contains('open')) {
                updateCheckoutTotalDisplay();
                // Ensure address is shown and dine-in is hidden when starting checkout
                const addressGroup = document.getElementById('checkout-group-address');
                const dineinContainer = document.getElementById('dinein-details-container');
                const addressField = document.getElementById('checkout-address');
                const timeField = document.getElementById('checkout-dinein-time');
                const deliveryRadio = document.getElementById('type-delivery');
                if (deliveryRadio) deliveryRadio.checked = true;
                if (addressGroup) addressGroup.style.display = 'block';
                if (dineinContainer) dineinContainer.style.display = 'none';
                if (addressField) addressField.setAttribute('required', 'required');
                if (timeField) timeField.removeAttribute('required');
            }
        });
        observer.observe(checkoutModal, { attributes: true, attributeFilter: ['class'] });
    }

    const closeModal = () => {
        if (checkoutModal) {
            checkoutModal.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeModal();
        });
    }

    // Simulated Form Submit
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameField = document.getElementById('checkout-name');
            const phoneField = document.getElementById('checkout-phone');
            const addressField = document.getElementById('checkout-address');
            const timeField = document.getElementById('checkout-dinein-time');
            const orderType = document.querySelector('input[name="order-type"]:checked').value;

            let isValid = true;

            // Simple validations
            if (nameField.value.trim().length === 0) {
                showFieldInvalid('checkout-group-name');
                isValid = false;
            } else {
                showFieldValid('checkout-group-name');
            }

            const phonePattern = /^\d{10}$/;
            if (!phonePattern.test(phoneField.value.replace(/[\s-()]/g, ''))) {
                showFieldInvalid('checkout-group-phone');
                isValid = false;
            } else {
                showFieldValid('checkout-group-phone');
            }

            if (orderType === 'Delivery') {
                if (addressField.value.trim().length === 0) {
                    showFieldInvalid('checkout-group-address');
                    isValid = false;
                } else {
                    showFieldValid('checkout-group-address');
                }
            } else {
                if (timeField.value.trim().length === 0) {
                    showFieldInvalid('checkout-group-dinein-time');
                    isValid = false;
                } else {
                    showFieldValid('checkout-group-dinein-time');
                }
            }

            if (!isValid) return;

            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const delivery = (orderType === 'Dine-In' || subtotal >= 300) ? 0 : 40.00;
            const grandTotal = subtotal + delivery;

            if (paymentMethod === 'card') {
                // Setup Razorpay Checkout options
                const options = {
                    key: (typeof GUSTO_CHATBOT_CONFIG !== 'undefined' && GUSTO_CHATBOT_CONFIG.razorpayKeyId) || "rzp_test_HGlv7Qp7xTq82A",
                    amount: Math.round(grandTotal * 100), // amount in paise/cents (INR)
                    currency: "INR",
                    name: "Swad Ghar Restaurant",
                    description: "Payment for your delicious food order",
                    image: "https://cdn-icons-png.flaticon.com/512/562/562678.png",
                    handler: function (response) {
                        showToast(`Payment Successful! ID: ${response.razorpay_payment_id} 💳`, "success");
                        finalizeOrder();
                    },
                    prefill: {
                        name: nameField.value,
                        contact: phoneField.value,
                        email: "deepakmahta858@gmail.com"
                    },
                    theme: {
                        color: "#ff4757"
                    }
                };

                try {
                    const rzp = new Razorpay(options);
                    rzp.on('payment.failed', function (response) {
                        showToast(`Payment Failed: ${response.error.description} ❌`, "error");
                    });
                    rzp.open();
                } catch (err) {
                    console.error("Razorpay Error:", err);
                    showToast("Could not load Razorpay gateway. ❌", "error");
                }
            } else {
                // COD payment checkout
                finalizeOrder();
            }

            async function finalizeOrder() {
                // Record Order in History
                const orderCode = "SWAD-" + Math.floor(100000 + Math.random() * 900000);
                const orderDate = new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                const activeRest = REST_DATA.find(r => r.id === activeRestaurantId);

                const newOrder = {
                    orderCode: orderCode,
                    date: orderDate,
                    total: grandTotal,
                    payment: paymentMethod === 'card' ? 'Online Razorpay' : 'Cash on Delivery',
                    status: orderType === 'Dine-In' ? 'Serving' : 'Placed', // Skip "Placed" flow for dine-in directly to preparing/serving
                    createdAt: Date.now(), // Save creation timestamp in ms
                    customerName: nameField.value.trim(),
                    customerPhone: phoneField.value.trim(),
                    deliveryAddress: orderType === 'Dine-In' ? "Dine-In Reservation" : addressField.value.trim(),
                    serviceType: orderType,
                    tableNumber: orderType === 'Dine-In' ? document.getElementById('checkout-table').value : null,
                    numberOfGuests: orderType === 'Dine-In' ? parseInt(document.getElementById('checkout-guests').value) : null,
                    dineInTime: orderType === 'Dine-In' ? document.getElementById('checkout-dinein-time').value : null,
                    customerId: currentUser ? currentUser.id : null,
                    restaurantName: activeRest ? activeRest.name : "Swad Ghar Kitchen",
                    restaurantCoordinates: activeRest ? `[${activeRest.latitude},${activeRest.longitude}]` : "[28.6139,77.2090]",
                    items: cart.map(item => ({
                        foodItemId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image
                    }))
                };

                try {
                    const response = await fetch('/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newOrder)
                    });

                    if (response.ok) {
                        const data = await response.json(); // returns { success, message, orderCode, id }
                        const localOrderIds = JSON.parse(localStorage.getItem('gustoLocalOrderIds')) || [];
                        if (data.id) localOrderIds.push(data.id);
                        if (data.orderCode) localOrderIds.push(data.orderCode);
                        localStorage.setItem('gustoLocalOrderIds', JSON.stringify(localOrderIds));

                        showToast("Order placed successfully! 🍕🎉", "success");
                        if (orderType === 'Dine-In') {
                            showToast(`Dine-in booking confirmed at ${newOrder.dineInTime} for ${newOrder.tableNumber}! 🍽️`, "success");
                        } else {
                            showToast("Your meal will arrive in 20 minutes.", "success");
                        }
                        await loadBackendData(); // refresh orderHistory from server
                    } else {
                        showToast("Failed to place order on server. ❌", "error");
                    }
                } catch (err) {
                    console.error("Error submitting order to backend:", err);
                    showToast("Network error placing order. ❌", "error");
                }
                
                // Empty Cart
                cart = [];
                saveCart();
                updateCartUI();
                
                // Clear inputs
                checkoutForm.reset();
                
                // Close modal
                closeModal();
            }
        });
    }
}

// Helper validation triggers
function showFieldInvalid(groupId) {
    const el = document.getElementById(groupId);
    if (el) el.classList.add('invalid');
}

function showFieldValid(groupId) {
    const el = document.getElementById(groupId);
    if (el) el.classList.remove('invalid');
}

// --------------------------------------------------------------------------
// 16. Contact Form Validation
// --------------------------------------------------------------------------
function initContactValidation() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name');
        const email = document.getElementById('contact-email');
        const phone = document.getElementById('contact-phone');
        const subject = document.getElementById('contact-subject');
        const message = document.getElementById('contact-message');

        let isValid = true;

        // Name Validation
        if (name.value.trim().length < 2) {
            showFieldInvalid('group-name');
            isValid = false;
        } else {
            showFieldValid('group-name');
        }

        // Email Validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
            showFieldInvalid('group-email');
            isValid = false;
        } else {
            showFieldValid('group-email');
        }

        // Phone Validation (10 digits)
        const phonePattern = /^\d{10}$/;
        if (!phonePattern.test(phone.value.replace(/[\s-()]/g, ''))) {
            showFieldInvalid('group-phone');
            isValid = false;
        } else {
            showFieldValid('group-phone');
        }

        // Subject Validation
        if (subject.value.trim().length === 0) {
            showFieldInvalid('group-subject');
            isValid = false;
        } else {
            showFieldValid('group-subject');
        }

        // Message Validation (at least 10 chars)
        if (message.value.trim().length < 10) {
            showFieldInvalid('group-message');
            isValid = false;
        } else {
            showFieldValid('group-message');
        }

        if (isValid) {
            const contactData = {
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.replace(/[\s-()]/g, ''),
                subject: subject.value.trim(),
                message: message.value.trim()
            };

            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactData)
            })
            .then(res => {
                if (res.ok) {
                    showToast("Message Sent! We will get back to you shortly. 📩", "success");
                    form.reset();
                } else {
                    showToast("Failed to send message to server. ❌", "error");
                }
            })
            .catch(err => {
                console.error("Error sending message to backend:", err);
                showToast("Network error sending message. ❌", "error");
            });
        }
    });

    // Handle Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            if (emailInput.value.trim()) {
                showToast("Subscribed successfully! Check your inbox for vouchers. 🏷️", "success");
                newsletterForm.reset();
            }
        });
    }
}

// --------------------------------------------------------------------------
// 17. AI Chatbot Widget & Assistant Logic
// --------------------------------------------------------------------------
let chatbotHistory = JSON.parse(localStorage.getItem('gustoChatHistory')) || [];
let isChatbotOpen = false;
let chatbotUnreadCount = 0;

function initChatbot() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const badge = document.getElementById('chatbot-unread-badge');
    const chatWindow = document.getElementById('chat-window');
    const minimizeBtn = document.getElementById('chat-minimize-btn');
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-user-input');
    const suggestions = document.querySelectorAll('.suggestion-pill');

    if (!toggleBtn || !chatWindow) return;

    // Toggle Open/Close Window
    toggleBtn.addEventListener('click', () => {
        isChatbotOpen = !isChatbotOpen;
        if (isChatbotOpen) {
            chatWindow.classList.add('open');
            chatbotUnreadCount = 0;
            updateChatBadge();
            setTimeout(() => chatInput.focus(), 300);
        } else {
            chatWindow.classList.remove('open');
        }
    });

    // Minimize Window
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            chatWindow.classList.remove('open');
            isChatbotOpen = false;
        });
    }

    // Submit Text Message Form
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            
            chatInput.value = '';
            sendChatMessage(text, 'user');
        });
    }

    // Bind Quick Suggestion Pills
    suggestions.forEach(pill => {
        pill.addEventListener('click', (e) => {
            const msg = e.target.getAttribute('data-msg');
            if (msg) {
                sendChatMessage(msg, 'user');
            }
        });
    });

    // Initialize Default Welcome if history is completely empty
    if (chatbotHistory.length === 0) {
        const welcomeText = "Hello! I'm Swad, your virtual food assistant. 🍔 How can I help you today? I can recommend dishes, suggest calorie-conscious options, create meal combos, search our menu, or tell you about our opening hours and deals!";
        chatbotHistory.push({
            text: welcomeText,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem('gustoChatHistory', JSON.stringify(chatbotHistory));
    }

    // Initial Render of history
    renderChatMessages();
}

function updateChatBadge() {
    const badge = document.getElementById('chatbot-unread-badge');
    if (!badge) return;

    if (chatbotUnreadCount > 0) {
        badge.textContent = chatbotUnreadCount;
        badge.classList.add('active');
    } else {
        badge.classList.remove('active');
        badge.textContent = '0';
    }
}

function renderChatMessages() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    chatContainer.innerHTML = chatbotHistory.map(msg => {
        const isUser = msg.sender === 'user';
        const msgClass = isUser ? 'msg-user' : 'msg-bot';
        
        // Render recommended cards if present
        let cardsHTML = '';
        if (msg.items && msg.items.length > 0) {
            cardsHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                    ${msg.items.map(itemId => {
                        const item = MENU_DATA.find(p => p.id === itemId);
                        if (!item) return '';
                        return `
                            <div class="chat-card">
                                <div class="chat-card-img">
                                    <img src="${item.image}" alt="${item.name}">
                                </div>
                                <div class="chat-card-content">
                                    <h4 class="chat-card-title">${item.name}</h4>
                                    <p class="chat-card-desc">${item.description}</p>
                                    <div class="chat-card-footer">
                                        <span class="chat-card-price">₹${item.price.toFixed(2)}</span>
                                        <button class="btn btn-primary chat-card-btn" onclick="addToCartFromChat(${item.id})">
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        return `
            <div class="chat-msg ${msgClass}">
                <div class="chat-msg-bubble">
                    ${msg.text}
                    ${cardsHTML}
                </div>
                <span class="chat-msg-time">${msg.timestamp}</span>
            </div>
        `;
    }).join('');

    // Scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendChatMessage(text, sender) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chatbotHistory.push({ text, sender, timestamp });
    
    // Cap chat history at 30 messages to prevent local storage overflow
    if (chatbotHistory.length > 30) {
        chatbotHistory.shift();
    }

    localStorage.setItem('gustoChatHistory', JSON.stringify(chatbotHistory));
    renderChatMessages();

    if (sender === 'user') {
        // Increment badge count if window is closed
        if (!isChatbotOpen) {
            chatbotUnreadCount++;
            updateChatBadge();
        }
        
        // Trigger bot reply sequence
        triggerBotReply(text);
    }
}

let complaintFormState = null;
let currentComplaintData = {};

function triggerBotReply(userText) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    // 1. Append typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-msg msg-bot typing-bubble-temp';
    typingBubble.innerHTML = `
        <div class="chat-msg-bubble">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    chatContainer.appendChild(typingBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const query = userText.toLowerCase().trim();

    // Check if user is in the middle of filing a complaint
    if (complaintFormState !== null) {
        handleComplaintFlow(userText, (botReplyText) => {
            const tempBubble = chatContainer.querySelector('.typing-bubble-temp');
            if (tempBubble) tempBubble.remove();

            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            chatbotHistory.push({
                text: botReplyText,
                sender: 'bot',
                timestamp
            });

            localStorage.setItem('gustoChatHistory', JSON.stringify(chatbotHistory));
            renderChatMessages();
        });
        return;
    }

    // Check if user wants to start the complaint process
    if (query === 'file a complaint' || query === 'complain' || query === 'complaint' || query === 'make a complaint') {
        complaintFormState = 'AWAITING_EMAIL';
        currentComplaintData = {};

        setTimeout(() => {
            const tempBubble = chatContainer.querySelector('.typing-bubble-temp');
            if (tempBubble) tempBubble.remove();

            const welcomeReply = "I'm sorry to hear that you had a less than perfect experience at Swad Ghar. Let's get this resolved. First, what is your **email address** so we can contact you?";
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            chatbotHistory.push({
                text: welcomeReply,
                sender: 'bot',
                timestamp
            });

            localStorage.setItem('gustoChatHistory', JSON.stringify(chatbotHistory));
            renderChatMessages();
        }, 1000);
        return;
    }

    // 2. Fetch AI Response (local matching or OpenAI fetch)
    getAIResponseFromService(userText, (botReplyText, recommendedItems = []) => {
        // Remove typing indicator
        const tempBubble = chatContainer.querySelector('.typing-bubble-temp');
        if (tempBubble) tempBubble.remove();

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chatbotHistory.push({
            text: botReplyText,
            sender: 'bot',
            timestamp,
            items: recommendedItems
        });

        localStorage.setItem('gustoChatHistory', JSON.stringify(chatbotHistory));
        renderChatMessages();
    });
}

function handleComplaintFlow(userText, callback) {
    const text = userText.trim();
    const cleanText = text.toLowerCase();

    if (cleanText === 'cancel') {
        complaintFormState = null;
        currentComplaintData = {};
        callback("Complaint process cancelled. How else can I assist you today? 🍔");
        return;
    }

    if (complaintFormState === 'AWAITING_EMAIL') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(text)) {
            callback("Please enter a valid email address (e.g. name@example.com) to continue, or type **cancel** to abort.");
            return;
        }
        currentComplaintData.email = text;
        complaintFormState = 'AWAITING_ORDER_CODE';
        callback("Got it. If this is related to a specific order, please enter your **Order Code** (e.g., SWAD-123456). Otherwise, type **none** or **no**.");
        return;
    }

    if (complaintFormState === 'AWAITING_ORDER_CODE') {
        currentComplaintData.orderCode = (cleanText === 'none' || cleanText === 'no') ? 'N/A' : text;
        complaintFormState = 'AWAITING_CATEGORY';
        callback("Thank you. Please select a category for your complaint by typing the number:\n\n1️⃣ **Food Quality**\n2️⃣ **Late Delivery**\n3️⃣ **Payment / Refund Issue**\n4️⃣ **Other**");
        return;
    }

    if (complaintFormState === 'AWAITING_CATEGORY') {
        let category = '';
        if (cleanText === '1' || cleanText.includes('food') || cleanText.includes('quality')) {
            category = 'Food Quality';
        } else if (cleanText === '2' || cleanText.includes('delivery') || cleanText.includes('late')) {
            category = 'Late Delivery';
        } else if (cleanText === '3' || cleanText.includes('payment') || cleanText.includes('refund')) {
            category = 'Payment Issue';
        } else if (cleanText === '4' || cleanText.includes('other')) {
            category = 'Other';
        } else {
            callback("Please select a valid option (1, 2, 3, or 4):\n\n1️⃣ Food Quality\n2️⃣ Late Delivery\n3️⃣ Payment / Refund Issue\n4️⃣ Other");
            return;
        }
        currentComplaintData.category = category;
        complaintFormState = 'AWAITING_DETAILS';
        callback(`Category selected: **${category}**.\n\nPlease describe the details of your complaint so our support team can investigate.`);
        return;
    }

    if (complaintFormState === 'AWAITING_DETAILS') {
        if (text.length < 5) {
            callback("Please provide a little more detail about the issue (at least 5 characters) so we can assist you better.");
            return;
        }
        currentComplaintData.details = text;
        const complaintCode = "COMP-" + Math.floor(100000 + Math.random() * 900000);
        
        // Send complaint to backend API
        fetch('/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                complaintCode: complaintCode,
                email: currentComplaintData.email,
                orderCode: currentComplaintData.orderCode,
                category: currentComplaintData.category,
                details: currentComplaintData.details
            })
        })
        .then(res => {
            if (res.ok) {
                callback(`### Complaint Registered! 📝\n\nYour complaint has been successfully logged in our system.\n\n* **Tracking Code**: \`${complaintCode}\`\n* **Category**: ${currentComplaintData.category}\n* **Order Code**: ${currentComplaintData.orderCode}\n* **Email**: ${currentComplaintData.email}\n* **Details**: ${currentComplaintData.details}\n\nOur customer support team will investigate immediately and contact you. We apologize for the inconvenience!`);
            } else {
                callback(`I've logged your complaint locally with tracking ID: \`${complaintCode}\` but the server encountered an error. We will still reach out to you at **${currentComplaintData.email}**.`);
            }
        })
        .catch(err => {
            console.error("Error submitting complaint:", err);
            callback(`I've logged your complaint locally with tracking ID: \`${complaintCode}\` but a network error occurred. We will still reach out to you at **${currentComplaintData.email}**.`);
        });

        // Reset state
        complaintFormState = null;
        currentComplaintData = {};
    }
}

// Global Cart Handler specifically for chat cards
window.addToCartFromChat = function(productId) {
    // Call the primary add function
    addToCart(productId);
    
    // Trigger desktop drawer opens or small toast alerts
    showToast("Added from Chatbot recommendation! 🍕🛒", "success");
};

// --------------------------------------------------------------------------
function getAIResponseFromService(userText, callback) {
    // If configured to use OpenAI
    if (typeof GUSTO_CHATBOT_CONFIG !== 'undefined' && GUSTO_CHATBOT_CONFIG.provider === 'openai') {
        fetchFromOpenAI(userText, callback);
        return;
    }

    // Default: Fallback Local Parser
    setTimeout(async () => {
        const query = userText.toLowerCase().trim();
        let replyText = "";
        let recommendedItems = [];

        // 1. Order Tracking
        const orderCodeMatch = query.match(/swad-[\w\d]+/i) || query.match(/swad\s*-\s*[\w\d]+/i);
        const isTrackingQuery = query.includes('track') || query.includes('order status') || query.includes('where is my order') || query.includes('order progress') || query.includes('check my order') || query.includes('status');

        if (orderCodeMatch || (isTrackingQuery && !query.includes('add') && !query.includes('buy') && !query.includes('cart') && !query.includes('basket'))) {
            let trackingCode = orderCodeMatch ? orderCodeMatch[0].replace(/\s+/g, '').toUpperCase() : null;

            // Helper to render order details
            const renderOrderTrackingInfo = (order, codeToShow) => {
                let statusEmoji = "📦 Placed";
                if (order.status === "Preparing") statusEmoji = "👨‍🍳 Preparing";
                else if (order.status === "Ready for Rider") statusEmoji = "🥡 Ready for Rider";
                else if (order.status === "Out for Delivery") statusEmoji = "🚴 Out for Delivery";
                else if (order.status === "Serving") statusEmoji = "🍽️ Serving";
                else if (order.status === "Served") statusEmoji = "✨ Served";
                else if (order.status === "Completed") statusEmoji = "✅ Completed";

                let itemsList = order.items ? order.items.map(it => `- ${it.foodName} x ${it.quantity}`).join('\n') : '';
                let riderInfo = order.riderName ? `\n🚴 **Rider Assigned**: ${order.riderName}` : '';
                
                return `### Order Status for ${codeToShow} 📍\n\n` +
                       `* **Current Status**: **${statusEmoji}**\n` +
                       `* **Restaurant**: ${order.restaurantName || 'Swad Ghar Branch'}\n` +
                       `* **Order Type**: ${order.orderType || 'Delivery'}\n` +
                       `* **Total Amount**: ₹${order.totalAmount.toFixed(2)}\n` +
                       (itemsList ? `* **Items Ordered**:\n${itemsList}\n` : '') +
                       riderInfo + `\n\n` +
                       `We are preparation-focused and aim to serve you the absolute best!`;
            };

            try {
                const ordersRes = await fetch('/api/orders');
                if (ordersRes.ok) {
                    const orders = await ordersRes.json();
                    
                    if (trackingCode) {
                        const matchedOrder = orders.find(o => o.orderCode === trackingCode || String(o.id) === trackingCode.replace('SWAD-', ''));
                        if (matchedOrder) {
                            callback(renderOrderTrackingInfo(matchedOrder, trackingCode), []);
                            return;
                        } else {
                            callback(`I couldn't find an order with the code **${trackingCode}**. Please double-check the code or view your order history.`, []);
                            return;
                        }
                    } else {
                        // Look up latest order for this customer
                        const localOrderIds = JSON.parse(localStorage.getItem('gustoLocalOrderIds')) || [];
                        let userOrders = orders;
                        if (currentUser) {
                            userOrders = orders.filter(o => o.customerId === currentUser.id);
                        } else {
                            userOrders = orders.filter(o => localOrderIds.includes(o.id) || localOrderIds.includes(String(o.id)) || localOrderIds.includes(o.orderCode));
                        }

                        if (userOrders.length > 0) {
                            const latestOrder = userOrders[0];
                            callback(`I found your latest order **${latestOrder.orderCode}**:\n\n` + renderOrderTrackingInfo(latestOrder, latestOrder.orderCode), []);
                            return;
                        } else {
                            callback(`You don't have any recent orders to track. If you want to track a specific order, please provide the order code (e.g. **track SWAD-123456**).`, []);
                            return;
                        }
                    }
                } else {
                    callback(`I'm having trouble fetching orders from our server right now. Please try again later.`, []);
                    return;
                }
            } catch (err) {
                console.error("Error tracking order in chatbot:", err);
                callback(`Oops, a network error occurred while tracking your order. Please check your connection.`, []);
                return;
            }
        }

        // 2. Add to Cart / Buy Action
        const isAddQuery = query.startsWith("add ") || query.startsWith("buy ") || query.includes("add to cart ") || query.includes("order ") || query.includes("put ");
        let itemToBuy = "";
        if (isAddQuery) {
            const addPrefixes = ["add to cart ", "add to basket ", "add ", "buy me a ", "buy me ", "buy ", "order a ", "order ", "put a ", "put "];
            for (const p of addPrefixes) {
                if (query.includes(p)) {
                    const idx = query.indexOf(p);
                    itemToBuy = query.substring(idx + p.length).trim();
                    break;
                }
            }
            // Clean up common suffix
            itemToBuy = itemToBuy.replace(/please/g, '').replace(/to my cart/g, '').replace(/to cart/g, '').replace(/to basket/g, '').trim();
        }

        if (isAddQuery && itemToBuy.length > 0) {
            // Find best matching item in MENU_DATA
            let bestMatch = MENU_DATA.find(item => item.name.toLowerCase() === itemToBuy);
            if (!bestMatch) {
                bestMatch = MENU_DATA.find(item => item.name.toLowerCase().startsWith(itemToBuy));
            }
            if (!bestMatch) {
                bestMatch = MENU_DATA.find(item => item.name.toLowerCase().includes(itemToBuy));
            }

            if (bestMatch) {
                addToCart(bestMatch.id);
                callback(`Successfully added 1 x **${bestMatch.name}** (₹${bestMatch.price.toFixed(2)}) to your cart! 🍕🛒\n\nType **cart** to see your basket or type **checkout** to complete your order.`, [bestMatch.id]);
                return;
            } else {
                callback(`I couldn't find an item matching "${itemToBuy}" on our menu. Try searching for it first by typing "search ${itemToBuy}".`, []);
                return;
            }
        }

        // 3. Cart / Basket Query
        if (query === 'cart' || query === 'basket' || query === 'my cart' || query === 'show cart' || query === 'view cart' || query === 'check cart' || query === 'checkout') {
            if (cart.length === 0) {
                callback(`Your cart is currently empty! 🛒 Let me know what you'd like to eat. For example, try typing: **"search pizza"** or **"add Samosa"**!`, []);
                return;
            } else {
                let cartList = cart.map(item => `- **${item.name}** x ${item.quantity} (₹${(item.price * item.quantity).toFixed(2)})`).join('\n');
                const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const delivery = subtotal >= 300 ? 0 : 40.00;
                const total = subtotal + delivery;
                
                let reply = `Here is your current basket 🛒:\n\n${cartList}\n\n` + 
                            `💰 **Subtotal**: ₹${subtotal.toFixed(2)}\n` +
                            `🚚 **Delivery Charge**: ${delivery === 0 ? "FREE" : "₹" + delivery.toFixed(2)}\n` +
                            `⭐ **Total**: ₹${total.toFixed(2)}\n\n`;
                
                if (query === 'checkout') {
                    reply += `To place this order, please click the **Cart Icon** at the top right of the page and click the **Checkout** button!`;
                } else {
                    reply += `You can add more items by typing **"add [item name]"**, or proceed to checkout using the cart drawer.`;
                }
                
                callback(reply, cart.map(c => c.id));
                return;
            }
        }

        // 4. Item Search & Check
        const isSearchQuery = query.includes('search') || query.includes('find') || query.includes('show') || query.includes('menu') || query.includes('suggest') || query.includes('recommend') || query.includes('have');
        
        let searchTerm = query;
        const searchPrefixes = [
            "search for", "search", "find me a", "find me", "find", "show me a", "show me", "show",
            "do you have a", "do you have", "want a", "want", "look for", "recommend a", "recommend", "suggest a", "suggest"
        ];
        for (const p of searchPrefixes) {
            if (query.includes(p)) {
                const idx = query.indexOf(p);
                searchTerm = query.substring(idx + p.length).trim();
                break;
            }
        }
        searchTerm = searchTerm.replace(/please/g, '').replace(/food/g, '').replace(/items/g, '').replace(/item/g, '').trim();

        // If it's a search query or a category mention
        let foundItems = [];
        if (searchTerm.length > 0) {
            foundItems = MENU_DATA.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        }

        if (foundItems.length > 0) {
            const matchesCount = foundItems.length;
            const displayed = foundItems.slice(0, 5);
            const displayedIds = displayed.map(item => item.id);
            
            callback(`I found ${matchesCount} delicious match${matchesCount > 1 ? 'es' : ''} for "${searchTerm}" on our menu! You can add them to your cart directly:`, displayedIds);
            return;
        }

        // 5. Default keyword parser fallback
        if (query.includes('pizza') || query.includes('pizzas')) {
            const items = MENU_DATA.filter(item => item.category === 'pizzas').slice(0, 3).map(i => i.id);
            replyText = "Here are our authentic wood-fired pizzas, made with hand-stretched dough and organic mozzarella. You can add them straight to your basket below! 🍕";
            recommendedItems = items;
        }
        else if (query.includes('burger') || query.includes('burgers') || query.includes('hamburger')) {
            const items = MENU_DATA.filter(item => item.category === 'burgers').slice(0, 3).map(i => i.id);
            replyText = "Craving a delicious, juicy burger? Check out our grilled patty specialties, crafted with premium cheese and toasted brioche buns! 🍔";
            recommendedItems = items;
        }
        else if (query.includes('salad') || query.includes('salads') || query.includes('healthy') || query.includes('green') || query.includes('diet') || query.includes('veg')) {
            const items = MENU_DATA.filter(item => item.category === 'salads' || item.category === 'desifood').slice(0, 3).map(i => i.id);
            replyText = "Looking for something light, green, or vegetarian? Here are our nutritionist-approved fresh salads and vegetarian options: 🥗";
            recommendedItems = items;
        }
        else if (query.includes('dessert') || query.includes('desserts') || query.includes('sweet') || query.includes('cake') || query.includes('waffle') || query.includes('jamun') || query.includes('jalebi')) {
            const items = MENU_DATA.filter(item => item.category === 'desserts').slice(0, 3).map(i => i.id);
            replyText = "Indulge your sweet tooth! Try our freshly prepared rasmalai, kaju katli, and jalebis: 🍰";
            recommendedItems = items;
        }
        else if (query.includes('drink') || query.includes('drinks') || query.includes('mojito') || query.includes('beverage') || query.includes('juice') || query.includes('lassi') || query.includes('chai')) {
            const items = MENU_DATA.filter(item => item.category === 'drinks').slice(0, 3).map(i => i.id);
            replyText = "Quench your thirst! Here are our cool refreshers, traditional lassi, and hot masala chai: 🍹";
            recommendedItems = items;
        }
        else if (query.includes('combo') || query.includes('combos') || query.includes('meal')) {
            const burger = MENU_DATA.find(i => i.category === 'burgers') || { id: 1 };
            const drink = MENU_DATA.find(i => i.category === 'drinks') || { id: 9 };
            const dessert = MENU_DATA.find(i => i.category === 'desserts') || { id: 7 };
            replyText = "Here is our signature **Swad Feast Combo** (Double Cheddar Burger, refreshing drink, and sweet dessert) for a bundled discount price of only **₹499**! 🍱";
            recommendedItems = [burger.id, drink.id, dessert.id].filter(Boolean);
        }
        else if (query.includes('calorie') || query.includes('calories') || query.includes('diet')) {
            const salads = MENU_DATA.filter(item => item.category === 'salads').slice(0, 2).map(i => i.id);
            replyText = "Eating light? Our fresh salad options (approx. 320 kcal) are low-calorie, rich in nutrients, and pair beautifully with a hot masala chai or cooling lassi! 🥑";
            recommendedItems = salads;
        }
        else if (query.includes('hour') || query.includes('hours') || query.includes('time') || query.includes('open') || query.includes('close')) {
            replyText = "Swad Ghar is open:\n⏰ Monday to Friday: 10:00 AM - 11:00 PM\n⏰ Saturday & Sunday: 09:00 AM - Midnight\nWe hope to see you soon!";
        }
        else if (query.includes('delivery') || query.includes('ship') || query.includes('charge') || query.includes('fee')) {
            replyText = "We deliver hot and fresh within 20-30 minutes! Delivery is completely free for orders over ₹300. For smaller orders, there is a flat ₹40 delivery charge. 🚚";
        }
        else if (query.includes('address') || query.includes('location') || query.includes('where') || query.includes('street') || query.includes('branch')) {
            replyText = "We have branches in **Delhi, Noida, Lucknow, Mumbai, Gujarat, and Pune**! We automatically route your orders to the nearest kitchen to serve you hot and fresh! 📍";
        }
        else if (query.includes('spicy') || query.includes('hot')) {
            const spicy = MENU_DATA.filter(item => item.description.toLowerCase().includes('spicy') || item.name.toLowerCase().includes('spicy')).slice(0, 3).map(i => i.id);
            replyText = "Craving a kick? Try our spicy specialties, made with authentic hot Indian spices! 🌶️";
            recommendedItems = spicy;
        }
        else if (query.includes('trending') || query.includes('popular') || query.includes('best seller') || query.includes('favorite')) {
            const trending = MENU_DATA.slice(0, 3).map(i => i.id);
            replyText = "Here are the crowd favorites that our foodies order on repeat! 🌟";
            recommendedItems = trending;
        }
        else if (query.includes('contact') || query.includes('phone') || query.includes('call') || query.includes('number') || query.includes('support') || query.includes('complain') || query.includes('complaint') || query.includes('issue') || query.includes('help') || query.includes('refund')) {
            replyText = "If you have any complaints, issues, or need support with your order, please call us directly at **+91 8076437688** or email **deepakmahta858@gmail.com** so we can resolve it immediately! You can also fill out the Contact Form at the bottom of the page to log it in our database. 📞📩";
        }
        else {
            replyText = "I'm here to assist you! Try asking me to **\"search pizza\"**, **\"add Paneer Tikka Pizza\"**, or type **\"cart\"** to check your basket. You can also track your order status by typing **\"track SWAD-XXXXXX\"**!";
        }

        callback(replyText, recommendedItems);
    }, 1000);
}

// --------------------------------------------------------------------------
// 19. OpenAI Chat Completions API Handler (Stub/Integration)
// --------------------------------------------------------------------------
function fetchFromOpenAI(userText, callback) {
    if (!GUSTO_CHATBOT_CONFIG.openaiApiKey) {
        setTimeout(() => {
            callback("I'm ready to connect to OpenAI, but your API Key is missing in `config.js`. Please configure your API key to enable live conversations. In the meantime, I've loaded my local assistant response:\n\n*Error: API Key empty.*", []);
            // Fallback immediately to local
            GUSTO_CHATBOT_CONFIG.provider = "local";
        }, 800);
        return;
    }

    // Create prompt history structure
    const messagesPayload = [];
    
    // Append System message prompt
    messagesPayload.push({
        role: "system",
        content: GUSTO_CHATBOT_CONFIG.systemPrompt
    });

    // Append last 6 message exchanges to keep payload small and budget friendly
    const historySlice = chatbotHistory.slice(-6);
    historySlice.forEach(msg => {
        messagesPayload.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        });
    });

    // Add current user prompt
    messagesPayload.push({
        role: "user",
        content: userText
    });

    // Make AJAX request to OpenAI
    fetch(GUSTO_CHATBOT_CONFIG.openaiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GUSTO_CHATBOT_CONFIG.openaiApiKey}`
        },
        body: JSON.stringify({
            model: GUSTO_CHATBOT_CONFIG.openaiModel,
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 150
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const replyText = data.choices[0].message.content.trim();
        
        // Scan the OpenAI reply text for any dishes from our menu data to render them dynamically!
        const recommendedItems = [];
        const normalizedReply = replyText.toLowerCase();
        
        MENU_DATA.forEach(item => {
            if (normalizedReply.includes(item.name.toLowerCase()) || 
                item.name.toLowerCase().split(' ').some(word => word.length > 4 && normalizedReply.includes(word))) {
                if (recommendedItems.length < 3 && !recommendedItems.includes(item.id)) {
                    recommendedItems.push(item.id);
                }
            }
        });

        callback(replyText, recommendedItems);
    })
    .catch(error => {
        console.error("OpenAI Fetch Error:", error);
        callback("Oops, I encountered a communication issue with OpenAI. Please verify your internet connection and API Key in `config.js`.", []);
    });
}

// --------------------------------------------------------------------------
// 20. Order History Management
// --------------------------------------------------------------------------
let orderHistory = [];

let historyTimer;

function initOrderHistory() {
    const historyBtn = document.getElementById('history-btn');
    const closeBtn = document.getElementById('history-close-btn');
    const modal = document.getElementById('history-modal');

    if (!historyBtn || !modal) return;

    // Open History Modal
    historyBtn.addEventListener('click', () => {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        fetchOrderHistoryAndRender();
        
        // Poll backend order history every 3 seconds while modal is open
        historyTimer = setInterval(fetchOrderHistoryAndRender, 3000);
    });

    // Close History Modal
    const closeHistory = () => {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
        
        // Clear real-time update timer
        clearInterval(historyTimer);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeHistory);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeHistory();
    });
}

async function fetchOrderHistoryAndRender() {
    try {
        let url = '/api/orders';
        if (currentUser) {
            url = `/api/orders/customer/${currentUser.id}`;
        }
        
        const ordersRes = await fetch(url);
        if (ordersRes.ok) {
            const retrievedOrders = await ordersRes.json();
            if (currentUser) {
                orderHistory = retrievedOrders;
            } else {
                const localOrderIds = JSON.parse(localStorage.getItem('gustoLocalOrderIds')) || [];
                orderHistory = retrievedOrders.filter(order => localOrderIds.includes(order.id) || localOrderIds.includes(String(order.id)) || localOrderIds.includes(order.orderCode));
            }
            renderOrderHistory();
        }
    } catch (err) {
        console.error("Error refreshing order history:", err);
    }
}

function renderOrderHistory() {
    const container = document.getElementById('history-modal-body');
    if (!container) return;

    if (orderHistory.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i class="fas fa-receipt" style="font-size: 3.5rem; color: var(--border-color); margin-bottom: 15px;"></i>
                <h4 style="font-family: 'Poppins', sans-serif; font-size: 1.15rem; color: var(--text-main); margin-bottom: 8px;">No orders found</h4>
                <p style="font-size: 0.88rem;">You haven't placed any orders yet. Head to the menu to satisfy your cravings! 🍔</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orderHistory.map(order => {
        // Read actual status from database OrderRecord
        let statusText = order.status || "Placed";
        let statusClass = "status-placed";

        if (statusText === "Delivered") {
            statusClass = "status-delivered";
        } else if (statusText === "Out for Delivery" || statusText === "Ready for Rider" || statusText === "Preparing") {
            statusClass = "status-preparing";
        } else if (statusText === "Accepted") {
            statusClass = "status-accepted";
        } else if (statusText === "Placed") {
            statusClass = "status-placed";
        }

        // Build items summary
        const itemsListHTML = order.items.map(item => `
            <div class="history-item-row">
                <div class="history-item-info">
                    <div class="history-item-thumb">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div>
                        <span class="history-item-name">${item.name}</span>
                        <span class="history-item-qty">x${item.quantity}</span>
                    </div>
                </div>
                <span class="history-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        return `
            <div class="history-order-card">
                <div class="history-order-header">
                    <div>
                        <span class="history-order-id">${order.orderCode || ("SWAD-" + order.id)}</span>
                        <span class="history-order-date">${order.date}</span>
                    </div>
                    <span class="history-status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="history-order-items">
                    ${itemsListHTML}
                </div>
                <div class="history-order-footer">
                    <div class="history-order-total">
                        Total: <span>₹${order.total.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary reorder-btn" onclick="reorderItems('${order.id}')">
                        <i class="fas fa-redo"></i> Reorder Items
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.reorderItems = function(orderId) {
    const order = orderHistory.find(o => String(o.id) === String(orderId) || o.orderCode === orderId);
    if (!order) return;

    order.items.forEach(item => {
        const itemId = item.foodItemId || item.id;
        const existingItem = cart.find(ci => ci.id === itemId);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push({
                id: itemId,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity
            });
        }
    });

    saveCart();
    updateCartUI();
    
    // Close history modal
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
    }

    showToast("Items added back to your cart! 🍔🛒", "success");

    // Open Cart drawer to show the items
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) {
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
};

// --------------------------------------------------------------------------
// 21. Customer Authentication & Portal Logic
// --------------------------------------------------------------------------
window.switchAuthTab = function(tabName) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');

    if (tabName === 'login') {
        if (tabLogin) tabLogin.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');
        if (formLogin) formLogin.classList.add('active');
        if (formRegister) formRegister.classList.remove('active');
    } else {
        if (tabLogin) tabLogin.classList.remove('active');
        if (tabRegister) tabRegister.classList.add('active');
        if (formLogin) formLogin.classList.remove('active');
        if (formRegister) formRegister.classList.add('active');
    }
};

window.populateCheckoutFields = function() {
    const nameField = document.getElementById('checkout-name');
    const phoneField = document.getElementById('checkout-phone');
    const addressField = document.getElementById('checkout-address');

    if (currentUser) {
        if (nameField) nameField.value = currentUser.name || '';
        if (phoneField) phoneField.value = currentUser.phone || '';
        if (addressField) addressField.value = currentUser.address || '';
    }
};

function initAuthSystem() {
    const loginNavBtn = document.getElementById('login-nav-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const authModal = document.getElementById('auth-modal');
    const authCloseBtn = document.getElementById('auth-close-btn');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const dropdownHistory = document.getElementById('btn-dropdown-history');
    const dropdownLogout = document.getElementById('btn-dropdown-logout');

    // Initial UI Setup
    updateAuthUI();

    // Toggle Portal Modal / Profile Dropdown
    if (loginNavBtn) {
        loginNavBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentUser) {
                profileDropdown.classList.toggle('show');
            } else {
                openAuthModal();
            }
        });
    }

    // Close Dropdown when clicking anywhere outside
    document.addEventListener('click', (e) => {
        if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== loginNavBtn) {
            profileDropdown.classList.remove('show');
        }
    });

    const openAuthModal = () => {
        if (authModal) {
            authModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            switchAuthTab('login');
        }
    };

    const closeAuthModal = () => {
        if (authModal) {
            authModal.classList.remove('open');
            document.body.style.overflow = 'auto';
            if (loginForm) loginForm.reset();
            if (registerForm) registerForm.reset();
        }
    };

    if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuthModal();
        });
    }

    // Dropdown Actions
    if (dropdownHistory) {
        dropdownHistory.addEventListener('click', (e) => {
            e.preventDefault();
            profileDropdown.classList.remove('show');
            
            // Open History Modal
            const historyModal = document.getElementById('history-modal');
            if (historyModal) {
                historyModal.classList.add('open');
                document.body.style.overflow = 'hidden';
                fetchOrderHistoryAndRender();
                historyTimer = setInterval(fetchOrderHistoryAndRender, 3000);
            }
        });
    }

    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.preventDefault();
            profileDropdown.classList.remove('show');
            
            // Clear Session
            localStorage.removeItem('gustoCustomerSession');
            currentUser = null;
            
            updateAuthUI();
            showToast("Logged out successfully. See you soon! 👋", "info");
            
            // Reload backend state
            loadBackendData();
        });
    }

    // Auto-fill Test buttons
    const btnTestRegister = document.getElementById('btn-test-register-fill');
    const btnTestLogin = document.getElementById('btn-test-login-fill');

    if (btnTestRegister) {
        btnTestRegister.addEventListener('click', () => {
            const rand = Math.floor(100 + Math.random() * 900);
            const testName = `Test Customer ${rand}`;
            const testEmail = `tester${rand}@example.com`;
            const testPhone = `98765${Math.floor(10000 + Math.random() * 90000)}`;
            const testAddress = `${rand} Gourmet Boulevard, Foodie Town, NY`;
            const testPassword = `testpassword`;

            const nameInput = document.getElementById('register-name');
            const emailInput = document.getElementById('register-email');
            const phoneInput = document.getElementById('register-phone');
            const addressInput = document.getElementById('register-address');
            const passwordInput = document.getElementById('register-password');

            if (nameInput) nameInput.value = testName;
            if (emailInput) emailInput.value = testEmail;
            if (phoneInput) phoneInput.value = testPhone;
            if (addressInput) addressInput.value = testAddress;
            if (passwordInput) passwordInput.value = testPassword;

            showToast("Test registration data populated! 🪄", "success");
        });
    }

    if (btnTestLogin) {
        btnTestLogin.addEventListener('click', () => {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');

            // Prefill with standard default credentials
            if (emailInput) emailInput.value = "alice@example.com";
            if (passwordInput) passwordInput.value = "alicepassword";

            showToast("Test account credentials populated! 🪄", "success");
        });
    }

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('gustoCustomerSession', JSON.stringify(data.customer));
                    currentUser = data.customer;
                    
                    updateAuthUI();
                    closeAuthModal();
                    showToast(`Welcome back, ${data.customer.name}! 🍕`, "success");
                    
                    // Reload backend state
                    loadBackendData();
                } else {
                    showToast(data.message || "Invalid credentials. ❌", "error");
                }
            } catch (err) {
                console.error("Login Error:", err);
                showToast("Network error during login. ❌", "error");
            }
        });
    }

    // Handle Register Submit
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const phone = document.getElementById('register-phone').value.trim();
            const address = document.getElementById('register-address').value.trim();
            const password = document.getElementById('register-password').value;

            if (password.length < 6) {
                showToast("Password must be at least 6 characters. 🔒", "error");
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, address, password })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('gustoCustomerSession', JSON.stringify(data.customer));
                    currentUser = data.customer;
                    
                    updateAuthUI();
                    closeAuthModal();
                    showToast("Account created successfully! 🎉", "success");
                    
                    // Reload backend state
                    loadBackendData();
                } else {
                    showToast(data.message || "Registration failed. ❌", "error");
                }
            } catch (err) {
                console.error("Registration Error:", err);
                showToast("Network error during registration. ❌", "error");
            }
        });
    }

    // -------------------------------------------------------------
    // Profile settings logic
    // -------------------------------------------------------------
    const dropdownProfile = document.getElementById('btn-dropdown-profile');
    const profileModal = document.getElementById('profile-modal');
    const profileModalClose = document.getElementById('profile-modal-close');
    const profileForm = document.getElementById('profile-form');

    const openProfileModal = () => {
        if (!currentUser) return;
        const nameInput = document.getElementById('profile-name');
        const phoneInput = document.getElementById('profile-phone');
        const addressInput = document.getElementById('profile-address');

        if (nameInput) nameInput.value = currentUser.name || '';
        if (phoneInput) phoneInput.value = currentUser.phone || '';
        if (addressInput) addressInput.value = currentUser.address || '';

        if (profileModal) {
            profileModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeProfileModal = () => {
        if (profileModal) {
            profileModal.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    };

    if (dropdownProfile) {
        dropdownProfile.addEventListener('click', (e) => {
            e.preventDefault();
            profileDropdown.classList.remove('show');
            openProfileModal();
        });
    }

    if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);
    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeProfileModal();
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const name = document.getElementById('profile-name').value.trim();
            const phone = document.getElementById('profile-phone').value.trim();
            const address = document.getElementById('profile-address').value.trim();

            if (!name || !phone || !address) {
                showToast("All fields are required. ❌", "error");
                return;
            }

            try {
                const response = await fetch('/api/auth/update-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: currentUser.id, name, phone, address })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('gustoCustomerSession', JSON.stringify(data.customer));
                    currentUser = data.customer;
                    
                    updateAuthUI();
                    closeProfileModal();
                    showToast("Profile settings saved! 💖", "success");
                    
                    // Reload backend state
                    loadBackendData();
                } else {
                    showToast(data.message || "Failed to update profile. ❌", "error");
                }
            } catch (err) {
                console.error("Profile Update Error:", err);
                showToast("Network error updating profile. ❌", "error");
            }
        });
    }
}

function updateAuthUI() {
    const userWrapper = document.querySelector('.user-profile-wrapper');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const userDisplayName = document.getElementById('user-display-name');
    const userDisplayEmail = document.getElementById('user-display-email');

    if (currentUser) {
        if (userWrapper) userWrapper.classList.add('logged-in');
        if (loginNavBtn) {
            loginNavBtn.setAttribute('title', `Account: ${currentUser.name}`);
            loginNavBtn.innerHTML = `<i class="fas fa-user-check" style="color: white;"></i>`;
        }
        if (userDisplayName) userDisplayName.textContent = currentUser.name;
        if (userDisplayEmail) userDisplayEmail.textContent = currentUser.email;
    } else {
        if (userWrapper) userWrapper.classList.remove('logged-in');
        if (loginNavBtn) {
            loginNavBtn.setAttribute('title', "Sign In");
            loginNavBtn.innerHTML = `<i class="fas fa-user"></i>`;
        }
        if (userDisplayName) userDisplayName.textContent = "Guest User";
        if (userDisplayEmail) userDisplayEmail.textContent = "guest@example.com";
    }
}

