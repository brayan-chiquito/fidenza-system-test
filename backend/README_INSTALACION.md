# Guía de Instalación - Backend

Esta guía explica cómo instalar y ejecutar el backend del proyecto de dos formas: usando Docker (recomendado) o manualmente.

---

## Opción 1: Instalación con Docker (Recomendado) 🐳

### Requisitos Previos
- Docker instalado
- Docker Compose instalado

### Pasos

1. **Crear archivo `.env`**
   
   Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

   ```env
   SECRET_KEY=tu-secret-key-muy-seguro-aqui
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_URL=postgresql://postgres:postgres@db:5432/fidenza_db
   ```

2. **Construir y ejecutar con Docker Compose**

   ```bash
   cd backend
   docker-compose up --build
   ```

3. **Listo! 🎉**

   El servidor estará disponible en: `http://localhost:8000`

   La base de datos PostgreSQL se crea automáticamente y las migraciones se ejecutan al iniciar.

### Comandos Útiles

```bash
# Detener los contenedores
docker-compose down

# Ver logs
docker-compose logs -f web

# Ejecutar comandos Django
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py migrate
```

---

## Opción 2: Instalación Manual 🔧

### Requisitos Previos
- Python 3.11 o superior
- PostgreSQL 14+ instalado y corriendo
- pip (gestor de paquetes de Python)

### Pasos

1. **Crear entorno virtual**

   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activar entorno virtual**

   **Windows (Git Bash):**
   ```bash
   source venv/Scripts/activate
   ```

   **Windows (CMD/PowerShell):**
   ```bash
   venv\Scripts\activate
   ```

   **Linux/Mac:**
   ```bash
   source venv/bin/activate
   ```

3. **Instalar dependencias**

   ```bash
   pip install -r requirements.txt
   ```

4. **Crear archivo `.env`**

   Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

   ```env
   SECRET_KEY=tu-secret-key-muy-seguro-aqui
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_base_datos
   ```

   **Ejemplo de DATABASE_URL:**
   ```env
   DATABASE_URL=postgresql://postgres:mi_password@localhost:5432/fidenza_db
   ```

   **Nota:** Si no configuras `DATABASE_URL`, el proyecto usará SQLite automáticamente (solo para desarrollo).

5. **Aplicar migraciones**

   ```bash
   python manage.py migrate
   ```

6. **Crear superusuario (opcional)**

   ```bash
   python manage.py createsuperuser
   ```

7. **Ejecutar servidor**

   ```bash
   python manage.py runserver
   ```

8. **Listo! 🎉**

   El servidor estará disponible en: `http://localhost:8000`

---

## Variables de Entorno (.env)

El archivo `.env` debe contener las siguientes variables:

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SECRET_KEY` | Clave secreta de Django (genera una única) | `django-insecure-abc123...` |
| `DEBUG` | Modo debug (True para desarrollo, False para producción) | `True` |
| `ALLOWED_HOSTS` | Hosts permitidos (separados por comas) | `localhost,127.0.0.1` |

### Variables Opcionales

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:5432/dbname` |

**Nota:** Si no defines `DATABASE_URL`, el proyecto usará SQLite automáticamente.

### Generar SECRET_KEY

Puedes generar una SECRET_KEY segura ejecutando:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

O usar este comando en Django:

```bash
python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Verificar Instalación

### 1. Verificar que el servidor está corriendo

Abre tu navegador y visita: `http://localhost:8000/admin/`

Si ves la página de login de Django, la instalación fue exitosa.

### 2. Probar la API

Puedes probar los endpoints usando Postman o curl:

```bash
# Registrar usuario
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","password_confirm":"password123","first_name":"Test","last_name":"User"}'
```

---

## Solución de Problemas

### Error: "No module named 'django'"
- Asegúrate de haber activado el entorno virtual
- Verifica que instalaste las dependencias: `pip install -r requirements.txt`

### Error: "Could not connect to database"
- Verifica que PostgreSQL esté corriendo
- Revisa que `DATABASE_URL` en `.env` sea correcta
- Si usas Docker, verifica que el contenedor de la base de datos esté corriendo

### Error: "Port 8000 is already in use"
- Detén otros procesos usando el puerto 8000
- O cambia el puerto: `python manage.py runserver 8001`

### Error: "ModuleNotFoundError: No module named 'psycopg2'"
- Instala psycopg2: `pip install psycopg2-binary`
- O verifica que `requirements.txt` esté instalado correctamente

---

## Estructura del Proyecto

```
backend/
├── authentication/     # App de autenticación
├── tasks/             # App de tareas
├── config/            # Configuración de Django
├── manage.py          # Script de gestión de Django
├── requirements.txt   # Dependencias del proyecto
├── Dockerfile         # Configuración de Docker
├── docker-compose.yml # Configuración de Docker Compose
├── .env              # Variables de entorno (crear manualmente)
└── README_INSTALACION.md  # Este archivo
```

---

## Siguiente Paso

Una vez instalado, consulta `README_API_BACK.md` para ver la documentación completa de la API.

---

**¡Listo para desarrollar!** 🚀

