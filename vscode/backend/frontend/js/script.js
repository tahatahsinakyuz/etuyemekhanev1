const API_URL = window.API_URL;

/* ====================== Genel Navigasyon ve Oturum ====================== */
// Sayfa Yönlendirme
function navigateTo(page) {
    if (!page) {
        console.error("Hedef sayfa tanımlı değil.");
        return;
    }
    window.location.href = page;
}
window.navigateTo = navigateTo;

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
window.logout = logout;

// Sayfa yüklendiğinde bazı eventleri güvenli şekilde bağla
document.addEventListener("DOMContentLoaded", () => {
    // Yetkili butonu
    const yetkiliButton = document.getElementById("yetkiliButton");
    if (yetkiliButton) {
        yetkiliButton.addEventListener("click", () => {
            navigateTo("admin-giris.html");
        });
    }

    // Menü tarih aralığı filtre butonu
    const listeleBtn = document.getElementById("listeleBtn");
    if (listeleBtn) {
        listeleBtn.addEventListener("click", filtreliMenuListele);
    }

    // Rezervasyon filtre inputları
    const filterName = document.getElementById("filter-name");
    const filterDate = document.getElementById("filter-date");
    const filterMeal = document.getElementById("filter-meal");
    const clearFilters = document.getElementById("clear-filters");

    if (filterName) filterName.addEventListener("input", updateReservations);
    if (filterDate) filterDate.addEventListener("input", updateReservations);
    if (filterMeal) filterMeal.addEventListener("change", updateReservations);
    if (clearFilters) clearFilters.addEventListener("click", () => {
        if (filterName) filterName.value = "";
        if (filterDate) filterDate.value = "";
        if (filterMeal) filterMeal.value = "";
        updateReservations();
    });

    // PDF indirme butonu
    const downloadReservations = document.getElementById("download-reservations");
    if (downloadReservations) {
        downloadReservations.addEventListener("click", downloadReservationsPDF);
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
window.kullaniciDogrulama = kullaniciDogrulama;

/* ====================== ADMIN PANELİ: Dinamik İçerik ve Menü ====================== */
// Dinamik section gösterme
function loadDynamicContent(section) {
    document.querySelectorAll('.dynamic-section').forEach(sec => sec.classList.add('hidden'));
    const targetSection = document.getElementById(section);
    if (targetSection) targetSection.classList.remove('hidden');
}
window.loadDynamicContent = loadDynamicContent;

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

// Yemek ekleme formu
const yemekEkleForm = document.getElementById("yemekEkleForm");
if (yemekEkleForm) {
    yemekEkleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const yemekVerileri = {
            tarih: document.getElementById("tarih").value || null,
            corba: document.getElementById("corba").value || null,
            corba_gramaj: document.getElementById("corbaPorsiyon")?.value || null,
            corba_kalori: document.getElementById("corbaKalori")?.value || null,
            anaYemek: document.getElementById("anaYemek").value || null,
            anaYemek_gramaj: document.getElementById("anaYemekPorsiyon")?.value || null,
            anaYemek_kalori: document.getElementById("anaYemekKalori")?.value || null,
            yardimciYemek: document.getElementById("yardimciYemek").value || null,
            yardimciYemek_gramaj: document.getElementById("yardimciYemekPorsiyon")?.value || null,
            yardimciYemek_kalori: document.getElementById("yardimciYemekKalori")?.value || null,
            ekstra: document.getElementById("ekstra").value || null,
            ekstra_gramaj: document.getElementById("ekstraPorsiyon")?.value || null,
            ekstra_kalori: document.getElementById("ekstraKalori")?.value || null,
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
                if (typeof listeleSonEklenenYemekler === "function") listeleSonEklenenYemekler();
                yemekEkleForm.reset();
            } else {
                alert(data.message || "Yemek eklenemedi.");
            }
        } catch (error) {
            console.error("Yemek ekleme hatası:", error);
            alert("Bir hata oluştu!");
        }
    });
}

/* ====================== EKLENEN YEMEKLERİN LİSTESİ ====================== */
async function listeleSonEklenenYemekler() {
    try {
        const response = await fetch(`${API_URL}/api/son-eklenen-yemekler`);
        const data = await response.json();
        const yemekListesi = document.getElementById("eklenenYemekListesi");
        if (!yemekListesi) return;
        yemekListesi.innerHTML = "";
        if (data.success && Array.isArray(data.sonYemekler)) {
            data.sonYemekler.forEach((menu) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>Hangi Tarih İçin:</strong> ${formatDate(menu.tarih)}<br>
                    <strong>Eklenme Tarihi:</strong> ${formatDate(menu.eklenmeTarihi)} ${formatTime(menu.eklenmeTarihi)}<br>
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
        const yemekListesi = document.getElementById("eklenenYemekListesi");
        if (yemekListesi) yemekListesi.innerHTML = "<li>Yemekleri listeleme sırasında hata oluştu.</li>";
    }
}
window.listeleSonEklenenYemekler = listeleSonEklenenYemekler;

/* ====================== RASTGELE MENÜ VE FORM DOLDURMA ====================== */
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
async function filtreliMenuListele() {
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
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
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
}
window.filtreliMenuListele = filtreliMenuListele;

// Rezervasyonları dinamik olarak filtrele ve tabloya yaz
async function updateReservations() {
    const name = document.getElementById("filter-name")?.value.trim() || "";
    const date = document.getElementById("filter-date")?.value || "";
    const meal = document.getElementById("filter-meal")?.value || "";
    const tableBody = document.querySelector("#reservation-table tbody");
    if (!tableBody) return;
    const queryParams = new URLSearchParams();
    if (name) queryParams.append("isim", name);
    if (date) queryParams.append("tarih", date);
    if (meal) queryParams.append("ogun", meal);

    try {
        const response = await fetch(`${API_URL}/api/rezervasyonlar?${queryParams.toString()}`);
        const data = await response.json();
        tableBody.innerHTML = "";
        if (data.success && Array.isArray(data.rezervasyonlar) && data.rezervasyonlar.length > 0) {
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
        console.error("Rezervasyonları listeleme hatası:", error);
        tableBody.innerHTML = "<tr><td colspan='6'>Sunucu hatası!</td></tr>";
    }
}
window.updateReservations = updateReservations;

// Rezervasyon listesini PDF olarak indir
async function downloadReservationsPDF() {
    const name = document.getElementById("filter-name")?.value.trim() || "";
    const date = document.getElementById("filter-date")?.value || "";
    const meal = document.getElementById("filter-meal")?.value || "";
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
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
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
}
window.downloadReservationsPDF = downloadReservationsPDF;

/* ========== Kullanıcı Yönetimi ========== */



// Kullanıcı ekle
const addUserForm = document.getElementById("add-user-form");
if (addUserForm) {
    addUserForm.addEventListener("submit", async (e) => {
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
                addUserForm.reset();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Kullanıcı ekleme hatası:", error);
            alert("Sunucu hatası! Lütfen tekrar deneyin.");
        }
    });
}

// Kullanıcıları tabloya yükle
function loadUserList() {
    fetch(`${API_URL}/api/kullanicilar`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success && Array.isArray(data.users)) {
                const tableBody = document.querySelector("#user-table tbody");
                if (!tableBody) return;
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
    // Gerçek admin oturumu varsa localStorage'dan çekersin, yoksa örnek eposta kullan
    const email = localStorage.getItem("email") || "admin@example.com";
    try {
        const response = await fetch(`${API_URL}/api/yorum-sil/${id}`, {
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
        alert("Yorum silerken hata oluştu.");
    }
};

// Yorum ekle
const commentForm = document.getElementById('comment-form');
if (commentForm) {
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const comment = document.getElementById('comment').value;
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
                commentForm.reset();
            } else {
                alert(result.message || "Yorum eklenemedi.");
            }
        } catch (error) {
            console.error("Yorum ekleme sırasında hata:", error);
            alert("Yorum eklenirken bir hata oluştu.");
        }
    });
}

// Yorumları yükle
async function loadComments() {
    try {
        const response = await fetch(`${API_URL}/api/yorumlar`);
        const result = await response.json();
        const commentList = document.getElementById('comment-list');
        if (!commentList) return;
        commentList.innerHTML = '';
        if (result.success && Array.isArray(result.yorumlar)) {
            result.yorumlar.forEach((yorum) => {
                const listItem = document.createElement('div');
                listItem.classList.add('comment-item');
                const formattedDate = yorum.tarih
                    ? new Date(yorum.tarih).toLocaleString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })
                    : "";
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
        const commentList = document.getElementById('comment-list');
        if (commentList) commentList.innerHTML = '<p>Yorumları yüklerken bir hata oluştu.</p>';
    }
}
document.addEventListener('DOMContentLoaded', loadComments);
