# Używamy obrazu Node.js
FROM node:18

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików i instalacja zależności
COPY petzone_frontend/package.json ./ 
COPY petzone_frontend/package-lock.json ./
RUN npm install

# Kopiowanie reszty kodu
COPY petzone_frontend/ ./ 

# Otwieramy port
EXPOSE 3000

# Uruchamiamy aplikację
CMD ["npm", "start"]
