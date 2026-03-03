/**
 * OshiiHub Client-side Order System Logic
 * Uses localStorage for a mock backend and cross-tab real-time sync.
 */

/*
   Mock Backend using LocalStorage
*/
const STORAGE_KEY = 'oshiihub_orders';

const MockBackend = {
    getOrders: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse orders", e);
            return [];
        }
    },
    saveOrders: (orders) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        // Manually trigger app sync for the tab that made the change
        // (window 'storage' event only fires in *other* tabs)
        app.syncOrdersFromStorage();
    },
    createOrder: (orderData) => {
        const orders = MockBackend.getOrders();
        const newOrder = {
            orderId: 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            ...orderData,
            status: 'received',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        orders.unshift(newOrder); // Add to top
        MockBackend.saveOrders(orders);
        return newOrder;
    },
    updateOrderStatus: (orderId, newStatus) => {
        const orders = MockBackend.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = Date.now();
            MockBackend.saveOrders(orders);
        }
    }
};

/*
   Application Logic
*/
const app = {
    role: null,
    cart: [],
    menuData: {
        'Ramen': ramens, // Note: referencing arrays from foods.js
        'Sushi': sushi,
        'Tonkatsu': tonkatsu,
        'Onigiri': onigiri
    },
    currentCategory: 'Ramen',
    activeCustomerOrderId: null,
    
    // Modal State
    modalItem: null,
    modalQty: 1,
    
    // Admin state
    adminOrders: [],

    init() {
        this.bindEvents();
        // Listen to localStorage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                this.syncOrdersFromStorage();
            }
        });
        
        // Initial sync
        this.syncOrdersFromStorage();

        // Check for role deep-link
        const params = new URLSearchParams(window.location.search);
        const urlRole = params.get('role');
        if (urlRole === 'customer') {
            this.setRole('customer');
            window.history.replaceState({}, '', window.location.pathname);
        } else {
            // Default to showing the admin login form if no role is explicitly passed
            this.showAdminLogin();
            window.history.replaceState({}, '', window.location.pathname);
        }
    },

    bindEvents() {
        // Table number change updates active order context if needed, but not critical
    },

    setRole(role) {
        this.role = role;
        document.getElementById('role-selector').classList.remove('view-active');
        document.getElementById('customer-view').classList.add('view-hidden');
        document.getElementById('admin-view').classList.add('view-hidden');
        
        document.getElementById('role-selector').classList.add('view-hidden');
        
        if (role === 'customer') {
            document.getElementById('customer-view').classList.remove('view-hidden');
            document.getElementById('customer-view').classList.add('view-active');
            this.renderCustomerMenu();
            this.renderCart();
            this.checkActiveOrder();
        } else if (role === 'admin') {
            document.getElementById('admin-view').classList.remove('view-hidden');
            document.getElementById('admin-view').classList.add('view-active');
            this.renderAdminDashboard();
        } else {
            // Role reset
            document.getElementById('role-selector').classList.remove('view-hidden');
            document.getElementById('role-selector').classList.add('view-active');
            // Reset login view
            this.hideAdminLogin(); 
        }
    },

    // --- Admin Authentication ---
    showAdminLogin() {
        document.getElementById('role-initial-buttons').classList.add('hidden');
        document.getElementById('admin-login-form').classList.remove('hidden');
        document.getElementById('admin-error-msg').classList.add('hidden');
        document.getElementById('admin-pin').value = '';
        document.getElementById('admin-pin').focus();
    },

    hideAdminLogin() {
        document.getElementById('admin-login-form').classList.add('hidden');
        document.getElementById('role-initial-buttons').classList.remove('hidden');
    },

    verifyAdminLogin() {
        const pin = document.getElementById('admin-pin').value;
        // Mock hardcoded PIN validation
        if (pin === '101103') {
            this.setRole('admin');
            document.getElementById('admin-error-msg').classList.add('hidden');
        } else {
            document.getElementById('admin-error-msg').classList.remove('hidden');
            document.getElementById('admin-pin').value = '';
            document.getElementById('admin-pin').focus();
        }
    },

    // --- Customer Flow ---
    renderCustomerMenu() {
        const catContainer = document.getElementById('menu-categories');
        const itemsContainer = document.getElementById('menu-items');
        
        // Render Categories
        catContainer.innerHTML = '';
        Object.keys(this.menuData).forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-btn ${this.currentCategory === cat ? 'active' : ''}`;
            btn.innerText = cat;
            btn.onclick = () => {
                this.currentCategory = cat;
                this.renderCustomerMenu(); // re-render
            };
            catContainer.appendChild(btn);
        });

        // Render Items
        itemsContainer.innerHTML = '';
        const items = this.menuData[this.currentCategory] || [];
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.onclick = () => this.openItemModal(item);
            
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/Foods/Reman.png'">
                <div class="menu-card-content">
                    <div class="menu-card-title">${item.name}</div>
                    <div class="menu-card-desc">${item.title}</div>
                    <div class="menu-card-footer">
                        <span class="menu-card-price">₹${item.price}</span>
                        <button class="btn btn-primary sm">+</button>
                    </div>
                </div>
            `;
            itemsContainer.appendChild(card);
        });
    },

    openItemModal(item) {
        this.modalItem = item;
        this.modalQty = 1;
        
        document.getElementById('modal-img').src = item.image || 'images/Foods/Reman.png';
        document.getElementById('modal-title').innerText = item.name;
        document.getElementById('modal-desc').innerText = item.title;
        document.getElementById('modal-price').innerText = `₹${item.price}`;
        document.getElementById('modal-qty').innerText = this.modalQty;
        
        // Reset checkboxes
        const checkboxes = document.querySelectorAll('#item-modal input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        
        document.getElementById('item-modal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('item-modal').classList.add('hidden');
        this.modalItem = null;
    },

    updateModalQty(delta) {
        this.modalQty += delta;
        if (this.modalQty < 1) this.modalQty = 1;
        document.getElementById('modal-qty').innerText = this.modalQty;
    },

    addToCart() {
        if (!this.modalItem) return;
        
        // Get elected modifiers
        const checkboxes = document.querySelectorAll('#item-modal input[type="checkbox"]:checked');
        const modifiers = Array.from(checkboxes).map(cb => cb.value);
        
        // Check if identical item+modifiers exists in cart
        const existingIdx = this.cart.findIndex(i => 
            i.name === this.modalItem.name && 
            JSON.stringify(i.modifiers) === JSON.stringify(modifiers)
        );

        if (existingIdx > -1) {
            this.cart[existingIdx].quantity += this.modalQty;
        } else {
            this.cart.push({
                name: this.modalItem.name,
                price: this.modalItem.price,
                quantity: this.modalQty,
                modifiers: modifiers
            });
        }
        
        this.closeModal();
        this.renderCart();
    },

    renderCart() {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        
        let total = 0;
        let count = 0;
        
        this.cart.forEach((item, index) => {
            // Note: Not parsing modifier prices dynamically for this MVP, just using base price
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            count += item.quantity;
            
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-header">
                    <span class="cart-item-title">${item.name}</span>
                    <span>₹${itemTotal}</span>
                </div>
                ${item.modifiers.length ? `<div class="cart-item-mods">${item.modifiers.join(', ')}</div>` : ''}
                <div class="cart-item-controls">
                    <div class="qty-controls">
                        <button onclick="app.updateCartQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="app.updateCartQty(${index}, 1)">+</button>
                    </div>
                    <button class="btn btn-secondary sm" onclick="app.removeCartItem(${index})">Remove</button>
                </div>
            `;
            container.appendChild(div);
        });
        
        document.getElementById('cart-count').innerText = `(${count})`;
        document.getElementById('cart-total-price').innerText = `₹${total}`;
        
        document.getElementById('btn-submit-order').disabled = this.cart.length === 0;
    },

    updateCartQty(index, delta) {
        this.cart[index].quantity += delta;
        if (this.cart[index].quantity < 1) {
            this.removeCartItem(index);
        } else {
            this.renderCart();
        }
    },

    removeCartItem(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    },

    submitOrder() {
        if (this.cart.length === 0) return;
        
        const tableNum = document.getElementById('table-num').value || "1";
        
        const orderData = {
            tableNumber: tableNum,
            items: [...this.cart],
            total: document.getElementById('cart-total-price').innerText
        };
        
        const newOrder = MockBackend.createOrder(orderData);
        this.activeCustomerOrderId = newOrder.orderId;
        
        // Clear cart
        this.cart = [];
        this.renderCart();
        this.checkActiveOrder();
        
        alert(`Order placed successfully! ID: ${newOrder.orderId}`);
    },

    checkActiveOrder() {
        if (!this.activeCustomerOrderId) return;
        
        const banner = document.getElementById('customer-status-banner');
        // Find order in DB
        const orders = MockBackend.getOrders();
        const order = orders.find(o => o.orderId === this.activeCustomerOrderId);
        
        if (order) {
            document.getElementById('banner-order-id').innerText = `#${order.orderId} (Table ${order.tableNumber})`;
            
            let statusText = order.status.replace('_', ' ').toUpperCase();
            document.getElementById('banner-order-status').innerText = statusText;
            
            const timeStr = new Date(order.updatedAt).toLocaleTimeString();
            document.getElementById('banner-order-time').innerText = `Last updated: ${timeStr}`;
            
            banner.classList.remove('hidden');
            
            // Highlight coloring
            banner.style.borderLeftColor = 
                order.status === 'received' ? 'var(--primary)' :
                order.status === 'in_progress' ? 'var(--warning)' :
                order.status === 'ready' ? 'var(--success)' : 'var(--text-muted)';
                
            if (order.status === 'completed') {
                setTimeout(() => {
                    banner.classList.add('hidden');
                    this.activeCustomerOrderId = null;
                }, 10000); // hide after 10 seconds of completion
            }
        }
    },

    // --- Admin Flow ---
    syncOrdersFromStorage() {
        this.adminOrders = MockBackend.getOrders();
        
        // If we are currently in admin view, re-render
        if (this.role === 'admin') {
            this.renderAdminDashboard();
        }
        
        // If we are customer, check if our order was updated
        if (this.role === 'customer') {
            this.checkActiveOrder();
        }
    },

    renderAdminDashboard() {
        const container = document.getElementById('admin-orders');
        container.innerHTML = '';
        
        // Filters
        const keyword = document.getElementById('filter-keyword').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status').value;
        
        // Apply filters
        let filteredOrders = this.adminOrders.filter(o => {
            if (statusFilter !== 'all' && o.status !== statusFilter) return false;
            
            // Simple keyword search on orderId or table number
            if (keyword && !o.orderId.toLowerCase().includes(keyword) && !o.tableNumber.toString().includes(keyword)) {
                return false;
            }
            return true;
        });
        
        if (filteredOrders.length === 0) {
            container.innerHTML = '<p>No orders found matching criteria.</p>';
            return;
        }

        filteredOrders.forEach(order => {
            const dateStr = new Date(order.createdAt).toLocaleTimeString();
            
            const card = document.createElement('div');
            card.className = `order-card status-${order.status}`;
            
            let itemsHtml = order.items.map(i => `
                <div class="order-item-line">
                    <span>${i.quantity}x ${i.name}</span>
                </div>
                ${i.modifiers.length ? `<div class="order-item-mods">${i.modifiers.join(', ')}</div>` : ''}
            `).join('');

            // Action buttons based on status
            let actionsHtml = '';
            if (order.status === 'received') {
                actionsHtml = `<button class="btn btn-warning sm" onclick="app.updateAdminOrderStatus('${order.orderId}', 'in_progress')" style="background:var(--warning);color:#000">Start Preparing</button>`;
            } else if (order.status === 'in_progress') {
                actionsHtml = `<button class="btn btn-success sm" onclick="app.updateAdminOrderStatus('${order.orderId}', 'ready')" style="background:var(--success)">Mark Ready</button>`;
            } else if (order.status === 'ready') {
                actionsHtml = `<button class="btn btn-secondary sm" onclick="app.updateAdminOrderStatus('${order.orderId}', 'completed')">Complete</button>`;
            }
            
            card.innerHTML = `
                <div class="order-header">
                    <span class="order-id">#${order.orderId}</span>
                    <span class="order-table">Table ${order.tableNumber}</span>
                </div>
                <div class="order-meta">
                    Time: ${dateStr} • Status: <strong>${order.status.replace('_', ' ').toUpperCase()}</strong>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                <div class="order-actions">
                    ${actionsHtml}
                </div>
            `;
            
            container.appendChild(card);
        });
    },

    updateAdminOrderStatus(orderId, newStatus) {
        MockBackend.updateOrderStatus(orderId, newStatus);
    }
};

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
