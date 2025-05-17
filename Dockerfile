# Node image ile başla
FROM node:18

# Çalışma dizinini backend'e al
WORKDIR /app

# package.json dosyalarını kopyala
COPY vscode/backend/package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Backend ve frontend dahil tüm dosyaları kopyala
COPY vscode/backend/frontend ./vscode/backend/frontend

# Port aç
EXPOSE 3000

# Projeyi başlat
CMD ["npm", "start"]
