/**
 * Orígenes Kicks - Frontend JavaScript
 * 
 * Maneja:
 * - Carga de productos desde el backend
 * - Carrito de compras con persistencia
 * - Sistema de autenticación
 * - Checkout completo con facturación DIAN
 * - UI/UX y notificaciones
 */

const API_BASE = "/api/v1";

// ============================================
// ESTADO GLOBAL
// ============================================

let state = {
  user: null,
  token: localStorage.getItem("orkicks-token") || null,
  cart: JSON.parse(localStorage.getItem("orkicks-cart") || "[]"),
  products: [],
  currentFilter: "all",
  checkoutData: {}
};

// ============================================
// UTILIDADES
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);
};

const showToast = (message, type = "success", duration = 3000) => {
  const container = $("#toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" ? "check-circle" : 
               type === "error" ? "exclamation-circle" : 
               "exclamation-triangle";
  
  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("fadeOut");
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ============================================
// API HELPERS
// ============================================

const api = {
  async request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    
    if (state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include"
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error en la solicitud");
      }
      
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  
  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  },
  
  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },
  
  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },
  
  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
};

// ============================================
// PRODUCTOS
// ============================================

async function loadProducts() {
  try {
    const response = await api.get("/products");
    state.products = response.data || [];
    renderProducts();
  } catch (error) {
    console.error("Error al cargar productos:", error);
    $("#productsGrid").innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-exclamation-circle"></i>
        <p>No se pudieron cargar los productos</p>
        <button class="btn-secondary mt-20" onclick="loadProducts()">Reintentar</button>
      </div>
    `;
    
    // Fallback: usar productos de ejemplo si el backend no responde
    loadSampleProducts();
  }
}

function loadSampleProducts() {
  // Productos de muestra mientras se inicia el backend
  state.products = [
    {
      id: "1",
      name: "Nike Air Max 270",
      description: "Zapatilla deportiva con amortiguación premium",
      basePrice: 350000,
      category: "deportivo",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      variants: [
        { id: "v1", size: "38", color: "Negro/Rojo", stock: 5, sku: "NK-AM270-38" },
        { id: "v2", size: "39", color: "Negro/Rojo", stock: 8, sku: "NK-AM270-39" },
        { id: "v3", size: "40", color: "Negro/Rojo", stock: 3, sku: "NK-AM270-40" }
      ]
    },
    {
      id: "2",
      name: "Adidas Superstar",
      description: "Clásico urbano con puntera de concha",
      basePrice: 280000,
      category: "casual",
      imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400",
      variants: [
        { id: "v4", size: "37", color: "Blanco", stock: 6, sku: "AD-SS-37" },
        { id: "v5", size: "38", color: "Blanco", stock: 9, sku: "AD-SS-38" }
      ]
    },
    {
      id: "3",
      name: "Zapato Formal Oxford",
      description: "Elegancia para ocasiones especiales",
      basePrice: 420000,
      category: "formal",
      imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400",
      variants: [
        { id: "v6", size: "40", color: "Negro", stock: 4, sku: "OX-NEG-40" },
        { id: "v7", size: "41", color: "Negro", stock: 7, sku: "OX-NEG-41" }
      ]
    },
    {
      id: "4",
      name: "Bota Timberland",
      description: "Resistente y duradera para el día a día",
      basePrice: 550000,
      category: "bota",
      imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400",
      variants: [
        { id: "v8", size: "39", color: "Café", stock: 5, sku: "TB-CAF-39" },
        { id: "v9", size: "40", color: "Café", stock: 6, sku: "TB-CAF-40" }
      ]
    },
    {
      id: "5",
      name: "Puma RS-X",
      description: "Diseño retrofuturista con estilo único",
      basePrice: 320000,
      category: "deportivo",
      imageUrl: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400",
      variants: [
        { id: "v10", size: "38", color: "Azul/Blanco", stock: 4, sku: "PM-RSX-38" },
        { id: "v11", size: "39", color: "Azul/Blanco", stock: 5, sku: "PM-RSX-39" }
      ]
    },
    {
      id: "6",
      name: "Vans Old Skool",
      description: "Icónico estilo skater",
      basePrice: 250000,
      category: "casual",
      imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
      variants: [
        { id: "v12", size: "37", color: "Negro/Blanco", stock: 8, sku: "VN-OS-37" },
        { id: "v13", size: "38", color: "Negro/Blanco", stock: 10, sku: "VN-OS-38" }
      ]
    }
  ];
  renderProducts();
}

function renderProducts() {
  const grid = $("#productsGrid");
  const filtered = state.currentFilter === "all" 
    ? state.products 
    : state.products.filter(p => p.category === state.currentFilter);
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-box-open"></i>
        <p>No hay productos en esta categoría</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filtered.map((product, index) => {
    const variant = product.variants?.[0] || {};
    const image = product.imageUrl || `https://via.placeholder.com/400x300/1a1a2e/e94560?text=${encodeURIComponent(product.name)}`;
    
    return `
      <div class="product-card" style="animation-delay: ${index * 0.1}s">
        <div class="product-image">
          <img src="${image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/1a1a2e/e94560?text=${encodeURIComponent(product.name)}'">
          ${product.category ? `<span class="product-badge">${product.category}</span>` : ""}
        </div>
        <div class="product-info">
          <div class="product-category">${product.category || "general"}</div>
          <h3 class="product-name">${product.name}</h3>
          <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 12px;">${product.description || ""}</p>
          
          <div class="product-sizes">
            ${(product.variants || []).slice(0, 4).map(v => `
              <span class="size-tag">${v.size}</span>
            `).join("")}
            ${(product.variants || []).length > 4 ? `<span class="size-tag">+${product.variants.length - 4}</span>` : ""}
          </div>
          
          <div class="product-price">
            <span class="price-current">${formatCurrency(product.basePrice)}</span>
          </div>
          
          <div class="product-actions">
            <button class="btn-add-cart" onclick="addToCart('${product.id}')">
              <i class="fas fa-cart-plus"></i> Agregar
            </button>
            <button class="btn-quick-view" onclick="quickView('${product.id}')" title="Vista rápida">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function quickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  // Mostrar modal con detalles y selector de talla
  const sizes = (product.variants || []).filter(v => v.stock > 0);
  
  if (sizes.length === 0) {
    showToast("Producto sin stock disponible", "warning");
    return;
  }
  
  const sizesHTML = sizes.map(v => `
    <button class="size-tag" style="cursor:pointer; padding: 8px 16px;" 
            onclick="selectSize('${productId}', '${v.id}', '${v.size}', '${v.color}')">
      ${v.size} - ${v.color}
    </button>
  `).join("");
  
  const modal = $(`
    <div class="modal active" id="quickViewModal">
      <div class="modal-content">
        <button class="modal-close" onclick="closeModal('quickViewModal')">&times;</button>
        <h2>${product.name}</h2>
        <p style="color: var(--color-text-muted); margin: 10px 0;">${product.description}</p>
        <p style="font-size: 1.5rem; color: var(--color-accent); font-weight: 700; margin: 15px 0;">
          ${formatCurrency(product.basePrice)}
        </p>
        <h3 style="margin: 20px 0 10px;">Selecciona tu talla:</h3>
        <div style="display:flex; flex-wrap: wrap; gap: 8px;">
          ${sizesHTML}
        </div>
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
}

window.selectSize = (productId, variantId, size, color) => {
  addToCart(productId, variantId, size, color);
  closeModal("quickViewModal");
};

// ============================================
// CARRITO
// ============================================

function addToCart(productId, variantId = null, size = null, color = null) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  // Si no se especificó variante, tomar la primera disponible
  if (!variantId) {
    const firstVariant = (product.variants || []).find(v => v.stock > 0);
    if (!firstVariant) {
      showToast("Sin stock disponible", "warning");
      return;
    }
    variantId = firstVariant.id;
    size = firstVariant.size;
    color = firstVariant.color;
  }
  
  // Verificar si ya está en el carrito
  const existing = state.cart.find(item => 
    item.productId === productId && item.variantId === variantId
  );
  
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      productId,
      variantId,
      name: product.name,
      price: parseFloat(product.basePrice),
      size,
      color,
      image: product.imageUrl,
      quantity: 1
    });
  }
  
  saveCart();
  renderCart();
  showToast(`${product.name} (${size}) agregado al carrito`);
}

function updateCartQuantity(index, delta) {
  const item = state.cart[index];
  if (!item) return;
  
  item.quantity += delta;
  
  if (item.quantity <= 0) {
    state.cart.splice(index, 1);
  }
  
  saveCart();
  renderCart();
}

function removeFromCart(index) {
  const item = state.cart[index];
  state.cart.splice(index, 1);
  saveCart();
  renderCart();
  showToast(`${item?.name || "Producto"} eliminado del carrito`, "warning");
}

function saveCart() {
  localStorage.setItem("orkicks-cart", JSON.stringify(state.cart));
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
  const container = $("#cartItems");
  const footer = $("#cartFooter");
  const countEl = $(".cart-count");
  
  countEl.textContent = getCartCount();
  
  if (state.cart.length === 0) {
    container.innerHTML = '<p class="empty-cart"><i class="fas fa-shopping-basket" style="font-size: 3rem; color: var(--color-border); margin-bottom: 15px; display: block;"></i>Tu carrito está vacío</p>';
    footer.style.display = "none";
    return;
  }
  
  footer.style.display = "block";
  $("#cartSubtotal").textContent = formatCurrency(getCartTotal());
  $("#cartTotal").textContent = formatCurrency(getCartTotal() + 15000); // + envío
  
  container.innerHTML = state.cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>Talla: ${item.size} | ${item.color}</p>
        <div class="quantity-controls" style="margin-top: 8px;">
          <button class="qty-btn" onclick="updateCartQuantity(${index}, -1)">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
        </div>
      </div>
      <div class="cart-item-price">
        <strong>${formatCurrency(item.price * item.quantity)}</strong>
        <button class="remove-item" onclick="removeFromCart(${index})" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

// ============================================
// CHECKOUT
// ============================================

function openCheckout() {
  if (state.cart.length === 0) {
    showToast("Tu carrito está vacío", "warning");
    return;
  }
  
  closeModal("cartModal");
  $("#checkoutModal").classList.add("active");
  goToCheckoutStep(1);
}

window.openCheckout = openCheckout;

function goToCheckoutStep(step) {
  // Ocultar todos los formularios
  ["checkoutStep1", "checkoutStep2", "checkoutStep3"].forEach(id => {
    $(`#${id}`).style.display = "none";
  });
  
  // Mostrar el formulario actual
  $(`#checkoutStep${step}`).style.display = "block";
  
  // Actualizar indicadores
  $$(".step").forEach(el => {
    const stepNum = parseInt(el.dataset.step);
    el.classList.remove("active", "completed");
    if (stepNum === step) el.classList.add("active");
    else if (stepNum < step) el.classList.add("completed");
  });
  
  // Si es el paso 3, actualizar resumen
  if (step === 3) {
    updateCheckoutSummary();
  }
}

function updateCheckoutSummary() {
  const summary = $("#checkoutSummary");
  const total = getCartTotal();
  
  summary.innerHTML = state.cart.map(item => `
    <div class="summary-item">
      <span>${item.name} (${item.size}) x${item.quantity}</span>
      <strong>${formatCurrency(item.price * item.quantity)}</strong>
    </div>
  `).join("") + `
    <div class="summary-item">
      <span>Envío</span>
      <strong>${formatCurrency(15000)}</strong>
    </div>
  `;
  
  $("#checkoutTotal").textContent = formatCurrency(total + 15000);
}

async function confirmOrder() {
  const form1 = $("#checkoutStep1");
  const form2 = $("#checkoutStep2");
  const form3 = $("#checkoutStep3");
  
  const customerData = new FormData(form1);
  const shippingData = new FormData(form2);
  const paymentData = new FormData(form3);
  
  // Combinar datos
  const orderData = {
    ...Object.fromEntries(customerData),
    ...Object.fromEntries(shippingData),
    ...Object.fromEntries(paymentData),
    items: state.cart.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity
    }))
  };
  
  // Validar
  if (!orderData.customerId || !orderData.customerName || !orderData.customerEmail) {
    showToast("Completa todos los datos requeridos", "error");
    goToCheckoutStep(1);
    return;
  }
  
  // Mostrar loading
  const confirmBtn = $("#confirmOrder");
  const originalText = confirmBtn.innerHTML;
  confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  confirmBtn.disabled = true;
  
  try {
    // 1. Crear pedido
    const orderResponse = await api.post("/orders", orderData);
    const orderId = orderResponse.data.id;
    
    // 2. Generar factura
    const invoiceResponse = await api.post(`/invoices/from-order/${orderId}`, {
      customerIdType: orderData.customerIdType,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod
    });
    
    // 3. Mostrar confirmación
    showOrderConfirmation(invoiceResponse.data);
    
    // 4. Limpiar carrito
    state.cart = [];
    saveCart();
    renderCart();
    
  } catch (error) {
    console.error("Error al confirmar pedido:", error);
    showToast(error.message || "Error al procesar el pedido", "error");
  } finally {
    confirmBtn.innerHTML = originalText;
    confirmBtn.disabled = false;
  }
}

function showOrderConfirmation(invoice) {
  closeModal("checkoutModal");
  $("#confirmationModal").classList.add("active");
  
  $("#invoiceNumber").textContent = invoice.fullNumber;
  $("#invoiceCufe").textContent = invoice.cufe || "Generando...";
}

async function viewInvoice() {
  // En una implementación completa, esto descargaría un PDF
  showToast("Función de descarga de PDF - Próximamente", "warning");
  
  // Por ahora, mostrar la factura en una nueva ventana
  try {
    const response = await api.get(`/invoices/${$("#invoiceNumber").textContent.trim()}/full`);
    const invoiceHtml = generateInvoiceHTML(response.data);
    const newWindow = window.open("", "_blank");
    newWindow.document.write(invoiceHtml);
    newWindow.document.close();
  } catch (error) {
    console.error("Error al ver factura:", error);
  }
}

function generateInvoiceHTML(data) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${data.fullNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; }
        h1 { color: #1a1a2e; }
        .cufe { font-family: monospace; font-size: 11px; word-break: break-all; background: #f5f5f5; padding: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Orígenes Kicks</h1>
          <p>NIT: ${data.store?.nit || "N/A"}</p>
          <p>${data.store?.address || ""}</p>
        </div>
        <div>
          <h2>FACTURA ${data.fullNumber}</h2>
          <p>Fecha: ${new Date(data.issueDate).toLocaleDateString("es-CO")}</p>
        </div>
      </div>
      <h3>Cliente: ${data.customerName}</h3>
      <p>${data.customerIdType}: ${data.customerId}</p>
      <table border="1" cellpadding="10" style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #1a1a2e; color: white;">
          <th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th>
        </tr>
        ${data.items.map(item => `
          <tr>
            <td>${item.productName} (${item.size || ""})</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>${formatCurrency(item.lineTotal)}</td>
          </tr>
        `).join("")}
      </table>
      <p>Subtotal: ${formatCurrency(data.subtotal)}</p>
      <p>IVA: ${formatCurrency(data.taxAmount)}</p>
      <h2 style="color: #e94560;">TOTAL: ${formatCurrency(data.totalAmount)}</h2>
      <div class="cufe"><strong>CUFE:</strong> ${data.cufe}</div>
    </body>
    </html>
  `;
}

// ============================================
// AUTENTICACIÓN
// ============================================

async function login(email, password) {
  try {
    const response = await api.post("/auth/login", { email, password });
    state.token = response.token;
    state.user = response.data;
    localStorage.setItem("orkicks-token", state.token);
    closeModal("authModal");
    showToast(`Bienvenido, ${state.user.name}`);
    updateAuthButton();
  } catch (error) {
    showToast(error.message || "Error al iniciar sesión", "error");
  }
}

async function register(name, email, password) {
  try {
    const response = await api.post("/auth/register", { name, email, password });
    state.token = response.token;
    state.user = response.data;
    localStorage.setItem("orkicks-token", state.token);
    closeModal("authModal");
    showToast("Registro exitoso. ¡Bienvenido!");
    updateAuthButton();
  } catch (error) {
    showToast(error.message || "Error al registrarse", "error");
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("orkicks-token");
  updateAuthButton();
  showToast("Sesión cerrada");
}

function updateAuthButton() {
  const btn = $("#authButton span");
  if (state.user) {
    btn.textContent = state.user.name.split(" ")[0];
  } else {
    btn.textContent = "Cuenta";
  }
}

async function checkAuth() {
  if (!state.token) return;
  
  try {
    const response = await api.get("/auth/me");
    state.user = response.data;
    updateAuthButton();
  } catch (error) {
    // Token inválido
    logout();
  }
}

// ============================================
// MODALES
// ============================================

function openModal(id) {
  $(`#${id}`).classList.add("active");
}

function closeModal(id) {
  $(`#${id}`).classList.remove("active");
}

window.closeModal = closeModal;
window.openModal = openModal;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.quickView = quickView;
window.viewInvoice = viewInvoice;

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos iniciales
  loadProducts();
  renderCart();
  checkAuth();
  updateAuthButton();
  
  // Filtros
  $$(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });
  
  // Carrito
  $("#cartButton").addEventListener("click", () => openModal("cartModal"));
  
  // Auth
  $("#authButton").addEventListener("click", () => {
    if (state.user) {
      if (confirm("¿Cerrar sesión?")) logout();
    } else {
      openModal("authModal");
    }
  });
  
  // Cerrar modales
  $$("[data-close]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(btn.dataset.close);
    });
  });
  
  // Click fuera del modal cierra
  $$(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });
  
  // Tabs de auth
  $$(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$(".auth-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      if (tab.dataset.tab === "login") {
        $("#loginForm").style.display = "block";
        $("#registerForm").style.display = "none";
      } else {
        $("#loginForm").style.display = "none";
        $("#registerForm").style.display = "block";
      }
    });
  });
  
  // Submit de login
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    login(data.get("email"), data.get("password"));
  });
  
  // Submit de registro
  $("#registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    register(data.get("name"), data.get("email"), data.get("password"));
  });
  
  // Checkout
  $("#checkoutButton").addEventListener("click", openCheckout);
  $("#nextToStep2").addEventListener("click", () => goToCheckoutStep(2));
  $("#nextToStep3").addEventListener("click", () => goToCheckoutStep(3));
  $("#backToStep1").addEventListener("click", () => goToCheckoutStep(1));
  $("#backToStep2").addEventListener("click", () => goToCheckoutStep(2));
  $("#confirmOrder").addEventListener("click", confirmOrder);
  $("#viewInvoice").addEventListener("click", viewInvoice);
  
  // Smooth scroll
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  
  console.log("%c🚀 Orígenes Kicks", "color: #e94560; font-size: 20px; font-weight: bold;");
  console.log("Sistema con facturación electrónica DIAN");
});
