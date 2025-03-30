#!/bin/sh

until PGPASSWORD=$DB_PASSWORD psql -h "db" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
  echo "PostgreSQL nie jest gotowy, ponowna próba za 2 sekundy..."
  sleep 2
done
echo "PostgreSQL jest gotowy!"
