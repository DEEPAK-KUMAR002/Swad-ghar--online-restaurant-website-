// ==========================================================================
// Swad Ghar Rider Portal JavaScript Controller
// ==========================================================================

let knownReadyOrderIds = new Set();
let isFirstLoad = true;
let pollingInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch of deliveries
    loadRiderDashboardData();

    // Bind sync / refresh button
    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            
            loadRiderDashboardData().then(() => {
                setTimeout(() => {
                    if (icon) icon.classList.remove('fa-spin');
                }, 600);
            });
        });
    }

    // Bind alert close button
    const alertCloseBtn = document.getElementById('alert-close');
    if (alertCloseBtn) {
        alertCloseBtn.addEventListener('click', dismissNotification);
    }

    // Set polling interval (every 4 seconds)
    pollingInterval = setInterval(loadRiderDashboardData, 4000);

    // Bind rider selector change and load initial state
    const riderSelect = document.getElementById('rider-select');
    if (riderSelect) {
        const savedRider = localStorage.getItem('gusto_rider_name');
        if (savedRider) {
            riderSelect.value = savedRider;
        } else {
            localStorage.setItem('gusto_rider_name', riderSelect.value);
        }

        riderSelect.addEventListener('change', () => {
            localStorage.setItem('gusto_rider_name', riderSelect.value);
            loadRiderDashboardData();
        });
    }

    // Optional user gesture handler to ensure audio can play (browser auto-play policies)
    document.body.addEventListener('click', () => {
        const audio = document.getElementById('chime-sound');
        if (audio && audio.paused && audio.src && isFirstLoad) {
            // Warm up audio channel with silent/low volume play if needed
            audio.volume = 0.5;
        }
    }, { once: true });
});

async function loadRiderDashboardData() {
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();
        window.allOrders = orders;
        
        // Process notifications for new "Ready for Rider" orders
        processNotifications(orders);
        
        // Calculate statistics
        updateMetrics(orders);
        
        // Render lists
        renderAvailableDeliveries(orders);
        renderActiveDeliveries(orders);
        renderCompletedDeliveries(orders);

    } catch (err) {
        console.error("Error loading rider dashboard data:", err);
        showErrorStates();
    }
}

function processNotifications(orders) {
    const readyOrders = orders.filter(o => o.status === 'Ready for Rider');
    
    if (isFirstLoad) {
        // Populate existing ready orders so we don't spam notifications on page open
        readyOrders.forEach(order => knownReadyOrderIds.add(order.id));
        isFirstLoad = false;
    } else {
        // Find new ready orders
        readyOrders.forEach(order => {
            if (!knownReadyOrderIds.has(order.id)) {
                knownReadyOrderIds.add(order.id);
                triggerRiderNotification(order);
            }
        });
    }
}

function triggerRiderNotification(order) {
    const toast = document.getElementById('rider-alert-toast');
    const message = document.getElementById('alert-message');
    const chime = document.getElementById('chime-sound');

    if (toast && message) {
        message.textContent = `Order ${order.orderCode || ('SWAD-' + order.id)} is ready for pick-up.`;
        toast.classList.add('show');
        
        // Play notification chime
        if (chime) {
            chime.currentTime = 0;
            chime.play().catch(err => {
                console.log("Audio playback prevented by browser autoplay restrictions. Click page first.", err);
            });
        }

        // Auto-dismiss after 6 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 6000);
    }
}

function dismissNotification() {
    const toast = document.getElementById('rider-alert-toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

function updateMetrics(orders) {
    const riderSelect = document.getElementById('rider-select');
    const currentRiderName = riderSelect ? riderSelect.value : 'Vikas Kumar';

    const availableCount = orders.filter(o => o.status === 'Ready for Rider').length;
    const activeCount = orders.filter(o => o.status === 'Out for Delivery' && o.riderName === currentRiderName).length;
    const completedCount = orders.filter(o => o.status === 'Delivered' && o.riderName === currentRiderName).length;
    const totalEarnings = orders.filter(o => o.status === 'Delivered' && o.riderName === currentRiderName).reduce((sum, o) => sum + (o.total || 0) * 0.05, 0);

    // Metric cards
    const availableEl = document.getElementById('stat-available-deliveries');
    const activeEl = document.getElementById('stat-active-deliveries');
    const completedEl = document.getElementById('stat-completed-deliveries');
    const earningsEl = document.getElementById('stat-total-earnings');

    // Column badges
    const availableBadge = document.getElementById('count-available');
    const activeBadge = document.getElementById('count-active');

    if (availableEl) availableEl.textContent = availableCount;
    if (activeEl) activeEl.textContent = activeCount;
    if (completedEl) completedEl.textContent = completedCount;
    if (earningsEl) earningsEl.textContent = `₹${totalEarnings.toFixed(2)}`;

    if (availableBadge) availableBadge.textContent = `${availableCount} available`;
    if (activeBadge) activeBadge.textContent = `${activeCount} active`;
}

function renderAvailableDeliveries(orders) {
    const container = document.getElementById('list-available');
    if (!container) return;

    const availableOrders = orders.filter(o => o.status === 'Ready for Rider');

    if (availableOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-check"></i>
                <p>No available pick-ups right now. Fresh orders are being prepared in the kitchen!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = availableOrders.map(order => createDeliveryCardMarkup(order, 'accept')).join('');
}

function renderActiveDeliveries(orders) {
    const container = document.getElementById('list-active');
    if (!container) return;

    const riderSelect = document.getElementById('rider-select');
    const currentRiderName = riderSelect ? riderSelect.value : 'Vikas Kumar';
    const activeOrders = orders.filter(o => o.status === 'Out for Delivery' && o.riderName === currentRiderName);

    if (activeOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-motorcycle"></i>
                <p>No active deliveries. Accept an order on the left to start delivery!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = activeOrders.map(order => createDeliveryCardMarkup(order, 'deliver')).join('');
}

function renderCompletedDeliveries(orders) {
    const container = document.getElementById('list-completed');
    if (!container) return;

    const riderSelect = document.getElementById('rider-select');
    const currentRiderName = riderSelect ? riderSelect.value : 'Vikas Kumar';
    const completedOrders = orders.filter(o => o.status === 'Delivered' && o.riderName === currentRiderName);

    // Also update column badge count
    const badge = document.getElementById('count-completed');
    if (badge) {
        badge.textContent = `${completedOrders.length} completed`;
    }

    if (completedOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No completed deliveries yet. Complete deliveries to see your history!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = completedOrders.map(order => createDeliveryCardMarkup(order, 'completed')).join('');
}

function createDeliveryCardMarkup(order, actionType) {
    const itemsHTML = (order.items || []).map(item => `
        <li>
            <span>${item.name}</span>
            <span class="qty">x${item.quantity}</span>
        </li>
    `).join('');

    const actionButton = actionType === 'accept' 
        ? `<button class="btn-delivery-action" onclick="updateDeliveryStatus(${order.id}, 'Out for Delivery', this)">
            <i class="fas fa-shipping-fast"></i> Accept Pick-up
           </button>`
        : actionType === 'deliver'
        ? `<div style="display: flex; gap: 8px; width: 100%;">
            <button class="btn-delivery-action" style="background: linear-gradient(135deg, var(--color-delivering) 0%, #0076e4 100%); box-shadow: 0 4px 10px rgba(30, 144, 255, 0.25); flex: 1; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 5px;" onclick="openNavigationMap(${order.id})">
                <i class="fas fa-map-marked-alt"></i> Route
            </button>
            <button class="btn-delivery-action" style="background: linear-gradient(135deg, var(--color-delivered) 0%, #26af5a 100%); box-shadow: 0 4px 10px rgba(46, 213, 115, 0.25); flex: 1.2; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 5px;" onclick="updateDeliveryStatus(${order.id}, 'Delivered', this)">
                <i class="fas fa-check-circle"></i> Complete
            </button>
           </div>`
        : `<span style="font-size: 0.8rem; font-weight: 700; color: var(--color-delivered); border: 1px solid var(--color-delivered); padding: 6px 12px; border-radius: 8px; background-color: rgba(46, 213, 115, 0.05); display: inline-flex; align-items: center; gap: 6px;">
            <i class="fas fa-check-circle"></i> Delivered
           </span>`;

    return `
        <div class="delivery-card" data-id="${order.id}">
            <div class="delivery-card-header">
                <span class="order-ref-code">
                    <i class="fas fa-receipt"></i> ${order.orderCode || 'SWAD-MOCK'}
                </span>
                <span class="order-time">${order.date || 'Today'}</span>
            </div>
            <div class="delivery-card-body">
                <span class="cust-name">${order.customerName || 'Anonymous Customer'}</span>
                <span class="cust-phone"><i class="fas fa-phone"></i> ${order.customerPhone || 'N/A'}</span>
                <span class="cust-address"><i class="fas fa-store" style="color: var(--color-preparing);"></i> <b>Pick-up:</b> ${order.restaurantName || 'Swad Ghar Kitchen'}</span>
                <span class="cust-address"><i class="fas fa-map-marker-alt"></i> <b>Deliver to:</b> ${order.deliveryAddress || 'N/A'}</span>
                
                <ul class="items-list">
                    ${itemsHTML}
                </ul>
            </div>
            <div class="delivery-card-footer">
                <div class="order-info-footer">
                    <div class="order-price">₹${(order.total || 0).toFixed(2)}</div>
                    <div class="rider-profit" style="font-size: 0.82rem; font-weight: 600; color: var(--color-delivered); margin-top: 2px;">
                        <i class="fas fa-coins"></i> Profit: ₹${((order.total || 0) * 0.05).toFixed(2)}
                    </div>
                </div>
                ${actionButton}
            </div>
        </div>
    `;
}

window.updateDeliveryStatus = function(orderId, newStatus, buttonEl) {
    if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Updating...`;
    }

    const riderSelect = document.getElementById('rider-select');
    const currentRiderName = riderSelect ? riderSelect.value : 'Vikas Kumar';

    fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: newStatus,
            riderName: currentRiderName
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to update status on server");
        return res.json();
    })
    .then(data => {
        // Instantly refresh dashboard data
        loadRiderDashboardData();
    })
    .catch(err => {
        console.error("Error updating delivery status:", err);
        alert("Failed to update delivery status in database. Please verify connection.");
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.innerHTML = newStatus === 'Out for Delivery' ? 'Accept Pick-up' : 'Mark as Delivered';
        }
    });
};

function showErrorStates() {
    const errorHTML = `
        <div class="loading-state" style="color: var(--accent);">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load data. Please ensure the backend server is running.</p>
        </div>
    `;
    const listAvailable = document.getElementById('list-available');
    const listActive = document.getElementById('list-active');
    const listCompleted = document.getElementById('list-completed');

    if (listAvailable) listAvailable.innerHTML = errorHTML;
    if (listActive) listActive.innerHTML = errorHTML;
    if (listCompleted) listCompleted.innerHTML = errorHTML;
}

// Leaflet Map Logic
let navigationMap = null;
let routePolyline = null;
let startMarker = null;
let endMarker = null;

function getRouteForAddress(address, startPoint) {
    const lower = (address || "").toLowerCase();
    
    // Resolve destination point based on address
    let endPoint = [28.5355, 77.3910]; // Noida
    let roadName = "Noida Sector Road";
    let meta = "1.0 km, 1 min 30 s";
    let steps = [
        { text: "Head south", dist: "150 m", icon: "fa-arrow-down", color: "#ff4757" },
        { text: "Turn left onto Sector Road", dist: "800 m", icon: "fa-reply", color: "#ffa502" },
        { text: "Turn right", dist: "150 m", icon: "fa-share", color: "#1e90ff" },
        { text: "You have arrived at your destination, on the right", dist: "0 m", icon: "fa-map-marker-alt", color: "#2ed573" }
    ];

    if (lower.includes("lucknow")) {
        endPoint = [26.8467, 80.9462];
        roadName = "Hazratganj Road";
        meta = "1.3 km, 2 min 0 s";
        steps = [
            { text: "Depart pick-up location", dist: "100 m", icon: "fa-arrow-down", color: "#ff4757" },
            { text: "Proceed along Hazratganj Road", dist: "1.0 km", icon: "fa-road", color: "#ffa502" },
            { text: "Turn left", dist: "200 m", icon: "fa-reply", color: "#ffa502" },
            { text: "You have arrived at your destination", dist: "0 m", icon: "fa-map-marker-alt", color: "#2ed573" }
        ];
    } else if (lower.includes("pune")) {
        endPoint = [18.5204, 73.8567];
        roadName = "Koregaon Park Road";
        meta = "1.1 km, 1 min 45 s";
        steps = [
            { text: "Depart pick-up location", dist: "150 m", icon: "fa-arrow-up", color: "#ff4757" },
            { text: "Turn left onto Koregaon Road", dist: "800 m", icon: "fa-reply", color: "#ffa502" },
            { text: "Turn right", dist: "150 m", icon: "fa-share", color: "#1e90ff" },
            { text: "You have arrived at your destination", dist: "0 m", icon: "fa-map-marker-alt", color: "#2ed573" }
        ];
    } else if (!lower.includes("noida")) {
        // Generate a deterministic route based on address string hash
        let hash = 0;
        for (let i = 0; i < address.length; i++) {
            hash = address.charCodeAt(i) + ((hash << 5) - hash);
        }
        const latOffset = ((Math.abs(hash) % 100) - 50) * 0.0001; // +/- 0.005
        const lngOffset = ((Math.abs(hash >> 8) % 100) - 50) * 0.0001; // +/- 0.005
        endPoint = [startPoint[0] + latOffset, startPoint[1] + lngOffset];

        const distKm = (Math.sqrt(latOffset * latOffset + lngOffset * lngOffset) * 111).toFixed(1);
        const timeMin = Math.round(distKm * 2);

        roadName = "Local Delivery Route";
        meta = `${distKm} km, ${timeMin} min 0 s`;
        steps = [
            { text: "Depart pick-up location", dist: "100 m", icon: "fa-arrow-down", color: "#ff4757" },
            { text: "Proceed towards destination address", dist: `${Math.round(distKm * 1000 - 100)} m`, icon: "fa-road", color: "#ffa502" },
            { text: "You have arrived at your destination", dist: "0 m", icon: "fa-map-marker-alt", color: "#2ed573" }
        ];
    }

    // Path snaps from startPoint -> intermediate corner -> endPoint
    const pathPoints = [
        startPoint,
        [endPoint[0], startPoint[1]],
        endPoint
    ];

    return {
        endPoint,
        pathPoints,
        roadName,
        meta,
        steps
    };
}

window.openNavigationMap = function(orderId) {
    const modal = document.getElementById('map-modal');
    if (modal) modal.classList.add('show');

    // Find order to extract address and restaurant details
    const order = (window.allOrders || []).find(o => o.id === orderId);
    const address = order ? (order.deliveryAddress || "Noida") : "Noida";
    const customerName = order ? (order.customerName || "Customer") : "Customer";
    
    // Default restaurant details
    let startPoint = [28.6139, 77.2090]; // Delhi
    let startName = "Swad Ghar Delhi";

    if (order && order.restaurantCoordinates) {
        try {
            const cleanCoords = order.restaurantCoordinates.replace('[', '').replace(']', '').split(',');
            if (cleanCoords.length === 2) {
                startPoint = [parseFloat(cleanCoords[0]), parseFloat(cleanCoords[1])];
            }
            if (order.restaurantName) {
                startName = order.restaurantName;
            }
        } catch (e) {
            console.error("Error parsing restaurant coordinates:", e);
        }
    }

    const route = getRouteForAddress(address, startPoint);

    // Dynamically update the directions panel
    const directionsPanel = document.getElementById('map-directions');
    if (directionsPanel) {
        const stepsHTML = route.steps.map(step => `
            <li><i class="fas ${step.icon}" style="color: ${step.color};"></i> ${step.text} <span>${step.dist}</span></li>
        `).join('');
        
        directionsPanel.innerHTML = `
            <strong>${route.roadName}</strong>
            <span class="meta">${route.meta}</span>
            <ul>
                ${stepsHTML}
            </ul>
        `;
    }

    // short delay to let modal scale display before Leaflet sizes container
    setTimeout(() => {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        const endPoint = route.endPoint;

        if (!navigationMap) {
            navigationMap = L.map('map', { zoomControl: true }).setView(startPoint, 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(navigationMap);
        } else {
            navigationMap.invalidateSize();
            navigationMap.setView(startPoint, 15);
            if (routePolyline) navigationMap.removeLayer(routePolyline);
            if (startMarker) navigationMap.removeLayer(startMarker);
            if (endMarker) navigationMap.removeLayer(endMarker);
        }

        // Custom markers using DivIcon for beautiful, sharp icons matching Swad Ghar style
        const bikeIcon = L.divIcon({
            html: '<div style="background:#ff4757; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(255,71,87,0.4); border:2px solid #fff;"><i class="fas fa-motorcycle" style="font-size:0.9rem;"></i></div>',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            className: 'map-marker-custom'
        });

        const homeIcon = L.divIcon({
            html: '<div style="background:#2ed573; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(46,213,115,0.4); border:2px solid #fff;"><i class="fas fa-home" style="font-size:0.9rem;"></i></div>',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            className: 'map-marker-custom'
        });

        startMarker = L.marker(startPoint, { icon: bikeIcon }).addTo(navigationMap)
            .bindTooltip(`Pick-up: ${startName}`, { permanent: true, direction: 'top', className: 'custom-tooltip' });
        
        const endTooltipText = `To: ${customerName} (${address})`;
        endMarker = L.marker(endPoint, { icon: homeIcon }).addTo(navigationMap)
            .bindTooltip(endTooltipText, { permanent: true, direction: 'top', className: 'custom-tooltip' });

        routePolyline = L.polyline(route.pathPoints, {
            color: '#ff4757',
            weight: 5,
            opacity: 0.9
        }).addTo(navigationMap);

        // Fit map view to show starting point and destination route
        const group = new L.featureGroup([startMarker, endMarker]);
        navigationMap.fitBounds(group.getBounds().pad(0.25));

    }, 250);
};

// Bind map modal close buttons
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('map-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('map-modal');
            if (modal) modal.classList.remove('show');
        });
    }

    const modal = document.getElementById('map-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
});
