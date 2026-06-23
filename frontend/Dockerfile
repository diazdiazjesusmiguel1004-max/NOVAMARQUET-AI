# Stage 1: Build React UI
FROM node:20-alpine AS builder

WORKDIR /app

# Install package dependencies
COPY package*.json /app/
RUN npm install

# Copy source and build distribution
COPY . /app/
RUN npm run build

# Stage 2: Serve assets with Nginx
FROM nginx:1.25-alpine

# Copy built React production folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config to support React routing (redirect 404 to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
