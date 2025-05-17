import { API_URL } from "./config.js";

/* ====================== Genel Navigasyon ve Oturum ====================== */
// Sayfa Yönlendirme
function navigateTo(page) {
    if (!page) {
        console.error("Hedef sayfa tanımlı değil.");
        return;
    }
    window.location.href = page;
}
window.navigateTo = navigateTo; // Global erişim

// Oturum Kontrolü
function checkSession() {
    return localStorage.getItem("sessionToken");
}
function clearSession() {
    localStorage.removeItem("sessionToken");
}
function logout() {
    clearSession();
    alert("Oturumunuz sonlandırıldı.");
    navigateTo("anasayfa.html");
}
window.logout = logout; // Global erişim

document.addEventListener("DOMContentLoaded", () => {
    // Yetkili butonu kontrolü
    const yetkiliButton = document.getElementById("yetkiliButton");
    if (yetkiliButton) {
        yetkiliButton.addEventListener("click", () => {
            window.location.href = "admin-giris.html";
        });
    }
});

/* ====================== Kullanıcı Giriş Doğrulama ====================== */
async function kullaniciDogrulama(redirectPage) {
    const email = document.getElementById("email").value.trim();
    const sifre = document.getElementById("sifre").value.trim();
    const errorMessage = document.getElementById("error-message");

    if (!email || !sifre) {
        errorMessage.style.display = "block";
        errorMessage.innerText = "Lütfen tüm alanları doldurun!";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/kullanici-giris`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, sifre }),
        });
        if (!response.ok) throw new Error(`HTTP Hatası: ${response.status}`);

        const data = await response.json();
        if (data.success) {
            localStorage.setItem("email", email);
            localStorage.setItem("sifre", sifre);
            alert(data.message || "Giriş Başarılı! Yönlendiriliyorsunuz...");
            window.location.href = redirectPage;
        } else {
            errorMessage.style.display = "block";
            errorMessage.innerText = data.message || "Giriş bilgileri hatalı!";
        }
    } catch (error) {
        console.error("Kullanıcı giriş hatası:", error.message);
        errorMessage.style.display = "block";
        errorMessage.innerText = "Sunucu hatası! Daha sonra tekrar deneyin.";
    }
}

/* ====================== ADMIN PANELİ: Dinamik İçerik ve Menü ====================== */

// Dinamik section gösterme
function loadDynamicContent(section) {
    document.querySelectorAll('.dynamic-section').forEach(sec => sec.classList.add('hidden'));
    const targetSection = document.getElementById(section);
    if (targetSection) targetSection.classList.remove('hidden');
}

// Menü tıklama ve kategoriye yemek ekleme
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const section = e.currentTarget.getAttribute('data-section');
        loadDynamicContent(section);
    });
});

// Kategoriden tıklanan yemeği input'a otomatik yaz
document.querySelectorAll(".kategori ul li").forEach((yemek) => {
    yemek.addEventListener("click", () => {
        const yemekAdi = yemek.textContent;
        const kategori = yemek.closest(".kategori").querySelector("h4").textContent;
        const kategoriId = {
            "Çorbalar": "corba",
            "Ana Yemekler": "anaYemek",
            "Yardımcı Yemekler": "yardimciYemek",
            "Ekstralar": "ekstra"
        }[kategori];
        if (kategoriId) {
            document.getElementById(kategoriId).value = yemekAdi;
        }
    });
});

// Kategorilere yeni yemek ekleme (ekleme sonrası formdan otomatik ekleme)
function yeniYemekEkleKategorilere(yemek) {
    const kategoriler = {
        corba: document.querySelector(".kategori ul:nth-child(1)"),
        anaYemek: document.querySelector(".kategori ul:nth-child(2)"),
        yardimciYemek: document.querySelector(".kategori ul:nth-child(3)"),
        ekstra: document.querySelector(".kategori ul:nth-child(4)"),
    };
    Object.entries(kategoriler).forEach(([kategori, ul]) => {
        if (ul && yemek[kategori]) {
            const yeniItem = document.createElement("li");
            yeniItem.textContent = yemek[kategori];
            yeniItem.addEventListener("click", () => kategoriYemekSec(kategori, yemek));
            ul.appendChild(yeniItem);
        }
    });
}

// Form validation (örnek)
function validateForm(data) {
    const requiredFields = ['tarih', 'corba', 'anaYemek', 'yardimciYemek', 'ekstra'];
    return requiredFields.every(field => !!data[field]);
}

// Yemek ekleme formu
document.getElementById("yemekEkleForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const yemekVerileri = {
        tarih: document.getElementById("tarih").value || null,
        corba: document.getElementById("corba").value || null,
        corba_gramaj: document.getElementById("corbaPorsiyon").value || null,
        corba_kalori: document.getElementById("corbaKalori").value || null,
        anaYemek: document.getElementById("anaYemek").value || null,
        anaYemek_gramaj: document.getElementById("anaYemekPorsiyon").value || null,
        anaYemek_kalori: document.getElementById("anaYemekKalori").value || null,
        yardimciYemek: document.getElementById("yardimciYemek").value || null,
        yardimciYemek_gramaj: document.getElementById("yardimciYemekPorsiyon").value || null,
        yardimciYemek_kalori: document.getElementById("yardimciYemekKalori").value || null,
        ekstra: document.getElementById("ekstra").value || null,
        ekstra_gramaj: document.getElementById("ekstraPorsiyon").value || null,
        ekstra_kalori: document.getElementById("ekstraKalori").value || null,
    };
    try {
        const response = await fetch(`${API_URL}/api/yemek-ekle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(yemekVerileri),
        });
        const data = await response.json();
        if (data.success) {
            alert("Yemek başarıyla eklendi!");
            listeleSonEklenenYemekler();
            yeniYemekEkleKategorilere(yemekVerileri);
            document.getElementById("yemekEkleForm").reset();
        } else {
            alert(data.message || "Yemek eklenemedi.");
        }
    } catch (error) {
        console.error("Yemek ekleme hatası:", error);
        alert("Bir hata oluştu!");
    }
});

// Tarih seçici başlatıcı (flatpickr için)
function initializeDatePicker(selector) {
    flatpickr(selector, {
        locale: "tr",
        dateFormat: "Y-m-d",
    });
}
document.addEventListener("DOMContentLoaded", () => {
    initializeDatePicker("#tarih");
    initializeDatePicker("#menuTarih");
});

/* ====================== EKLENEN YEMEKLERİN LİSTESİ ====================== */

// Son eklenen yemekleri listele
async function listeleSonEklenenYemekler() {
    try {
        const response = await fetch(`${API_URL}/api/son-eklenen-yemekler`);
        const data = await response.json();
        const yemekListesi = document.getElementById("eklenenYemekListesi");
        yemekListesi.innerHTML = "";
        if (data.success) {
            data.sonYemekler.forEach((menu) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>Hangi Tarih İçin:</strong> ${formatDate(menu.tarih)} <br>
                    <strong>Eklenme Tarihi ve Saati:</strong> ${formatDate(menu.eklenmeTarihi)} ${formatTime(menu.eklenmeTarihi)} <br>
                    <strong>Çorba:</strong> ${menu.corba}, 
                    <strong>Ana Yemek:</strong> ${menu.anaYemek}, 
                    <strong>Yardımcı Yemek:</strong> ${menu.yardimciYemek}, 
                    <strong>Ekstra:</strong> ${menu.ekstra}
                `;
                yemekListesi.appendChild(listItem);
            });
        } else {
            yemekListesi.innerHTML = "<li>Son eklenen yemekler bulunamadı.</li>";
        }
    } catch (error) {
        console.error("Son eklenen yemekleri listeleme hatası:", error);
        document.getElementById("eklenenYemekListesi").innerHTML = "<li>Yemekleri listeleme sırasında hata oluştu.</li>";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    listeleSonEklenenYemekler();
});

/* ====================== RASTGELE MENÜ VE FORM DOLDURMA ====================== */

function randomMenulerOlustur(sabitKategori, sabitDeger) {
    // Kategorilere göre yemek listelerini al
    const kategoriler = {
        corbalar: [...document.querySelectorAll(".kategori:nth-child(1) ul li")].map(item => item.textContent),
        anaYemekler: [...document.querySelectorAll(".kategori:nth-child(2) ul li")].map(item => item.textContent),
        yardimciYemekler: [...document.querySelectorAll(".kategori:nth-child(3) ul li")].map(item => item.textContent),
        ekstralar: [...document.querySelectorAll(".kategori:nth-child(4) ul li")].map(item => item.textContent),
    };

    const sabitMenu = {
        corba: sabitKategori === "corbalar" ? sabitDeger : kategoriler.corbalar[Math.floor(Math.random() * kategoriler.corbalar.length)],
        anaYemek: sabitKategori === "anaYemekler" ? sabitDeger : kategoriler.anaYemekler[Math.floor(Math.random() * kategoriler.anaYemekler.length)],
        yardimciYemek: sabitKategori === "yardimciYemekler" ? sabitDeger : kategoriler.yardimciYemekler[Math.floor(Math.random() * kategoriler.yardimciYemekler.length)],
        ekstra: sabitKategori === "ekstralar" ? sabitDeger : kategoriler.ekstralar[Math.floor(Math.random() * kategoriler.ekstralar.length)],
    };

    const randomGramKalori = {
        corbaGram: Math.floor(Math.random() * 100) + 150,
        corbaKalori: Math.floor(Math.random() * 50) + 100,
        anaYemekGram: Math.floor(Math.random() * 150) + 300,
        anaYemekKalori: Math.floor(Math.random() * 100) + 250,
        yardimciYemekGram: Math.floor(Math.random() * 50) + 200,
        yardimciYemekKalori: Math.floor(Math.random() * 50) + 150,
        ekstraGram: Math.floor(Math.random() * 50) + 100,
        ekstraKalori: Math.floor(Math.random() * 50) + 100,
    };

    const oneriListesi = document.getElementById("oneri-listesi");
    oneriListesi.innerHTML = "";
    const oneri = document.createElement("div");
    oneri.className = "random-menu";
    oneri.innerHTML = `
        <p><strong>Çorba:</strong> ${sabitMenu.corba} (${randomGramKalori.corbaGram}g, ${randomGramKalori.corbaKalori}kcal)</p>
        <p><strong>Ana Yemek:</strong> ${sabitMenu.anaYemek} (${randomGramKalori.anaYemekGram}g, ${randomGramKalori.anaYemekKalori}kcal)</p>
        <p><strong>Yardımcı Yemek:</strong> ${sabitMenu.yardimciYemek} (${randomGramKalori.yardimciYemekGram}g, ${randomGramKalori.yardimciYemekKalori}kcal)</p>
        <p><strong>Ekstra:</strong> ${sabitMenu.ekstra} (${randomGramKalori.ekstraGram}g, ${randomGramKalori.ekstraKalori}kcal)</p>
        <button class="menu-sec-btn">Bu Menüyü Seç</button>
    `;
    oneriListesi.appendChild(oneri);
    oneri.querySelector(".menu-sec-btn").addEventListener("click", () => {
        document.getElementById("corba").value = sabitMenu.corba;
        document.getElementById("anaYemek").value = sabitMenu.anaYemek;
        document.getElementById("yardimciYemek").value = sabitMenu.yardimciYemek;
        document.getElementById("ekstra").value = sabitMenu.ekstra;
    });
}

function formatDate(dateString) {
    if (!dateString) return "Tarih belirtilmemiş";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function formatTime(dateString) {
    if (!dateString) return "Saat belirtilmemiş";
    const date = new Date(dateString);
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
// Menü tarih aralığına göre filtreleme
document.getElementById("listeleBtn").addEventListener("click", async () => {
    const startDateElement = document.getElementById("startDate");
    const endDateElement = document.getElementById("endDate");

    if (!startDateElement || !endDateElement) {
        alert("Bir hata oluştu. Lütfen sayfayı yenileyin ve tekrar deneyin.");
        return;
    }

    const startDate = startDateElement.value;
    const endDate = endDateElement.value;

    if (!startDate || !endDate) {
        alert("Lütfen başlangıç ve bitiş tarihlerini seçin!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/menuler?start_date=${startDate}&end_date=${endDate}`);
        const data = await response.json();
        const menuListesi = document.getElementById("menuListesi");
        menuListesi.innerHTML = "";

        if (data.success && data.menuler && data.menuler.length > 0) {
            data.menuler.forEach(menu => {
                const formattedDate = new Date(menu.tarih).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });

                const div = document.createElement("div");
                div.className = "menu-item";
                div.innerHTML = `
                    <p><strong>Tarih:</strong> ${formattedDate}</p>
                    <p><strong>Çorba:</strong> ${menu.corba}</p>
                    <p><strong>Ana Yemek:</strong> ${menu.anaYemek}</p>
                    <p><strong>Yardımcı Yemek:</strong> ${menu.yardimciYemek}</p>
                    <p><strong>Ekstra:</strong> ${menu.ekstra}</p>
                `;
                menuListesi.appendChild(div);
            });
        } else {
            menuListesi.innerHTML = "<p>Seçilen tarih aralığında menü bulunamadı!</p>";
        }
    } catch (error) {
        console.error("Menü listeleme hatası:", error);
        alert("Sunucu hatası! Lütfen tekrar deneyin.");
    }
});

// Dinamik filtreleme (input ve select) ve filtre temizleme
document.getElementById("filter-name").addEventListener("input", updateReservations);
document.getElementById("filter-date").addEventListener("input", updateReservations);
document.getElementById("filter-meal").addEventListener("change", updateReservations);
document.getElementById("clear-filters").addEventListener("click", () => {
    document.getElementById("filter-name").value = "";
    document.getElementById("filter-date").value = "";
    document.getElementById("filter-meal").value = "";
    updateReservations();
});

// Rezervasyonları dinamik olarak filtrele ve tabloya yaz
async function updateReservations() {
    const name = document.getElementById("filter-name").value.trim();
    const date = document.getElementById("filter-date").value;
    const meal = document.getElementById("filter-meal").value;

    const queryParams = new URLSearchParams();
    if (name) queryParams.append("isim", name);
    if (date) queryParams.append("tarih", date);
    if (meal) queryParams.append("ogun", meal);

    try {
        const response = await fetch(`${API_URL}/api/rezervasyonlar?${queryParams.toString()}`);
        const data = await response.json();
        const tableBody = document.querySelector("#reservation-table tbody");
        tableBody.innerHTML = "";

        if (data.success && Array.isArray(data.rezervasyonlar) && data.rezervasyonlar.length > 0) {
            data.rezervasyonlar.forEach((rezervasyon) => {
                const formattedDate = new Date(rezervasyon.tarih).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${rezervasyon.isim_soyisim || "-"}</td>
                    <td>${formattedDate}</td>
                    <td>${rezervasyon.ogun || "-"}</td>
                    <td>${rezervasyon.email || "-"}</td>
                    <td>${rezervasyon.okul_no || "-"}</td>
                    <td>${rezervasyon.durum || "-"}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = "<tr><td colspan='6'>Filtreye uygun rezervasyon bulunamadı!</td></tr>";
        }
    } catch (error) {
        console.error("Rezervasyonları listeleme hatası:", error);
        alert("Sunucu hatası! Lütfen tekrar deneyin.");
    }
}

// Rezervasyon listesini PDF olarak indir
document.getElementById("download-reservations").addEventListener("click", async () => {
    const name = document.getElementById("filter-name").value.trim();
    const date = document.getElementById("filter-date").value;
    const meal = document.getElementById("filter-meal").value;

    const queryParams = new URLSearchParams();
    if (name) queryParams.append("isim", name);
    if (date) queryParams.append("tarih", date);
    if (meal) queryParams.append("ogun", meal);

    try {
        const response = await fetch(`${API_URL}/api/rezervasyonlar?${queryParams.toString()}`);
        const data = await response.json();

        if (data.success && Array.isArray(data.rezervasyonlar) && data.rezervasyonlar.length > 0) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Rezervasyon Yönetimi", 10, 10);
            doc.setFontSize(12);
            doc.text(`Filtre: ${name || "Tümü"} | ${date || "Tümü"} | ${meal || "Tümü"}`, 10, 20);

            const headers = ["İsim Soyisim", "Tarih", "Öğün", "E-posta", "Okul No", "Durum"];
            const rows = data.rezervasyonlar.map((rezervasyon) => [
                rezervasyon.isim_soyisim || "-",
                new Date(rezervasyon.tarih).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                rezervasyon.ogun || "-",
                rezervasyon.email || "-",
                rezervasyon.okul_no || "-",
                rezervasyon.durum || "-",
            ]);
            doc.autoTable({
                head: [headers],
                body: rows,
                startY: 30,
                styles: { fontSize: 10 },
            });
            doc.save("rezervasyonlar.pdf");
        } else {
            alert("Filtreye uygun rezervasyon bulunamadı!");
        }
    } catch (error) {
        console.error("PDF indirme hatası:", error);
        alert("PDF indirirken bir hata oluştu!");
    }
});

/* ========== Kullanıcı Yönetimi ========== */

// Kullanıcı ekle
document.getElementById("add-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const password = document.getElementById("user-password").value.trim();
    const role = document.getElementById("user-role").value;
    if (!name || !email || !password || !role) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/kullanici-ekle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ad: name.split(" ")[0],
                soyad: name.split(" ")[1] || "",
                email,
                sifre: password,
                rol: role,
            }),
        });
        const result = await response.json();
        if (result.success) {
            alert(result.message);
            loadUserList();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Kullanıcı ekleme hatası:", error);
        alert("Sunucu hatası! Lütfen tekrar deneyin.");
    }
});

// Kullanıcıları tabloya yükle
function loadUserList() {
    fetch(`${API_URL}/api/kullanicilar`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success && Array.isArray(data.users)) {
                const tableBody = document.querySelector("#user-table tbody");
                tableBody.innerHTML = "";
                data.users.forEach((user) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${user.ad} ${user.soyad}</td>
                        <td>${user.email}</td>
                        <td>${user.rol}</td>
                        <td>
                            <button onclick="deleteUser(${user.id})">Sil</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        })
        .catch((error) => {
            console.error("Kullanıcıları yükleme hatası:", error);
        });
}
document.addEventListener("DOMContentLoaded", loadUserList);

// Kullanıcı sil
window.deleteUser = async function(userId) {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    try {
        const response = await fetch(`${API_URL}/api/kullanici-sil/${userId}`, { method: "DELETE" });
        const data = await response.json();
        if (data.success) {
            alert("Kullanıcı başarıyla silindi!");
            loadUserList();
        } else {
            alert(data.message || "Kullanıcı silinemedi!");
        }
    } catch (error) {
        console.error("Kullanıcı silme hatası:", error);
        alert("Bir hata oluştu! Lütfen tekrar deneyin.");
    }
};

/* ========== Yorum Yönetimi ========== */

// Yorum sil fonksiyonu
window.silYorum = async function(id) {
    const email = "admin@example.com"; // Gerçek admin oturumundan alınmalı!
    try {
        const response = await fetch(`/api/yorum-sil/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await response.json();
        if (result.success) {
            alert('Yorum başarıyla silindi!');
            loadComments();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Yorum silme hatası:', error);
    }
};

// Yorum ekle
document.getElementById('comment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const comment = document.getElementById('comment').value;
    try {
        const response = await fetch('/api/yorum-ekle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isim: name, eposta: email, yorum: comment }),
        });
        const result = await response.json();
        if (result.success) {
            alert('Yorum başarıyla eklendi!');
            loadComments();
            document.getElementById('comment-form').reset();
        } else {
            alert(result.message || "Yorum eklenemedi.");
        }
    } catch (error) {
        console.error("Yorum ekleme sırasında hata:", error);
        alert("Yorum eklenirken bir hata oluştu.");
    }
});

// Yorumları yükle
async function loadComments() {
    try {
        const response = await fetch('/api/yorumlar');
        const result = await response.json();
        const commentList = document.getElementById('comment-list');
        commentList.innerHTML = '';
        if (result.success && Array.isArray(result.yorumlar)) {
            result.yorumlar.forEach((yorum) => {
                const listItem = document.createElement('div');
                listItem.classList.add('comment-item');
                const formattedDate = new Date(yorum.tarih).toLocaleString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });
                listItem.innerHTML = `
                    <p><strong>${yorum.isim}</strong> (${yorum.eposta}):</p>
                    <p>${yorum.yorum}</p>
                    <p><small>${formattedDate}</small></p>
                    <button onclick="silYorum(${yorum.id})">Sil</button>
                    <hr>
                `;
                commentList.appendChild(listItem);
            });
        } else {
            commentList.innerHTML = '<p>Henüz yorum yapılmamış.</p>';
        }
    } catch (error) {
        console.error('Yorumları yüklerken hata:', error);
        document.getElementById('comment-list').innerHTML = '<p>Yorumları yüklerken bir hata oluştu.</p>';
    }
}
document.addEventListener('DOMContentLoaded', loadComments);

