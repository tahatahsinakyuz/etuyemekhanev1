# Node image ile başla
FROM node:18

# Çalışma dizinini oluştur ve /app olarak ayarla
WORKDIR /app

# Sadece package dosyalarını backend'den al
COPY vscode/backend/package*.json ./

# Bağımlılıkları yükle
RUN npm install

# backend'deki tüm dosyaları /app içine kopyala
COPY vscode/backend/ .

# Portu aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
