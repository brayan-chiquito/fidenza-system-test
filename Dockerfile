# Dockerfile para Railway (construye desde la raíz del proyecto)
# Este Dockerfile copia desde backend/ porque Railway construye desde la raíz

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto backend completo
COPY backend/ .

# Hacer ejecutable el entrypoint
RUN chmod +x entrypoint.sh

# Crear directorio para archivos estáticos
RUN mkdir -p /app/staticfiles

EXPOSE 8000

# Entrypoint para ejecutar migraciones y collectstatic
ENTRYPOINT ["./entrypoint.sh"]

# El entrypoint manejará el inicio si no se pasa comando
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

