FROM python:3.11-slim

# Install system dependencies for Postgres
# -y say yes to all prompts during installation
# libpq-dev: PostgreSQL development files, needed for psycopg2
# psycopg2 is the PostgreSQL database adapter, needed by django container
# zlib1g-dev: zlib development files
# Pillow (Python Imaging Library) needs libjpeg-dev, libpng-dev, zlib1g-dev headers
# delete 30-40MB list downloaded by apt-get in order to save space 
# pip package installer for python, -r means read from file
# no-cache-dir flags prevents it to save also the install files inside the container
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN sed -i 's/\r$//' entrypoint.sh
# this parameter is set for daphe, because it doesnt start with manage.py
ENV DJANGO_SETTINGS_MODULE=user_project.settings

EXPOSE 8001
ENTRYPOINT ["sh", "/app/entrypoint.sh"]