# BASE IMAGE
FROM nginx:1.24.0

# DIRECTORY SETUP
RUN mkdir -p /etc/nginx/certs

# INSTALL DEPENDENCIES
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# GENERATE CERTIFICATE
RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/certs/server.key \
    -out /etc/nginx/certs/server.crt \
    -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Example/OU=IT/CN=localhost"

# CONFIGURATION
RUN rm -f /etc/nginx/conf.d/*
COPY conf/nginx.conf /etc/nginx/nginx.conf

# START SERVER
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]