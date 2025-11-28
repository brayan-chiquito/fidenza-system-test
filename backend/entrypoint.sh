#!/bin/bash

# Esperar a que la base de datos esté lista
echo "Esperando a que la base de datos esté lista..."
python manage.py migrate --noinput

# Recopilar archivos estáticos
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Ejecutar el servidor
echo "Iniciando servidor..."
# Obtener PORT de variables de entorno o usar 8000 por defecto
PORT=${PORT:-8000}
echo "Usando puerto: $PORT"

# Siempre usar gunicorn con PORT (ignorar CMD si existe)
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3

