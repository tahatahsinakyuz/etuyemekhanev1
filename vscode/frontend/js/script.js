import { API_URL } from "./config.js";

// Yönlendirme Fonksiyonu
function navigateTo(page) {
    if (!page) {
        console.error("Hedef sayfa tanımlı değil.");
        return;
    }
    window.location.href = page;
}
window.navigateTo = navigateTo;

// Oturum ve Token Kontrolleri
function checkSession() {
    return localStorage.getItem("sessionToken");
}
function clearSession() {
    localStorage.removeItem("sessionToken");
}
window.logout = function() {
    clearSession();
    alert("Oturumunuz sonlandırıldı.");
    navigateTo("anasayfa.html");
};

// Giriş Kontrolü (Kullanıcı Doğrulama)
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

// Yetkili İşlemleri Butonu ve Menü Navigasyonu
document.addEventListener("DOMContentLoaded", () => {
    const yetkiliButton = document.getElementById("yetkiliButton");
    if (yetkiliButton) {
        yetkiliButton.addEventListener("click", () => {
            window.location.href = "admin-giris.html";
        });
    }
    // Menüde bölüm göster/gizle işlemleri
    const menuItems = document.querySelectorAll(".menu-item");
    const sections = document.querySelectorAll("section");
    if (sections.length > 0) {
        sections.forEach((section) => section.style.display = "none");
        const defaultSection = document.getElementById("yemek");
        if (defaultSection) defaultSection.style.display = "block";
        menuItems.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                sections.forEach((section) => section.style.display = "none");
                const sectionId = item.getAttribute("data-section");
                const targetSection = document.getElementById(sectionId);
                if (targetSection) targetSection.style.display = "block";
                menuItems.forEach((menu) => menu.classList.remove("active"));
                item.classList.add("active");
            });
        });
    }
});

// Dinamik İçerik Yükleme ve Kategoriye Yemek Ekleme Fonksiyonları
function loadDynamicContent(section) {
    document.querySelectorAll('.dynamic-section').forEach(sec => sec.classList.add('hidden'));
    const targetSection = document.getElementById(section);
    if (targetSection) targetSection.classList.remove('hidden');
}

function yeniYemekEkleKategorilere(yemek) {
    const kategoriler = {
        corba: document.querySelector(".kategori:nth-child(1) ul"),
        anaYemek: document.querySelector(".kategori:nth-child(2) ul"),
        yardimciYemek: document.querySelector(".kategori:nth-child(3) ul"),
        ekstra: document.querySelector(".kategori:nth-child(4) ul"),
    };
    Object.keys(kategoriler).forEach((kategori) => {
        const ulElement = kategoriler[kategori];
        if (ulElement && yemek[kategori]) {
            const yeniYemek = document.createElement("li");
            yeniYemek.textContent = yemek[kategori];
            yeniYemek.addEventListener("click", () => kategoriYemekSec(kategori, yemek));
            ulElement.appendChild(yeniYemek);
        }
    });
}
// Kategoriye tıklayınca formu otomatik doldurma ve rastgele menü oluşturma
function randomMenulerOlustur(sabitKategori, sabitDeger) {
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
    const oneriListesi = document.getElementById("oneri-listesi");
    oneriListesi.innerHTML = "";
    const oneri = document.createElement("div");
    oneri.className = "random-menu";
    oneri.innerHTML = `
        <p><strong>Çorba:</strong> ${sabitMenu.corba}</p>
        <p><strong>Ana Yemek:</strong> ${sabitMenu.anaYemek}</p>
        <p><strong>Yardımcı Yemek:</strong> ${sabitMenu.yardimciYemek}</p>
        <p><strong>Ekstra:</strong> ${sabitMenu.ekstra}</p>
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

// Yorum ekleme ve silme işlemleri
document.getElementById('comment-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const comment = document.getElementById('comment').value.trim();

    try {
        const response = await fetch(`${API_URL}/api/yorum-ekle`, {
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
        alert("Yorum eklenirken bir hata oluştu.");
    }
});

async function silYorum(id) {
    if (!confirm("Yorumu silmek istediğinizden emin misiniz?")) return;
    try {
        const response = await fetch(`${API_URL}/api/yorum-sil/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (result.success) {
            alert('Yorum başarıyla silindi!');
            loadComments();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Yorum silinirken bir hata oluştu.");
    }
}
window.silYorum = silYorum;

// Yorumları yükleme
async function loadComments() {
    try {
        const response = await fetch(`${API_URL}/api/yorumlar`);
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
                    minute: "2-digit"
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
        document.getElementById('comment-list').innerHTML = '<p>Yorumları yüklerken bir hata oluştu.</p>';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
});

// Kullanıcı ekleme
document.getElementById("add-user-form")?.addEventListener("submit", async (e) => {
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
        alert("Sunucu hatası! Lütfen tekrar deneyin.");
    }
});

// Kullanıcı listesini yükleme
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
        .catch(() => {});
}
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
        alert("Bir hata oluştu! Lütfen tekrar deneyin.");
    }
};
document.addEventListener("DOMContentLoaded", loadUserList);

// Dinamik rezervasyon filtreleme ve PDF indirme
async function updateReservations() {
    const name = document.getElementById("filter-name")?.value.trim();
    const date = document.getElementById("filter-date")?.value;
    const meal = document.getElementById("filter-meal")?.value;
    const queryParams = new URLSearchParams();
    if (name) queryParams.append("isim", name);
    if (date) queryParams.append("tarih", date);
    if (meal) queryParams.append("ogun", meal);

    try {
        const response = await fetch(`${API_URL}/api/rezervasyonlar?${queryParams.toString()}`);
        const data = await response.json();
        const tableBody = document.querySelector("#reservation-table tbody");
        tableBody.innerHTML = "";
        if (data.success && data.rezervasyonlar.length > 0) {
            data.rezervasyonlar.forEach((rezervasyon) => {
                const formattedDate = new Date(rezervasyon.tarih).toLocaleDateString("tr-TR", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
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
        alert("Sunucu hatası! Lütfen tekrar deneyin.");
    }
}

document.getElementById("filter-name")?.addEventListener("input", updateReservations);
document.getElementById("filter-date")?.addEventListener("input", updateReservations);
document.getElementById("filter-meal")?.addEventListener("change", updateReservations);
document.getElementById("clear-filters")?.addEventListener("click", () => {
    document.getElementById("filter-name").value = "";
    document.getElementById("filter-date").value = "";
    document.getElementById("filter-meal").value = "";
    updateReservations();
});

document.getElementById("download-reservations")?.addEventListener("click", async () => {
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
        if (data.success && data.rezervasyonlar.length > 0) {
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
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
                }),
                rezervasyon.ogun || "-",
                rezervasyon.email || "-",
                rezervasyon.okul_no || "-",
                rezervasyon.durum || "-",
            ]);
            doc.autoTable({ head: [headers], body: rows, startY: 30, styles: { fontSize: 10 } });
            doc.save("rezervasyonlar.pdf");
        } else {
            alert("Filtreye uygun rezervasyon bulunamadı!");
        }
    } catch (error) {
        alert("PDF indirirken bir hata oluştu!");
    }
});
