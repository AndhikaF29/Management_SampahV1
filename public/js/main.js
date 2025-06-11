/**
 * File JavaScript utama untuk aplikasi Manajemen Sampah
 */

document.addEventListener('DOMContentLoaded', function () {
    // Inisialisasi tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inisialisasi popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-close alert setelah 5 detik
    setTimeout(function () {
        const alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(function (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Form setoran sampah - kalkulator harga
    const formSetoran = document.getElementById('formSetoran');
    if (formSetoran) {
        // Inisialisasi form dengan satu baris item
        tambahItemSetoran();

        // Event handler untuk tombol tambah item
        document.getElementById('btnTambahItem').addEventListener('click', function () {
            tambahItemSetoran();
        });
    }

    // Form ganti password - validasi
    const formPassword = document.getElementById('formChangePassword');
    if (formPassword) {
        formPassword.addEventListener('submit', function (event) {
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            if (newPassword !== confirmPassword) {
                event.preventDefault();
                alert('Password baru dan konfirmasi password tidak sama!');
                return false;
            }

            if (newPassword.length < 6) {
                event.preventDefault();
                alert('Password harus minimal 6 karakter!');
                return false;
            }

            return true;
        });
    }
});

/**
 * Fungsi untuk menambah item setoran sampah
 */
function tambahItemSetoran() {
    const containerItems = document.getElementById('setoranItems');
    if (!containerItems) return;

    const itemCount = containerItems.querySelectorAll('.setoran-item').length;
    const itemId = Date.now(); // Unique ID untuk item baru

    const itemHTML = `
    <div class="setoran-item card mb-3" data-item-id="${itemId}">
      <div class="card-body">
        <div class="row">
          <div class="col-md-5 mb-2">
            <label for="sampah_id_${itemId}" class="form-label">Jenis Sampah</label>
            <select class="form-control sampah-select" id="sampah_id_${itemId}" name="sampah_id" data-item-id="${itemId}" required>
              <option value="">-- Pilih Jenis Sampah --</option>
              ${getSampahOptions()}
            </select>
          </div>
          <div class="col-md-3 mb-2">
            <label for="berat_${itemId}" class="form-label">Berat (kg)</label>
            <input type="number" class="form-control sampah-berat" id="berat_${itemId}" name="berat" min="0.1" step="0.1" required 
              data-item-id="${itemId}" placeholder="Berat dalam kg">
          </div>
          <div class="col-md-3 mb-2">
            <label for="harga_satuan_${itemId}" class="form-label">Harga/kg (Rp)</label>
            <input type="number" class="form-control sampah-harga" id="harga_satuan_${itemId}" name="harga_satuan" readonly>
          </div>
          <div class="col-md-1 d-flex align-items-end mb-2">
            <button type="button" class="btn btn-danger btn-sm" onclick="hapusItemSetoran(${itemId})">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-8 offset-md-4">
            <div class="d-flex justify-content-between">
              <span class="fw-bold">Subtotal:</span>
              <span class="subtotal" id="subtotal_${itemId}">Rp 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    containerItems.insertAdjacentHTML('beforeend', itemHTML);

    // Tambahkan event listener untuk perhitungan subtotal
    const newItem = containerItems.querySelector(`[data-item-id="${itemId}"]`);
    const sampahSelect = newItem.querySelector('.sampah-select');
    const beratInput = newItem.querySelector('.sampah-berat');

    sampahSelect.addEventListener('change', function () {
        updateHargaSatuan(this.value, itemId);
        hitungSubtotal(itemId);
        hitungGrandTotal();
    });

    beratInput.addEventListener('input', function () {
        hitungSubtotal(itemId);
        hitungGrandTotal();
    });
}

/**
 * Fungsi untuk menghapus item setoran sampah
 */
function hapusItemSetoran(itemId) {
    const item = document.querySelector(`.setoran-item[data-item-id="${itemId}"]`);
    if (item) {
        // Cek jika ini adalah item terakhir
        const allItems = document.querySelectorAll('.setoran-item');
        if (allItems.length <= 1) {
            alert('Minimal harus ada satu jenis sampah!');
            return;
        }

        item.remove();
        hitungGrandTotal();
    }
}

/**
 * Fungsi untuk mendapatkan opsi sampah dari data global
 */
function getSampahOptions() {
    // Data sampah seharusnya diambil dari backend dan dirender ke dalam script
    // Ini hanya contoh statik untuk demo
    return `
    <option value="1" data-harga="3000">Botol Plastik</option>
    <option value="2" data-harga="2500">Kardus</option>
    <option value="3" data-harga="10000">Kaleng Aluminium</option>
  `;
}

/**
 * Fungsi untuk update harga satuan berdasarkan sampah yang dipilih
 */
function updateHargaSatuan(sampahId, itemId) {
    if (!sampahId) return;

    // Dalam implementasi nyata, harga didapat dari data yang dikirim dari server
    const option = document.querySelector(`#sampah_id_${itemId} option[value="${sampahId}"]`);
    if (!option) return;

    const harga = option.getAttribute('data-harga');
    document.getElementById(`harga_satuan_${itemId}`).value = harga;
}

/**
 * Fungsi untuk menghitung subtotal per item
 */
function hitungSubtotal(itemId) {
    const hargaInput = document.getElementById(`harga_satuan_${itemId}`);
    const beratInput = document.getElementById(`berat_${itemId}`);
    const subtotalElement = document.getElementById(`subtotal_${itemId}`);

    if (!hargaInput || !beratInput || !subtotalElement) return;

    const harga = parseFloat(hargaInput.value) || 0;
    const berat = parseFloat(beratInput.value) || 0;

    const subtotal = harga * berat;
    subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;

    return subtotal;
}

/**
 * Fungsi untuk menghitung grand total
 */
function hitungGrandTotal() {
    const setoranItems = document.querySelectorAll('.setoran-item');
    const grandTotalElement = document.getElementById('grandTotal');

    if (!grandTotalElement) return;

    let grandTotal = 0;
    setoranItems.forEach(item => {
        const itemId = item.getAttribute('data-item-id');
        const subtotal = hitungSubtotal(itemId) || 0;
        grandTotal += subtotal;
    });

    grandTotalElement.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    // Update hidden field untuk total
    const inputTotal = document.getElementById('total_harga');
    if (inputTotal) inputTotal.value = grandTotal;
}