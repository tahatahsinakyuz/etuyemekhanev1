// API URL'yi window üzerinden al
const API_URL = window.API_URL;

// Menüleri Yükle
async function loadTodayMenu() {
    try {
        const response = await fetch(`${API_URL}/api/gunun-menusu`);
        const data = await response.json();

        if (data.success && data.menu) {
            const gununMenusu = document.getElementById("gunun-menusu");
            if (gununMenusu) {
                gununMenusu.innerHTML = "";

                const { corba, anaYemek, yardimciYemek, ekstra, corba_gramaj, corba_kalori, anaYemek_gramaj, anaYemek_kalori, yardimciYemek_gramaj, yardimciYemek_kalori, ekstra_gramaj, ekstra_kalori } = data.menu;

                const gridHTML = `
                    <div class="menu-item">
                        <img src="images/corba.png" alt="Çorba Resmi">
                        <p>${corba}</p>
                        <p>${corba_gramaj}g - ${corba_kalori} kcal</p>
                    </div>
                    <div class="menu-item">
                        <img src="images/ana-yemek.png" alt="Ana Yemek Resmi">
                        <p>${anaYemek}</p>
                        <p>${anaYemek_gramaj}g - ${anaYemek_kalori} kcal</p>
                    </div>
                    <div class="menu-item">
                        <img src="images/yardimci-yemek.png" alt="Yardımcı Yemek Resmi">
                        <p>${yardimciYemek}</p>
                        <p>${yardimciYemek_gramaj}g - ${yardimciYemek_kalori} kcal</p>
                    </div>
                    <div class="menu-item">
                        <img src="images/ekstra.png" alt="Ekstra Resmi">
                        <p>${ekstra}</p>
                        <p>${ekstra_gramaj}g - ${ekstra_kalori} kcal</p>
                    </div>
                `;

                gununMenusu.innerHTML = gridHTML;
            }
        } else {
            const gununMenusu = document.getElementById("gunun-menusu");
            if (gununMenusu) gununMenusu.innerHTML = "<p>Günün menüsü bulunamadı.</p>";
        }
    } catch (error) {
        console.error("Günün menüsü yüklenirken hata:", error);
        const gununMenusu = document.getElementById("gunun-menusu");
        if (gununMenusu) gununMenusu.innerHTML = "<p>Menü yüklenirken bir hata oluştu.</p>";
    }
}

async function loadUpcomingMenus() {
    try {
        const response = await fetch(`${API_URL}/api/ilerleyen-gunler`);
        const data = await response.json();

        if (data.success && Array.isArray(data.menu)) {
            const ilerleyenGunler = document.getElementById("ilerleyen-gunler");
            if (ilerleyenGunler) {
                ilerleyenGunler.innerHTML = "";

                data.menu.forEach((menu) => {
                    const tarih = new Date(menu.tarih);
                    const gun = tarih.toLocaleDateString("tr-TR", { weekday: "long" });

                    const dayCard = document.createElement("div");
                    dayCard.className = "day-card";
                    dayCard.innerHTML = `
                        <h3>${menu.tarih.split("T")[0]} (${gun})</h3>
                        <p>${menu.corba}</p>
                        <p>${menu.anaYemek}</p>
                        <p>${menu.yardimciYemek}</p>
                        <p>${menu.ekstra}</p>
                    `;
                    ilerleyenGunler.appendChild(dayCard);
                });
            }
        } else {
            const ilerleyenGunler = document.getElementById("ilerleyen-gunler");
            if (ilerleyenGunler) ilerleyenGunler.innerHTML = "<p>İlerleyen günler için menü bulunamadı.</p>";
        }
    } catch (error) {
        console.error("İlerleyen günler yüklenirken hata:", error);
        const ilerleyenGunler = document.getElementById("ilerleyen-gunler");
        if (ilerleyenGunler) ilerleyenGunler.innerHTML = "<p>Menü yüklenirken bir hata oluştu.</p>";
    }
}

// Yorumlar kısmı
async function loadComments() {
    const commentList = document.getElementById("comment-list");
    if (!commentList) return;
    try {
        const response = await fetch(`${API_URL}/api/yorumlar`);
        const data = await response.json();

        if (data.success) {
            commentList.innerHTML = "";
            data.yorumlar.forEach(yorum => {
                const commentItem = document.createElement("div");
                commentItem.classList.add("comment-item");
                commentItem.innerHTML = `
                    <p><strong>${yorum.isim}</strong> (${yorum.eposta}):</p>
                    <p>${yorum.yorum}</p>
                    <div class="comment-actions">
                        <button class="like-button" data-id="${yorum.id}" data-action="like">👍 ${yorum.begeni || 0}</button>
                        <button class="dislike-button" data-id="${yorum.id}" data-action="dislike">👎 ${yorum.begenmeme || 0}</button>
                    </div>
                `;
                commentList.appendChild(commentItem);
            });

            document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const yorumId = e.target.getAttribute("data-id");
                    const action = e.target.getAttribute("data-action");
                    await handleLikeDislike(yorumId, action);
                });
            });
        } else {
            commentList.innerHTML = `<p>Henüz yorum bulunmamaktadır.</p>`;
        }
    } catch (error) {
        console.error("Yorumları yükleme hatası:", error);
        commentList.innerHTML = `<p>Yorumlar yüklenirken bir hata oluştu!</p>`;
    }
}

async function handleLikeDislike(yorumId, action) {
    try {
        const response = await fetch(`${API_URL}/api/yorum-begeni`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yorumId, action })
        });

        const data = await response.json();
        if (data.success) {
            loadComments();
        } else {
            alert("İşlem başarısız: " + data.message);
        }
    } catch (error) {
        console.error("Beğeni/begenmeme hatası:", error);
        alert("Bir hata oluştu!");
    }
}

// Kullanıcı doğrulama için
function resetVerification(nameInput, commentInput, commentForm, emailInput) {
    nameInput.disabled = true;
    commentInput.disabled = true;
    commentForm.querySelector("button").disabled = true;
    document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
        button.disabled = true;
    });
    emailInput.classList.remove("verified");
    nameInput.classList.remove("verified");
    commentInput.classList.remove("verified");
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    // Menüleri yükle
    loadTodayMenu();
    loadUpcomingMenus();

    // Yetkili butonu
    const yetkiliButton = document.getElementById("yetkiliButton");
    if (yetkiliButton) {
        yetkiliButton.addEventListener("click", () => {
            navigateTo("admin-giris.html");
        });
    }

    // Yorum formu ve kullanıcı doğrulama
    const commentForm = document.getElementById("comment-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const commentInput = document.getElementById("comment");

    if (commentForm && nameInput && emailInput && commentInput) {
        const verifyStatus = document.createElement("p");
        verifyStatus.id = "verify-status";
        commentForm.insertBefore(verifyStatus, commentForm.firstChild);

        let isUserVerified = false;

        emailInput.addEventListener("blur", async () => {
            const email = emailInput.value.trim();
            if (email) {
                try {
                    const response = await fetch(`${API_URL}/api/kullanicilar`);
                    const data = await response.json();

                    if (data.success) {
                        const userExists = data.users.some(user => user.email === email);
                        if (userExists) {
                            isUserVerified = true;
                            verifyStatus.textContent = "Kullanıcı doğrulandı ✅";
                            verifyStatus.style.color = "green";
                            nameInput.disabled = false;
                            commentInput.disabled = false;
                            commentForm.querySelector("button").disabled = false;

                            document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
                                button.disabled = false;
                            });
                            emailInput.classList.add("verified");
                            nameInput.classList.add("verified");
                            commentInput.classList.add("verified");
                        } else {
                            resetVerification(nameInput, commentInput, commentForm, emailInput);
                            verifyStatus.textContent = "Kullanıcı bulunamadı ❌";
                            verifyStatus.style.color = "red";
                        }
                    }
                } catch (error) {
                    console.error("Kullanıcı doğrulama hatası:", error);
                    resetVerification(nameInput, commentInput, commentForm, emailInput);
                    verifyStatus.textContent = "Doğrulama sırasında bir hata oluştu!";
                    verifyStatus.style.color = "red";
                }
            }
        });

        commentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const isim = nameInput.value.trim();
            const eposta = emailInput.value.trim();
            const yorum = commentInput.value.trim();

            if (!isim || !eposta || !yorum) {
                alert("Lütfen tüm alanları doldurunuz!");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/yorum-ekle`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isim, eposta, yorum })
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    alert("Yorumunuz başarıyla eklendi!");
                    commentInput.value = "";
                    loadComments();
                } else {
                    alert("Yorum eklenemedi: " + data.message);
                }
            } catch (error) {
                console.error("Yorum gönderme hatası:", error);
                alert("Yorum gönderilirken bir hata oluştu!");
            }
        });
    }

    // Yorumları baştan yükle
    loadComments();
});

// Global navigateTo fonksiyonu
function navigateTo(url) {
    window.location.href = url;
}
window.navigateTo = navigateTo;
