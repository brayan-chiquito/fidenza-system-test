# Usar imagen oficial de Python
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto
COPY . .

# Hacer ejecutable el entrypoint
RUN chmod +x entrypoint.sh

# Crear directorio para archivos estáticos
RUN mkdir -p /app/staticfiles

# Exponer puerto (Railway usa variable PORT, local usa 8000)
EXPOSE 8000

# Entrypoint para ejecutar migraciones y collectstatic antes de iniciar
ENTRYPOINT ["./entrypoint.sh"]

# Comando para ejecutar la aplicación
# Railway proporciona PORT como variable de entorno, local usa 8000 por defecto
CMD sh -c "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3"

