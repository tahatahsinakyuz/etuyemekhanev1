# Node image ile başla
FROM node:18

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY vscode/backend/package*.json ./

# Tüm backend içeriğini ve frontend'i KOPYALA
COPY vscode/backend/. ./

# NOT: Yukarıdaki satır backend'in içindeki her şeyi /app dizinine atar.

# Modülleri yükle
RUN npm install

# Portu aç
EXPOSE 3000

# Projeyi başlat
CMD ["npm", "start"]
