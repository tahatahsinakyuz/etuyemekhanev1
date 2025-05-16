# 1. Node.js image'ı ile başla (18 veya 20 farketmez)
FROM node:18

# 2. Çalışma dizinini oluştur ve backend'e geç
WORKDIR /app

# 3. package.json ve package-lock.json'u backend'den kopyala
COPY vscode/backend/package*.json ./

# 4. Bağımlılıkları yükle
RUN npm install

# 5. Kalan backend dosyalarını kopyala
COPY vscode/backend/ .

# 6. Gerekirse port aç (genellikle 3000 veya 8080)
EXPOSE 3000

# 7. Projeyi başlat (package.json'daki "start" scriptini çalıştıracak)
CMD ["npm", "start"]
