-- Membuat database jika belum ada
CREATE DATABASE IF NOT EXISTS manajemen_sampah;
USE manajemen_sampah;

-- Tabel pengguna untuk autentikasi
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  alamat TEXT,
  no_telp VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Tabel kategori sampah
CREATE TABLE IF NOT EXISTS kategori_sampah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel sampah
CREATE TABLE IF NOT EXISTS sampah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kategori_id INT NOT NULL,
  harga_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori_sampah(id) ON DELETE CASCADE,
  INDEX idx_kategori (kategori_id)
);

-- Tabel setoran sampah
CREATE TABLE IF NOT EXISTS setoran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tanggal DATE NOT NULL,
  status ENUM('menunggu', 'diproses', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'menunggu',
  total_harga DECIMAL(10,2) NOT NULL DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_tanggal (tanggal)
);

-- Tabel detail setoran sampah
CREATE TABLE IF NOT EXISTS detail_setoran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setoran_id INT NOT NULL,
  sampah_id INT NOT NULL,
  berat DECIMAL(10,2) NOT NULL,
  harga_satuan DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (setoran_id) REFERENCES setoran(id) ON DELETE CASCADE,
  FOREIGN KEY (sampah_id) REFERENCES sampah(id) ON DELETE CASCADE,
  INDEX idx_setoran (setoran_id),
  INDEX idx_sampah (sampah_id)
);

-- Tambahkan admin default
INSERT INTO users (nama, email, password, role, alamat)
VALUES ('Administrator', 'admin@manajemensampah.com', '$2a$12$D.8GjwYo20Rz6IHZvLHBaOmC8yyO9DeQIRPpvDODr6NzbJYnQfGyO', 'admin', 'Kantor Pusat Manajemen Sampah'); 
-- Password: admin123 (bcrypt hash)

-- Tambahkan user default
INSERT INTO users (nama, email, password, role, alamat)
VALUES ('Pengguna', 'user@manajemensampah.com', '$2a$12$22iJFozI5wYRMpTPXeYUmenLeoAkT1NJYXcuSJc/ZFaciiN.CeVqO', 'user', 'Jalan Contoh No. 123');
-- Password: user123 (bcrypt hash)

-- Tambahkan kategori sampah
INSERT INTO kategori_sampah (nama, deskripsi) VALUES
('Organik', 'Sampah yang mudah terurai seperti sisa makanan, daun, dll'),
('Plastik', 'Sampah berbahan plastik seperti botol, kemasan, dll'),
('Kertas', 'Sampah berbahan kertas seperti koran, kardus, dll'),
('Logam', 'Sampah berbahan logam seperti kaleng, besi bekas, dll'),
('Elektronik', 'Sampah elektronik seperti baterai, hp bekas, dll');

-- Tambahkan data sampah
INSERT INTO sampah (nama, kategori_id, harga_per_kg, deskripsi) VALUES
('Sampah daun', 1, 1000, 'Daun-daunan dan ranting'),
('Sisa makanan', 1, 500, 'Sisa makanan yang terbuang'),
('Botol plastik', 2, 3000, 'Botol plastik bekas minuman'),
('Kantong plastik', 2, 1500, 'Kantong plastik bekas'),
('Kardus', 3, 2500, 'Kardus bekas packaging'),
('Kertas HVS', 3, 3000, 'Kertas HVS bekas'),
('Kaleng aluminium', 4, 10000, 'Kaleng bekas minuman'),
('Besi tua', 4, 8000, 'Besi bekas'),
('Baterai bekas', 5, 5000, 'Baterai AA, AAA bekas'),
('Elektronik rusak', 5, 15000, 'Peralatan elektronik rusak');