# Używamy obrazu Python
FROM python:3.10

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Kopiowanie kodu aplikacji
COPY . .

# Otwieramy port
EXPOSE 8000

# Uruchamiamy serwer
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
