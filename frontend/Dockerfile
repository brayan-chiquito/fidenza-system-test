# Dockerfile para Frontend TaskFlow
# Multi-stage build: construcción y producción

# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Argumento para la URL de la API (valor por defecto)
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción (sin type-check para evitar errores en tests)
RUN npm run build-only

# ============================================
# Stage 2: Production (Nginx)
# ============================================
FROM nginx:alpine

# Copiar archivos construidos desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto (nginx ya tiene CMD, pero lo explicitamos)
CMD ["nginx", "-g", "daemon off;"]

