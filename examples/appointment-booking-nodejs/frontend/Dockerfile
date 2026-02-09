FROM nginx:alpine

# Copy pre-built Angular dist from local build
COPY dist/frontend/browser /usr/share/nginx/html

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
