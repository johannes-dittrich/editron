FROM nginx:alpine

# strip default config
RUN rm /etc/nginx/conf.d/default.conf

# copy the site
COPY . /usr/share/nginx/html

# server config
RUN cat > /etc/nginx/conf.d/editron.conf <<'EOF'
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|svg|woff2?|ico)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    gzip on;
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml;
    gzip_min_length 512;
}
EOF

# drop root — nginx:alpine has a non-root nginx user
RUN sed -i 's/user  nginx;/# user  nginx;/g' /etc/nginx/nginx.conf || true

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
