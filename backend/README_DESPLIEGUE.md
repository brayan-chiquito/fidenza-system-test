# Guía de Despliegue en Railway

Esta guía explica cómo desplegar el backend en Railway paso a paso.

---

## Requisitos Previos

- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub (recomendado) o puedes subir directamente
- Proyecto backend configurado con Dockerfile

---

## Paso 1: Preparar el Repositorio

Asegúrate de que tu repositorio tenga:
- ✅ `Dockerfile` en la carpeta `backend/`
- ✅ `requirements.txt` con todas las dependencias
- ✅ `railway.json` (opcional, pero recomendado)
- ✅ `.gitignore` configurado correctamente

---

## Paso 2: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"** (recomendado) o **"Empty Project"**

---

## Paso 3: Configurar el Servicio

### Opción A: Desde GitHub (Recomendado)

1. Conecta tu repositorio de GitHub
2. Railway detectará automáticamente el `Dockerfile` en `backend/`
3. Selecciona la carpeta `backend/` como **Root Directory**
4. Railway comenzará a construir la imagen automáticamente

### Opción B: Desde Código Local

1. Crea un proyecto vacío en Railway
2. Instala Railway CLI: `npm i -g @railway/cli`
3. Ejecuta: `railway login` y luego `railway init`
4. Sube el código: `railway up`

---

## Paso 4: Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. La variable `DATABASE_URL` se configurará automáticamente

---

## Paso 5: Configurar Variables de Entorno

En la pestaña **"Variables"** de tu servicio, agrega:

### Variables Requeridas

```
SECRET_KEY=tu-secret-key-muy-seguro-generado
DEBUG=False
ALLOWED_HOSTS=*.railway.app,tu-dominio.railway.app
```

### Variables Automáticas (Railway las proporciona)

```
DATABASE_URL=postgresql://... (Railway lo configura automáticamente)
PORT=8000 (Railway lo asigna automáticamente)
```

### Generar SECRET_KEY

Puedes generar una SECRET_KEY segura ejecutando localmente:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

O usar este generador online: https://djecrety.ir/

---

## Paso 6: Configurar el Dominio

1. En la pestaña **"Settings"** de tu servicio
2. Haz clic en **"Generate Domain"** para obtener un dominio público
3. O configura un dominio personalizado si lo tienes
4. Copia el dominio y agrégalo a `ALLOWED_HOSTS` en las variables de entorno

**Ejemplo:**
```
ALLOWED_HOSTS=*.railway.app,tu-proyecto.railway.app
```

---

## Paso 7: Verificar el Despliegue

1. Railway ejecutará automáticamente:
   - `docker build` usando el Dockerfile
   - Migraciones (vía entrypoint.sh)
   - `collectstatic` (vía entrypoint.sh)
   - Inicio de gunicorn

2. Verifica los logs en la pestaña **"Deployments"**
3. Si hay errores, revisa los logs para diagnosticar

---

## Paso 8: Crear Superusuario (Opcional)

Puedes crear un superusuario usando Railway CLI:

```bash
railway run python manage.py createsuperuser
```

O usando la consola web de Railway en la pestaña **"Deployments"** → **"View Logs"** → **"Shell"**

---

## Configuración de CORS para Producción

Si tu frontend está en otro dominio, actualiza `CORS_ALLOWED_ORIGINS` en `settings.py` o usa variables de entorno:

```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://localhost:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
```

Y agrega en Railway:
```
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tu-frontend.netlify.app
```

---

## Verificar que Funciona

### 1. Probar el Admin

Visita: `https://tu-proyecto.railway.app/admin/`

### 2. Probar la API

```bash
# Registrar usuario
curl -X POST https://tu-proyecto.railway.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","password_confirm":"password123","first_name":"Test","last_name":"User"}'
```

---

## Troubleshooting

### Error: "Application failed to respond"

- Verifica que el puerto esté configurado correctamente
- Revisa los logs en Railway
- Asegúrate de que gunicorn esté usando `${PORT}`

### Error: "Database connection failed"

- Verifica que la base de datos PostgreSQL esté creada
- Revisa que `DATABASE_URL` esté configurada automáticamente
- Verifica los logs de la base de datos

### Error: "Static files not found"

- El entrypoint ejecuta `collectstatic` automáticamente
- Verifica los logs para ver si hay errores en collectstatic
- Asegúrate de que `STATIC_ROOT` esté configurado en settings.py

### Error: "ALLOWED_HOSTS"

- Agrega el dominio de Railway a `ALLOWED_HOSTS`
- Formato: `*.railway.app,tu-proyecto.railway.app`

---

## Comandos Útiles de Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Ver logs
railway logs

# Ejecutar comandos Django
railway run python manage.py migrate
railway run python manage.py createsuperuser

# Ver variables de entorno
railway variables
```

---

## Notas Importantes

1. **Railway detecta automáticamente el Dockerfile** - No necesitas configuración adicional
2. **DATABASE_URL se configura automáticamente** - Railway lo proporciona cuando agregas PostgreSQL
3. **El puerto es dinámico** - Railway asigna el puerto, el Dockerfile lo maneja automáticamente
4. **Las migraciones se ejecutan automáticamente** - Gracias al entrypoint.sh
5. **Static files se recopilan automáticamente** - Gracias al entrypoint.sh

---

## Docker Local vs Railway

**Buenas noticias:** El mismo Dockerfile funciona tanto local como en Railway.

**Diferencias:**
- **Local:** Usa `docker-compose.yml` con PostgreSQL separado
- **Railway:** Usa el Dockerfile directamente, PostgreSQL es un servicio separado
- **Puerto:** Local usa 8000 fijo, Railway usa variable `PORT` (manejado automáticamente)

**No necesitas cambios** - El Dockerfile ya está configurado para ambos casos.

---

**¡Listo para desplegar!** 🚀

