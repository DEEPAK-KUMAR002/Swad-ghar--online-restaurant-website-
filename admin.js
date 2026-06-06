// ==========================================================================
// Swad Ghar Admin Dashboard JavaScript Controller
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch
    loadAdminDashboardData();

    // Bind refresh button
    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            
            loadAdminDashboardData().then(() => {
                setTimeout(() => {
                    if (icon) icon.classList.remove('fa-spin');
                }, 600);
            });
        });
    }

    // Set auto-refresh interval (every 10 seconds)
    setInterval(loadAdminDashboardData, 10000);
});

async function loadAdminDashboardData() {
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();
        
        // Calculate statistics
        calculateStats(orders);
        
        // Render orders table
        renderOrdersTable(orders);
    } catch (err) {
        console.error("Error loading admin dashboard data:", err);
        const tableBody = document.getElementById('orders-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-state" style="color: var(--accent);">
                        <i class="fas fa-exclamation-triangle"></i>
                        Failed to connect to backend server. Make sure Spring Boot is running.
                    </td>
                </tr>
            `;
        }
    }
}

function calculateStats(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeDeliveries = orders.filter(order => order.status !== 'Delivered').length;

    // Render metrics
    const totalOrdersEl = document.getElementById('stat-total-orders');
    const totalRevenueEl = document.getElementById('stat-total-revenue');
    const activeDeliveriesEl = document.getElementById('stat-pending-deliveries');
    const countBadgeEl = document.getElementById('orders-count-badge');

    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;
    if (activeDeliveriesEl) activeDeliveriesEl.textContent = activeDeliveries;
    if (countBadgeEl) countBadgeEl.textContent = `${totalOrders} orders`;
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-state">
                    <i class="fas fa-inbox" style="color: var(--text-muted); font-size: 2.5rem; margin-bottom: 15px;"></i>
                    No orders transacted yet.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = orders.map(order => {
        // Items list formatting
        const itemsListHTML = (order.items || []).map(item => `
            <li>${item.name} <span>x${item.quantity}</span></li>
        `).join('');

        // Map status classes
        const status = order.status || 'Placed';
        const isDineIn = order.serviceType === 'Dine-In';
        let badgeClass = 'placed';
        let nextStatus = '';
        let buttonText = '';

        if (isDineIn) {
            if (status === 'Serving') {
                badgeClass = 'preparing';
                nextStatus = 'Served';
                buttonText = 'Mark as Served';
            } else if (status === 'Served') {
                badgeClass = 'accepted';
                nextStatus = 'Completed';
                buttonText = 'Complete Reservation';
            } else {
                badgeClass = 'delivered'; // Completed state
            }
        } else {
            if (status === 'Placed') {
                badgeClass = 'placed';
                nextStatus = 'Accepted';
                buttonText = 'Mark as accepted';
            } else if (status === 'Accepted') {
                badgeClass = 'accepted';
                nextStatus = 'Preparing';
                buttonText = 'Mark as preparing';
            } else if (status === 'Preparing') {
                badgeClass = 'preparing';
                nextStatus = 'Ready for Rider';
                buttonText = 'Mark as ready for rider';
            } else if (status === 'Ready for Rider') {
                badgeClass = 'ready-for-rider';
            } else if (status === 'Out for Delivery') {
                badgeClass = 'delivering';
            } else {
                badgeClass = 'delivered';
            }
        }

        const buttonHTML = buttonText ? `
            <button class="btn-status-action" onclick="advanceOrderStatus(${order.id}, '${nextStatus}', this)">
                ${buttonText}
            </button>
        ` : '';

        const riderBadgeHTML = (!isDineIn && order.riderName) ? `
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-top: 4px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fas fa-motorcycle" style="color: var(--color-delivering);"></i> ${order.riderName}
            </span>
        ` : '';

        let customerDetailsHTML = `
            <span class="customer-name">${order.customerName || 'Anonymous Customer'}</span>
            <span class="customer-meta"><i class="fas fa-phone"></i> ${order.customerPhone || 'N/A'}</span>
        `;
        if (isDineIn) {
            customerDetailsHTML += `
                <span class="service-badge dinein" style="background-color: rgba(255, 159, 67, 0.15); color: #ff9f43; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; margin: 4px 0;"><i class="fas fa-chair"></i> DINE-IN</span>
                <span class="customer-meta" style="font-size: 0.8rem; color: var(--text-main); font-weight: 500;"><b>${order.tableNumber || 'N/A'}</b> | <b>${order.numberOfGuests || 0} Guests</b></span>
                <span class="customer-meta"><i class="far fa-clock"></i> <b>Time:</b> ${order.dineInTime || 'N/A'}</span>
            `;
        } else {
            customerDetailsHTML += `
                <span class="service-badge delivery" style="background-color: rgba(9, 132, 227, 0.15); color: #0984e3; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; margin: 4px 0;"><i class="fas fa-shipping-fast"></i> DELIVERY</span>
                <span class="customer-meta"><i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress || 'N/A'}</span>
            `;
        }

        return `
            <tr data-id="${order.id}">
                <td>
                    <span class="order-code-ref">${order.orderCode || 'SWAD-MOCK'}</span>
                    <span class="order-db-id">DB ID: #${order.id}</span>
                </td>
                <td>
                    <div style="font-size: 0.88rem; font-weight: 500;">${order.date || 'Today'}</div>
                </td>
                <td>
                    ${customerDetailsHTML}
                </td>
                <td>
                    <ul class="items-summary-list">
                        ${itemsListHTML}
                    </ul>
                </td>
                <td>
                    <span class="order-total-price">₹${(order.total || 0).toFixed(2)}</span>
                </td>
                <td>
                    <span class="payment-method-badge">${order.payment || 'Cash'}</span>
                </td>
                <td>
                    <div class="status-column-container">
                        <span class="status-badge ${badgeClass}">${status}</span>
                        ${riderBadgeHTML}
                        ${buttonHTML}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.advanceOrderStatus = function(orderId, newStatus, buttonElement) {
    // Disable button during execution
    buttonElement.disabled = true;
    const originalText = buttonElement.textContent;
    buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Updating...`;

    fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: newStatus
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to update status on server");
        return res.json();
    })
    .then(data => {
        // Refresh all data
        loadAdminDashboardData();
    })
    .catch(err => {
        console.error("Error updating status:", err);
        alert("Could not update order status on database. Check network connection.");
        buttonElement.disabled = false;
        buttonElement.textContent = originalText;
    });
};
