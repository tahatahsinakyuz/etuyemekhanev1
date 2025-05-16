-- Veritabanı oluşturma
CREATE DATABASE IF NOT EXISTS etuyemekhanev1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE etuyemekhanev1;

-- ===================== KULLANICILAR =====================
CREATE TABLE IF NOT EXISTS kullanicilar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(50) NOT NULL,
  soyad VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  sifre VARCHAR(100) NOT NULL,
  rol ENUM('ogrenci', 'personel', 'admin') NOT NULL,
  bakiye DECIMAL(10,2) DEFAULT 0,
  kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================== YEMEK MENÜSÜ =====================
CREATE TABLE IF NOT EXISTS yemek_menusu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tarih DATE NOT NULL,
  corba VARCHAR(100) NOT NULL,
  corba_gramaj INT NOT NULL,
  corba_kalori INT NOT NULL,
  anaYemek VARCHAR(100) NOT NULL,
  anaYemek_gramaj INT NOT NULL,
  anaYemek_kalori INT NOT NULL,
  yardimciYemek VARCHAR(100) NOT NULL,
  yardimciYemek_gramaj INT NOT NULL,
  yardimciYemek_kalori INT NOT NULL,
  ekstra VARCHAR(100) NOT NULL,
  ekstra_gramaj INT NOT NULL,
  ekstra_kalori INT NOT NULL,
  eklenmeTarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================== REZERVASYONLAR =====================
CREATE TABLE IF NOT EXISTS rezervasyonlar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  isim_soyisim VARCHAR(100) NOT NULL,
  tarih DATE NOT NULL,
  ogun VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  okul_no VARCHAR(30) NOT NULL,
  ucret DECIMAL(10,2) DEFAULT 0,
  saat TIME DEFAULT NULL,
  durum VARCHAR(30) DEFAULT 'bekliyor'
);

-- ===================== YORUMLAR =====================
CREATE TABLE IF NOT EXISTS yorumlar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  isim VARCHAR(100),
  eposta VARCHAR(100),
  yorum TEXT,
  tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  begeni INT DEFAULT 0,
  begenmeme INT DEFAULT 0
);

-- ===================== KART BİLGİLERİ =====================
CREATE TABLE IF NOT EXISTS kart_bilgileri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_id INT NOT NULL,
  kart_numarasi VARCHAR(30) NOT NULL,
  son_kullanma_tarihi VARCHAR(10) NOT NULL,
  cvc VARCHAR(10) NOT NULL,
  eklenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- ===================== BAKİYE İŞLEMLERİ =====================
CREATE TABLE IF NOT EXISTS bakiye_islemleri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_id INT NOT NULL,
  tarih DATE DEFAULT (CURRENT_DATE),
  saat TIME DEFAULT (CURRENT_TIME),
  tutar DECIMAL(10,2) NOT NULL,
  islem_tipi ENUM('yukleme', 'cekme') NOT NULL,
  FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- ===================== (İSTEĞE BAĞLI) İŞLEM GEÇMİŞİ =====================
-- Eğer sadece bakiye yükleme değil farklı işlemler de takip edilecekse kullanabilirsin.
CREATE TABLE IF NOT EXISTS islem_gecmisi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_id INT NOT NULL,
  islem_turu VARCHAR(50) NOT NULL,
  tutar DECIMAL(10,2) NOT NULL,
  tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- Tüm ana tablolar oluşturulmuştur.
