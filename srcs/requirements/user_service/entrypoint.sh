#!/bin/sh

# Check required environment variables
# [ ... ]: This is the test command. 
# It evaluates the expression inside the brackets and returns a status of 0 (true) or 1 (false).
# -z: This is a specific flag that stands for "zero length."
[ -z "$POSTGRES_HOST" ] && echo "Error: POSTGRES_HOST not set" && exit 1
[ -z "$POSTGRES_PORT" ] && echo "Error: POSTGRES_PORT not set" && exit 1
[ -z "$DJANGO_SUPERUSER_USERNAME" ] && echo "Error: DJANGO_SUPERUSER_USERNAME not set" && exit 1
[ -z "$DJANGO_SUPERUSER_EMAIL" ] && echo "Error: DJANGO_SUPERUSER_EMAIL not set" && exit 1
[ -z "$DJANGO_SUPERUSER_PASSWORD" ] && echo "Error: DJANGO_SUPERUSER_PASSWORD not set" && exit 1
[ -z "$DJANGO_SUPERUSER_DISPLAY_NAME" ] && echo "Error: DJANGO_SUPERUSER_DISPLAY_NAME not set" && exit 1

DB_HOST="$POSTGRES_HOST"
DB_PORT="$POSTGRES_PORT"

echo "Waiting for postgres at $DB_HOST:$DB_PORT..."

# Python check with explicit variables
python3 << END
import socket
import time
import sys

while True:
    try:
        with socket.create_connection(("$DB_HOST", int("$DB_PORT")), timeout=1):
            print("Postgres is up!")
            break
    except OSError:
        print("Postgres not ready yet, retrying...")
        time.sleep(1)
END

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# --- AUTOMATED SUPERUSER CREATION ---
echo "Checking for superuser..."
python manage.py shell << END
import os
import sys
from django.contrib.auth import get_user_model

username = os.getenv('DJANGO_SUPERUSER_USERNAME')
email = os.getenv('DJANGO_SUPERUSER_EMAIL')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
display_name = os.getenv('DJANGO_SUPERUSER_DISPLAY_NAME')

if not username: print("Error: DJANGO_SUPERUSER_USERNAME is not set"); sys.exit(1)
if not email: print("Error: DJANGO_SUPERUSER_EMAIL is not set"); sys.exit(1)
if not password: print("Error: DJANGO_SUPERUSER_PASSWORD is not set"); sys.exit(1)
if not display_name: print("Error: DJANGO_SUPERUSER_DISPLAY_NAME is not set"); sys.exit(1)

User = get_user_model()
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password, display_name=display_name)
    print(f"Superuser '{username}' (display name: '{display_name}') created successfully.")
else:
    print(f"Superuser '{username}' already exists.")
END
# ------------------------------------

echo "Starting Django server..."
exec "$@"