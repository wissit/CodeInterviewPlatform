# =============================
# Stage 1: Build Frontend
# =============================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package.json and lockfile
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code and config
COPY frontend/ ./

# Build the frontend (Vite -> dist)
RUN npm run build

# =============================
# Stage 2: Build Backend
# =============================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Copy package.json and lockfile
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY backend/ ./

# Build the backend (TypeScript -> dist)
RUN npm run build

# =============================
# Stage 3: Final Runtime
# =============================
FROM node:20-alpine

# Install Nginx
RUN apk add --no-cache nginx

# Create directory structure
WORKDIR /app

# Copy built frontend Assets to Nginx default directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy built Backend code
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./

# Install only production dependencies for backend
RUN npm ci --only=production

# Copy Nginx Configuration and Startup Script
COPY nginx/nginx.prod.conf /etc/nginx/nginx.conf
COPY start.sh /start.sh

# Make start script executable
RUN chmod +x /start.sh

# Expose Port 80
EXPOSE 80

# Environment variables should be passed at runtime
# ENV NODE_ENV=production

# Start Nginx and Node
CMD ["/start.sh"]
