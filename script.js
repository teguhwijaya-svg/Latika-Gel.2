/* ==========================================================================
   1. DATA MASTER APLIKASI (MENU & TENANT)
   Anda dapat menambah, mengubah, atau menghapus item menu di bawah ini.
   ========================================================================== */
let menuData = [
  { id: 1, name: "Nasi Goreng Spesial", tenant: "Kantin Bu Sri", price: 15000, isAvailable: true },
  { id: 2, name: "Ayam Geprek Sambal Korek", tenant: "Kantin Bu Sri", price: 13000, isAvailable: true },
  { id: 3, name: "Bakso Sapi Kuah Komplit", tenant: "Stand Bakso Pak Kumis", price: 12000, isAvailable: true },
  { id: 4, name: "Mie Ayam Yamin", tenant: "Stand Bakso Pak Kumis", price: 11000, isAvailable: false }, // Contoh stok habis
  { id: 5, name: "Es Teh Manis Jumbo", tenant: "Kedai Minuman Segar", price: 4000, isAvailable: true },
  { id: 6, name: "Jus Alpukat Kocok", tenant: "Kedai Minuman Segar", price: 8000, isAvailable: true }
];

// Keranjang Belanja Sementara
let cart = [];

// Daftar Pesanan Aktif (Simulasi Database Transaksi)
let activeOrders = [];

/* ==========================================================================
   2. INITIALISASI APLIKASI
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderMenuGrid();
  renderMerchantDashboard();
});

/* ==========================================================================
   3. LOGIKA TAMPILAN KATALOG MENU (PEMBELI)
   ========================================================================== */
// Fungsi Menampilkan Grid Kartu Menu
function renderMenuGrid(filteredData = menuData) {
  const container = document.getElementById("menu-grid-container");
  container.innerHTML = "";

  if (filteredData.length === 0) {
    container.innerHTML = `<p class="empty-state">Menu yang dicari tidak ditemukan.</p>`;
    return;
  }

  filteredData.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <div>
        <span class="menu-tenant">${item.tenant}</span>
        <h4 class="menu-title">${item.name}</h4>
        <div class="menu-price">Rp ${item.price.toLocaleString("id-ID")}</div>
      </div>
      <button 
        class="btn-add-cart ${!item.isAvailable ? 'disabled' : ''}" 
        onclick="addToCart(${item.id})"
        ${!item.isAvailable ? 'disabled' : ''}>
        ${item.isAvailable ? '<i class="fa-solid fa-plus"></i> Tambah' : 'Stok Habis'}
      </button>
    `;
    container.appendChild(card);
  });
}

// Fungsi Filter Berdasarkan Stand/Tenant
function filterByTenant(tenantName, buttonEl) {
  // Ubah status tombol aktif
  document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
  buttonEl.classList.add("active");

  if (tenantName === 'ALL') {
    renderMenuGrid(menuData);
  } else {
    const filtered = menuData.filter(item => item.tenant === tenantName);
    renderMenuGrid(filtered);
  }
}

// Fungsi Filter Berdasarkan Input Pencarian Text
function filterMenu() {
  const keyword = document.getElementById("search-input").value.toLowerCase();
  const filtered = menuData.filter(item => 
    item.name.toLowerCase().includes(keyword) || 
    item.tenant.toLowerCase().includes(keyword)
  );
  renderMenuGrid(filtered);
}

/* ==========================================================================
   4. LOGIKA KERANJANG BELANJA & CHECKOUT
   ========================================================================== */
function addToCart(menuId) {
  const item = menuData.find(m => m.id === menuId);
  if (!item || !item.isAvailable) return;

  const existing = cart.find(c => c.id === menuId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  updateCartUI();
}

function updateCartUI() {
  // Hitung Total Produk di Keranjang
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count-desktop").innerText = totalCount;
  document.getElementById("cart-count-mobile").innerText = totalCount;

  // Render Daftar Produk di Dalam Pop-up Modal Keranjang
  const cartListContainer = document.getElementById("cart-items-list");
  cartListContainer.innerHTML = "";

  let totalPrice = 0;

  if (cart.length === 0) {
    cartListContainer.innerHTML = `<p class="empty-state">Keranjang Anda masih kosong.</p>`;
  } else {
    cart.forEach(item => {
      const subtotal = item.price * item.qty;
      totalPrice += subtotal;

      const itemRow = document.createElement("div");
      itemRow.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;";
      itemRow.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          <small class="text-light">Rp ${item.price.toLocaleString("id-ID")} x ${item.qty}</small>
        </div>
        <div>
          <strong style="color:var(--accent-color)">Rp ${subtotal.toLocaleString("id-ID")}</strong>
        </div>
      `;
      cartListContainer.appendChild(itemRow);
    });
  }

  document.getElementById("cart-total-price").innerText = `Rp ${totalPrice.toLocaleString("id-ID")}`;
}

// Buka/Tutup Modal Keranjang
function toggleCartModal(show) {
  const modal = document.getElementById("cart-modal");
  if (show) {
    modal.classList.add("open");
  } else {
    modal.classList.remove("open");
  }
}

// Kirim / Submit Pesanan (Pre-Order)
function submitOrder() {
  if (cart.length === 0) {
    alert("Keranjang Anda kosong! Silakan pilih makanan terlebih dahulu.");
    return;
  }

  const pickupTime = document.getElementById("pickup-time").value;
  const paymentMethod = document.getElementById("payment-method").value;
  const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  // Buat Objek Transaksi Baru
  const newOrder = {
    id: "KTK-" + Math.floor(1000 + Math.random() * 9000), // Kode Nota Acak
    items: [...cart],
    pickupTime: pickupTime,
    paymentMethod: paymentMethod,
    total: totalAmount,
    status: "Sedang Dimasak" // Status Awal
  };

  // Simpan ke Pesanan Aktif
  activeOrders.push(newOrder);

  // Kosongkan Keranjang Belanja
  cart = [];
  updateCartUI();
  toggleCartModal(false);

  // Perbarui Tampilan Sisi Pembeli dan Sisi Penjual
  renderActiveOrders();
  renderMerchantDashboard();

  alert("Pesanan berhasil dikirim! Silakan periksa status di bagian 'Pesanan Aktif'.");
}

/* ==========================================================================
   5. LOGIKA PESANAN AKTIF (SISI SISWA)
   ========================================================================== */
function renderActiveOrders() {
  const container = document.getElementById("active-orders-container");
  container.innerHTML = "";

  if (activeOrders.length === 0) {
    container.innerHTML = `<p class="empty-state">Belum ada pesanan aktif.</p>`;
    return;
  }

  activeOrders.forEach(order => {
    const isReady = order.status === "Siap Diambil";
    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <strong>ID Nota: ${order.id}</strong>
        <span class="status-badge ${isReady ? 'ready' : ''}">${order.status}</span>
      </div>
      <p style="font-size:0.85rem; margin-top:4px; color:var(--text-light)">
        Jadwal Ambil: <b>${order.pickupTime}</b>
      </p>
      <ul style="margin: 8px 0 8px 20px; font-size:0.9rem;">
        ${order.items.map(i => `<li>${i.name} (x${i.qty})</li>`).join("")}
      </ul>
      <div style="font-size:0.85rem;">Metode Bayar: ${order.paymentMethod}</div>
    `;
    container.appendChild(card);
  });
}

/* ==========================================================================
   6. LOGIKA DASHBOARD TENANT / PENJUAL
   ========================================================================== */
function renderMerchantDashboard() {
  // 1. Render Sakelar Kelola Stok
  const stockContainer = document.getElementById("merchant-stock-list");
  stockContainer.innerHTML = "";

  menuData.forEach(item => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;";
    row.innerHTML = `
      <span>${item.name} (${item.tenant})</span>
      <button 
        style="padding:6px 12px; border-radius:6px; border:none; cursor:pointer; background:${item.isAvailable ? '#2ecc71' : '#e74c3c'}; color:white;"
        onclick="toggleStockStatus(${item.id})">
        ${item.isAvailable ? 'Status: Ready' : 'Status: Habis'}
      </button>
    `;
    stockContainer.appendChild(row);
  });

  // 2. Render Daftar Pesanan Masuk Pelanggan
  const merchantOrderContainer = document.getElementById("merchant-order-list");
  merchantOrderContainer.innerHTML = "";

  if (activeOrders.length === 0) {
    merchantOrderContainer.innerHTML = `<p class="empty-state">Belum ada pesanan yang masuk.</p>`;
    return;
  }

  activeOrders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <strong>${order.id} - Total: Rp ${order.total.toLocaleString("id-ID")}</strong>
        <span class="status-badge">${order.status}</span>
      </div>
      <p style="font-size:0.85rem; margin-top:4px;">Target Pengambilan: <b>${order.pickupTime}</b></p>
      <ul style="margin: 8px 0 8px 20px; font-size:0.9rem;">
        ${order.items.map(i => `<li>${i.name} x${i.qty}</li>`).join("")}
      </ul>
      <button 
        class="btn-primary" 
        style="margin-top:8px; width:100%;" 
        onclick="advanceOrderStatus('${order.id}')">
        ${order.status === 'Sedang Dimasak' ? 'Tandai "Siap Diambil"' : 'Tandai "Selesai/Diambil"'}
      </button>
    `;
    merchantOrderContainer.appendChild(card);
  });
}

// Mengubah Status Ready/Habis Makanan
function toggleStockStatus(id) {
  const item = menuData.find(m => m.id === id);
  if (item) {
    item.isAvailable = !item.isAvailable;
    renderMenuGrid();
    renderMerchantDashboard();
  }
}

// Memperbarui Status Pesanan dari Sisi Dapur Kantin
function advanceOrderStatus(orderId) {
  const order = activeOrders.find(o => o.id === orderId);
  if (order) {
    if (order.status === "Sedang Dimasak") {
      order.status = "Siap Diambil";
    } else {
      // Jika sudah selesai/diambil, hapus dari antrean aktif
      activeOrders = activeOrders.filter(o => o.id !== orderId);
    }
    renderActiveOrders();
    renderMerchantDashboard();
  }
}

/* ==========================================================================
   7. FUNGSI SAKELAR PERAN (SISWA / TENANT)
   ========================================================================== */
function switchRole(role) {
  const buyerSection = document.getElementById("buyer-section");
  const merchantSection = document.getElementById("merchant-section");
  const btnSiswa = document.getElementById("btn-siswa");
  const btnTenant = document.getElementById("btn-tenant");

  if (role === 'siswa') {
    buyerSection.classList.remove("hidden");
    merchantSection.classList.add("hidden");
    btnSiswa.classList.add("active");
    btnTenant.classList.remove("active");
  } else {
    buyerSection.classList.add("hidden");
    merchantSection.classList.remove("hidden");
    btnSiswa.classList.remove("active");
    btnTenant.classList.add("active");
  }
}
