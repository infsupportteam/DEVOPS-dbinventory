#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."

python - <<'PYWAIT'
import os
import socket
import time

host = os.getenv("SQL_HOST", "dbinventorydb")
port = int(os.getenv("SQL_PORT", "5432"))

for _ in range(60):
    try:
        with socket.create_connection((host, port), timeout=2):
            print("PostgreSQL is reachable")
            break
    except OSError:
        time.sleep(2)
else:
    raise SystemExit("PostgreSQL did not become available")
PYWAIT

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn dbinventory.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120
