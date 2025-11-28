# Documentación Técnica - API RESTful de Gestión de Tareas

## 0. Requerimientos y Supuestos

### 0.1 Requerimientos Funcionales

**RF-01: Gestión de Usuarios**
- El sistema debe permitir el registro de nuevos usuarios con email, contraseña, nombre y apellido.
- El sistema debe permitir la autenticación de usuarios mediante email y contraseña.
- El sistema debe generar tokens JWT (access y refresh) al autenticarse.
- El sistema debe permitir la renovación de tokens de acceso mediante refresh token.

**RF-02: Gestión de Tareas**
- El sistema debe permitir crear tareas con título (obligatorio) y descripción (opcional).
- El sistema debe permitir listar todas las tareas del usuario autenticado.
- El sistema debe permitir obtener el detalle de una tarea específica.
- El sistema debe permitir actualizar una tarea (completa o parcialmente).
- El sistema debe permitir eliminar tareas (borrado lógico).
- El sistema debe filtrar automáticamente las tareas eliminadas en los listados.
- El sistema debe asociar automáticamente cada tarea al usuario autenticado.

**RF-03: Seguridad y Permisos**
- El sistema debe requerir autenticación JWT para acceder a los endpoints de tareas.
- El sistema debe verificar que un usuario solo pueda acceder a sus propias tareas.
- El sistema debe validar que las contraseñas tengan mínimo 8 caracteres.
- El sistema debe validar que el email sea único en el sistema.

**RF-04: Frontend**
- El sistema debe proporcionar una interfaz web para gestionar tareas.
- El sistema debe permitir iniciar sesión y registrarse desde la interfaz.
- El sistema debe mostrar las tareas pendientes y completadas por separado.
- El sistema debe permitir crear, editar y eliminar tareas desde la interfaz.
- El sistema debe mantener la sesión del usuario después de recargar la página.
- El sistema debe renovar automáticamente los tokens expirados.

### 0.2 Requerimientos No Funcionales

**RNF-01: Rendimiento**
- El sistema debe responder a las peticiones en menos de 500ms para operaciones CRUD básicas.
- El sistema debe implementar paginación con 20 elementos por página para listados.
- El sistema debe utilizar índices en la base de datos para optimizar consultas frecuentes.

**RNF-02: Escalabilidad**
- El sistema debe estar diseñado para soportar múltiples usuarios concurrentes.
- El sistema debe utilizar arquitectura modular que permita escalar componentes independientemente.
- El sistema debe estar preparado para deployment en servicios cloud (Railway, Render, Vercel).

**RNF-03: Mantenibilidad**
- El código debe seguir principios SOLID y clean code.
- El código debe estar documentado y ser fácil de entender.
- El sistema debe tener cobertura de tests superior al 70% (actualmente: 91%).

**RNF-04: Seguridad**
- El sistema debe utilizar HTTPS en producción.
- El sistema debe implementar CORS para controlar accesos desde el frontend.
- El sistema debe validar y sanitizar todos los inputs del usuario.
- Los tokens JWT deben tener expiración configurada (access: 24h, refresh: 7 días).

**RNF-05: Usabilidad**
- La interfaz debe ser intuitiva y responsive.
- La interfaz debe soportar modo oscuro/claro.
- La interfaz debe proporcionar feedback visual inmediato a las acciones del usuario.

**RNF-06: Compatibilidad**
- El backend debe ser compatible con Python 3.10+.
- El frontend debe ser compatible con navegadores modernos (Chrome, Firefox, Safari, Edge).
- El sistema debe funcionar en sistemas operativos Windows, Linux y macOS.

### 0.3 Supuestos Relevantes

**SUP-01: Alcance del Proyecto**
- Se asume que este es un sistema de gestión de tareas personales (no colaborativo).
- Se asume que no se requiere funcionalidad de recuperación de contraseña en esta fase.
- Se asume que no se requiere funcionalidad de compartir tareas entre usuarios.

**SUP-02: Infraestructura**
- Se asume que el backend y frontend pueden ejecutarse en diferentes dominios/orígenes.
- Se asume que PostgreSQL está disponible como base de datos.
- Se asume que el sistema se ejecutará en un entorno con Docker disponible (opcional pero recomendado).

**SUP-03: Seguridad**
- Se asume que el almacenamiento de tokens JWT en localStorage es aceptable para esta prueba técnica.
- Se asume que en producción se implementarían medidas adicionales (httpOnly cookies, CSP, etc.).
- Se asume que el backend manejará la validación y sanitización de datos.

**SUP-04: Usuarios**
- Se asume que los usuarios tienen conocimientos básicos de uso de aplicaciones web.
- Se asume que los usuarios utilizarán navegadores modernos con JavaScript habilitado.

**SUP-05: Datos**
- Se asume que las tareas eliminadas (soft delete) no necesitan ser recuperables por el usuario final.
- Se asume que no se requiere historial de cambios en las tareas.
- Se asume que no se requiere funcionalidad de categorías o etiquetas en esta fase.

**SUP-06: Tecnología**
- Se asume que Django REST Framework es adecuado para la construcción de la API.
- Se asume que Vue 3 con Composition API es adecuado para el frontend.
- Se asume que TypeScript mejora la mantenibilidad del código frontend.

---

## 1. Modelo de Datos y Relaciones

### 1.1 Diagrama de Entidad-Relación (ERD)

```
┌─────────────────────────────────┐
│            User                 │
├─────────────────────────────────┤
│ PK  id (BigAutoField)           │
│     email (EmailField, UNIQUE)  │
│     password (CharField)        │
│     first_name (CharField)      │
│     last_name (CharField)       │
│     username (CharField, NULL)  │
│     is_active (Boolean)          │
│     is_staff (Boolean)          │
│     is_superuser (Boolean)      │
│     date_joined (DateTime)      │
│     last_login (DateTime, NULL) │
└─────────────────────────────────┘
              │
              │ 1
              │
              │ N
              │
              ▼
┌─────────────────────────────────┐
│            Task                 │
├─────────────────────────────────┤
│ PK  id (BigAutoField)           │
│ FK  user_id (ForeignKey)        │
│     title (CharField, 200)      │
│     description (TextField)     │
│     completed (Boolean)         │
│     is_deleted (Boolean)        │
│     created_at (DateTime)       │
│     updated_at (DateTime)       │
└─────────────────────────────────┘
```

### 1.2 Descripción de Entidades y Relaciones

**Entidad: User**
- **Descripción**: Representa a un usuario del sistema. Hereda de `AbstractUser` de Django.
- **Campos principales**:
  - `id`: Identificador único (clave primaria, auto-incremental)
  - `email`: Correo electrónico único del usuario (usado para autenticación, indexado)
  - `password`: Contraseña hasheada (manejada por Django)
  - `first_name`: Nombre del usuario (requerido)
  - `last_name`: Apellido del usuario (requerido)
  - `username`: Campo heredado de AbstractUser (opcional, puede ser NULL)
  - `is_active`: Indica si la cuenta está activa
  - `date_joined`: Fecha de registro del usuario
  - `last_login`: Fecha del último inicio de sesión
- **Índices**: `email` (db_index=True)
- **Relaciones**: 
  - Uno a Muchos con `Task` (un usuario puede tener múltiples tareas)

**Entidad: Task**
- **Descripción**: Representa una tarea personal asociada a un usuario.
- **Campos principales**:
  - `id`: Identificador único (clave primaria, auto-incremental)
  - `user`: Referencia al usuario propietario (ForeignKey, CASCADE)
  - `title`: Título de la tarea (requerido, máximo 200 caracteres)
  - `description`: Descripción detallada de la tarea (opcional)
  - `completed`: Indica si la tarea está completada (default: False)
  - `is_deleted`: Indica si la tarea fue eliminada lógicamente (default: False, indexado)
  - `created_at`: Fecha y hora de creación (auto, indexado)
  - `updated_at`: Fecha y hora de última actualización (auto)
- **Índices**:
  - `is_deleted` (db_index=True)
  - `created_at` (db_index=True)
  - Compuesto: `['user', 'is_deleted']` (optimiza consultas de tareas por usuario)
  - Compuesto: `['is_deleted', 'created_at']` (optimiza consultas ordenadas)
- **Relaciones**:
  - Muchos a Uno con `User` (múltiples tareas pertenecen a un usuario)
  - Relación: `CASCADE` (si se elimina un usuario, se eliminan sus tareas)

**Relación User-Task**
- **Tipo**: Uno a Muchos (1:N)
- **Cardinalidad**: Un usuario puede tener cero o más tareas. Una tarea pertenece exactamente a un usuario.
- **Integridad referencial**: `CASCADE` - Si se elimina un usuario, todas sus tareas se eliminan también.
- **Acceso inverso**: Desde un objeto `User`, se puede acceder a sus tareas mediante `user.tasks.all()` (related_name='tasks').

### 1.3 Características del Modelo

**Borrado Lógico (Soft Delete)**
- Las tareas no se eliminan físicamente de la base de datos.
- El campo `is_deleted=True` marca una tarea como eliminada.
- Los listados automáticamente excluyen tareas con `is_deleted=True`.
- Permite recuperación de datos y auditorías.

**Optimizaciones**
- Índices en campos frecuentemente consultados (`email`, `is_deleted`, `created_at`).
- Índices compuestos para consultas comunes (`['user', 'is_deleted']`).
- Ordenamiento por defecto: `-created_at` (más recientes primero).

---

## 2. Listado de Endpoints Implementados

### 2.1 Endpoints de Autenticación

| Método | Ruta | Descripción | Autenticación Requerida |
|--------|------|-------------|-------------------------|
| POST | `/api/auth/register/` | Registro de nuevos usuarios. Valida email único, contraseña mínima de 8 caracteres y campos requeridos. | No |
| POST | `/api/auth/login/` | Autenticación de usuarios. Retorna tokens JWT (access y refresh) e información del usuario. | No |
| POST | `/api/auth/refresh/` | Renovación de access token usando refresh token. Retorna nuevo access token y nuevo refresh token (rotación). | No (requiere refresh token válido) |

### 2.2 Endpoints de Tareas

Todos los endpoints de tareas requieren autenticación JWT mediante header `Authorization: Bearer {token}`.

| Método | Ruta | Descripción | Autenticación Requerida |
|--------|------|-------------|-------------------------|
| GET | `/api/tasks/` | Lista todas las tareas del usuario autenticado. Excluye tareas eliminadas (is_deleted=True). Respuesta paginada (20 elementos por página). | Sí |
| POST | `/api/tasks/` | Crea una nueva tarea. El campo `user` se asigna automáticamente desde el token JWT. Requiere `title` (obligatorio) y `description` (opcional). | Sí |
| GET | `/api/tasks/{id}/` | Obtiene el detalle de una tarea específica. Retorna 404 si la tarea no existe, fue eliminada o no pertenece al usuario. | Sí |
| PUT | `/api/tasks/{id}/` | Actualiza una tarea completa. Requiere todos los campos editables (`title`, `description`, `completed`). | Sí |
| PATCH | `/api/tasks/{id}/` | Actualiza una tarea parcialmente. Solo requiere los campos a modificar. Útil para marcar como completada sin cambiar otros campos. | Sí |
| DELETE | `/api/tasks/{id}/` | Realiza borrado lógico de la tarea (is_deleted=True). La tarea no se elimina físicamente de la base de datos. Retorna 204 No Content. | Sí |

### 2.3 Resumen de Endpoints

- **Total de endpoints**: 9
- **Endpoints públicos**: 3 (registro, login, refresh)
- **Endpoints protegidos**: 6 (CRUD de tareas)
- **Métodos HTTP utilizados**: GET, POST, PUT, PATCH, DELETE

---

## 3. Justificación del Diseño y Arquitectura

### 1.1 Stack Tecnológico

**Framework:** Django 4.2+ con Django REST Framework
- Django proporciona una base sólida y escalable para aplicaciones web
- DRF facilita la creación de APIs RESTful con funcionalidades avanzadas (serializers, viewsets, autenticación)

**Base de Datos:** PostgreSQL 14+
- Base de datos relacional robusta para producción
- Soporte para índices compuestos y consultas complejas
- Compatibilidad con servicios de hosting (Railway, Render)

**Autenticación:** JWT con djangorestframework-simplejwt
- Tokens stateless que no requieren almacenamiento en servidor
- Refresh tokens para renovación automática sin reautenticación
- Estándar de la industria para APIs RESTful

**CORS:** django-cors-headers
- Permite comunicación entre frontend y backend en diferentes orígenes
- Configurado para desarrollo local (localhost:5173, localhost:3000)
- Configurado para producción mediante variable de entorno `CORS_ALLOWED_ORIGINS`

**Containerización:** Docker y Docker Compose
- Dockerfile optimizado para producción con Python 3.11-slim
- Docker Compose para desarrollo local con PostgreSQL
- Entrypoint script para automatizar migraciones y collectstatic
- Gunicorn como servidor WSGI para producción (3 workers)

### 1.2 Arquitectura de Aplicaciones

**Separación de Responsabilidades:**
- `authentication`: Manejo completo de usuarios, registro y autenticación
- `tasks`: CRUD de tareas con lógica de negocio específica

**Ventajas:**
- Modularidad y mantenibilidad
- Escalabilidad independiente de cada módulo
- Facilita testing y debugging

### 1.3 Modelo de Datos

*Nota: Para una descripción detallada del modelo de datos, diagrama ERD y relaciones, consultar la sección 1 "Modelo de Datos y Relaciones".*

**Resumen:**
- **User**: Modelo custom que hereda de `AbstractUser`, utiliza `email` como identificador único para autenticación.
- **Task**: Modelo de tareas con relación ForeignKey a User, implementa borrado lógico mediante `is_deleted`.
- **Relación**: Uno a Muchos (1:N) - Un usuario puede tener múltiples tareas, una tarea pertenece a un usuario.

### 1.4 Seguridad

**Autenticación JWT:**
- Access token con expiración de 24 horas
- Refresh token con expiración de 7 días
- Rotación de refresh tokens para mayor seguridad
- Blacklist de tokens rotados

**Permisos:**
- `IsAuthenticated`: Requerido para todos los endpoints de tareas
- `IsOwner`: Verificación de propiedad a nivel de objeto
- Validación en `get_queryset()` para filtrado automático

**Validaciones:**
- Contraseñas mínimas de 8 caracteres
- Validación de email único
- Validación de campos requeridos
- Sanitización de inputs

### 1.5 Endpoints RESTful

*Nota: Para el listado completo de endpoints implementados con métodos, rutas y descripciones, consultar la sección 2 "Listado de Endpoints Implementados".*

**Diseño RESTful estándar:**
- Endpoints de autenticación: registro, login y refresh token
- Endpoints de tareas: CRUD completo (GET, POST, PUT, PATCH, DELETE)
- Todos los endpoints de tareas requieren autenticación JWT

**Ventajas:**
- Estándar de la industria
- Fácil de entender y documentar
- Compatible con herramientas de testing

### 1.6 Paginación

**Configuración:**
- `PageNumberPagination` con 20 elementos por página
- Reduce carga en el servidor
- Mejora tiempos de respuesta
- Escalable para grandes volúmenes de datos

### 1.7 Testing

**Cobertura:** 91% del código de la aplicación
- 25 tests unitarios e integración
- Tests de autenticación, CRUD y permisos
- Validación de casos edge y errores
- Uso de `APIClient` para simular peticiones HTTP

---

## 4. Detalles de Endpoints de la API

**Nota sobre URLs:** Todos los ejemplos usan `https://tu-dominio.railway.app` como base. Reemplaza con tu dominio real:
- Dominio Railway por defecto: `https://tu-proyecto-production.up.railway.app`
- Dominio Railway corto: `https://tu-proyecto.railway.app`
- Dominio personalizado: `https://api.tudominio.com`

### 2.1 Autenticación

#### POST /api/auth/register/
Registro de nuevos usuarios. Valida email único, contraseña mínima de 8 caracteres y campos requeridos.

**URL completa:** `https://tu-dominio.railway.app/api/auth/register/`

**Request:**
```json
{
    "email": "usuario@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "Juan",
    "last_name": "Pérez"
}
```

**Response (201):**
```json
{
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 2,
        "email": "usuario@example.com",
        "first_name": "Juan",
        "last_name": "Pérez"
    }
}
```

#### POST /api/auth/login/
Autenticación de usuarios. Retorna tokens JWT (access y refresh) e información del usuario.

**URL completa:** `https://tu-dominio.railway.app/api/auth/login/`

**Request:**
```json
{
    "email": "usuario@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
        "id": 1,
        "email": "usuario@example.com",
        "first_name": "Juan",
        "last_name": "Pérez",
        "is_active": true
    }
}
```

#### POST /api/auth/refresh/
Renovación de access token usando refresh token. Retorna nuevo access token y nuevo refresh token (rotación).

**URL completa:** `https://tu-dominio.railway.app/api/auth/refresh/`

**Request:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2.2 Tareas

Todos los endpoints de tareas requieren autenticación JWT mediante header `Authorization: Bearer {token}`.

#### GET /api/tasks/
Lista todas las tareas del usuario autenticado. Excluye tareas eliminadas (is_deleted=True). Respuesta paginada.

**URL completa:** `https://tu-dominio.railway.app/api/tasks/`

**Headers requeridos:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "title": "Mi primera tarea",
            "description": "Descripción de la tarea",
            "completed": false,
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

#### POST /api/tasks/
Crea una nueva tarea. El campo `user` se asigna automáticamente desde el token JWT.

**URL completa:** `https://tu-dominio.railway.app/api/tasks/`

**Headers requeridos:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
    "title": "Completar proyecto",
    "description": "Finalizar la documentación",
    "completed": false
}
```

**Response (201):**
```json
{
    "id": 2,
    "title": "Completar proyecto",
    "description": "Finalizar la documentación",
    "completed": false,
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
}
```

#### GET /api/tasks/{id}/
Obtiene el detalle de una tarea específica. Retorna 404 si la tarea no existe, fue eliminada o no pertenece al usuario.

**Response (200):**
```json
{
    "id": 1,
    "title": "Mi primera tarea",
    "description": "Descripción de la tarea",
    "completed": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}
```

#### PUT /api/tasks/{id}/
Actualiza una tarea completa. Requiere todos los campos editables.

**Request:**
```json
{
    "title": "Tarea actualizada",
    "description": "Nueva descripción",
    "completed": true
}
```

**Response (200):**
```json
{
    "id": 1,
    "title": "Tarea actualizada",
    "description": "Nueva descripción",
    "completed": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
}
```

#### PATCH /api/tasks/{id}/
Actualiza una tarea parcialmente. Solo requiere los campos a modificar.

**Request:**
```json
{
    "completed": true
}
```

**Response (200):**
```json
{
    "id": 1,
    "title": "Mi primera tarea",
    "description": "Descripción de la tarea",
    "completed": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:30:00Z"
}
```

#### DELETE /api/tasks/{id}/
Realiza borrado lógico de la tarea (is_deleted=True). La tarea no se elimina físicamente de la base de datos.

**Response (204):** No Content

---

## 5. Códigos de Estado HTTP

- **200 OK**: Petición exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Recurso eliminado exitosamente
- **400 Bad Request**: Error de validación
- **401 Unauthorized**: Token inválido o faltante
- **403 Forbidden**: No tienes permiso
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

---

## 6. Manejo de Errores

**401 Unauthorized:** Token inválido, expirado o faltante. Solución: Renovar token o hacer login.

**403 Forbidden:** Intento de acceso a recurso de otro usuario. Solución: Solo se puede acceder a recursos propios.

**404 Not Found:** Recurso no existe, fue eliminado (soft delete) o no pertenece al usuario.

**400 Bad Request:** Datos inválidos. Revisar formato JSON y campos requeridos.

---

## 7. Configuración de Desarrollo

### 7.1 Desarrollo Local (Sin Docker)

**Iniciar servidor:**
```bash
cd backend
python manage.py runserver
```

**Ejecutar tests:**
```bash
python manage.py test
```

**Ver cobertura de tests:**
```bash
coverage run --source='authentication,tasks' manage.py test
coverage report
coverage html
```

**Credenciales de prueba:**
- Email: `superuser@gmail.com`
- Password: `159753brayan`

### 7.2 Desarrollo con Docker

**Requisitos previos:**
- Docker y Docker Compose instalados
- Archivo `.env` configurado en `backend/` (ver sección 7.3)

**Iniciar servicios (backend + PostgreSQL):**
```bash
cd backend
docker-compose up --build
```

**Ejecutar comandos dentro del contenedor:**
```bash
# Crear superusuario
docker-compose exec web python manage.py createsuperuser

# Ejecutar migraciones
docker-compose exec web python manage.py migrate

# Ejecutar tests
docker-compose exec web python manage.py test
```

**Detener servicios:**
```bash
docker-compose down
```

**Detener y eliminar volúmenes (incluye base de datos):**
```bash
docker-compose down -v
```

### 7.3 Variables de Entorno

Crear archivo `.env` en `backend/` con las siguientes variables:

**Para desarrollo local (sin Docker):**
```env
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Para desarrollo con Docker:**
```env
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:postgres@db:5432/fidenza_db
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Nota:** `DATABASE_URL` en Docker Compose se configura automáticamente, pero puede sobrescribirse en `.env`.

---

## 8. Dockerización del Backend

### 8.1 Estructura de Docker

**Dockerfile:**
- Imagen base: `python:3.11-slim`
- Instala dependencias del sistema (PostgreSQL client)
- Copia `requirements.txt` e instala dependencias de Python
- Copia el código del proyecto
- Configura entrypoint para ejecutar migraciones y collectstatic
- Expone puerto 8000 (o variable `PORT` en producción)
- Ejecuta Gunicorn con 3 workers

**Entrypoint (`entrypoint.sh`):**
- Ejecuta migraciones automáticamente (`python manage.py migrate --noinput`)
- Recopila archivos estáticos (`python manage.py collectstatic --noinput`)
- Lee variable `PORT` de entorno (default: 8000)
- Inicia Gunicorn con el puerto configurado

**Docker Compose (`docker-compose.yml`):**
- Servicio `db`: PostgreSQL 14 con healthcheck
- Servicio `web`: Backend Django con volumen montado para desarrollo
- Volumen persistente para datos de PostgreSQL
- Configuración de red interna entre servicios

### 8.2 Ventajas de la Dockerización

- **Consistencia:** Mismo entorno en desarrollo y producción
- **Aislamiento:** Dependencias aisladas del sistema host
- **Portabilidad:** Funciona en cualquier sistema con Docker
- **Escalabilidad:** Fácil escalar servicios independientemente
- **Reproducibilidad:** Mismo comportamiento en todos los entornos

### 8.3 Optimizaciones para Producción

- Imagen base ligera (`python:3.11-slim`)
- Cache de capas de Docker para builds más rápidos
- `.dockerignore` para excluir archivos innecesarios
- Gunicorn con múltiples workers para mejor rendimiento
- Variables de entorno para configuración flexible

---

## 9. Deployment en Railway

### 9.1 Configuración Inicial

**Requisitos:**
- Cuenta en Railway
- Repositorio Git (GitHub, GitLab, etc.)
- Proyecto con Dockerfile configurado

**Pasos para desplegar:**

1. **Conectar repositorio:**
   - Iniciar sesión en Railway
   - Crear nuevo proyecto
   - Conectar repositorio Git

2. **Configurar servicio:**
   - Railway detectará automáticamente el Dockerfile
   - Si el proyecto es monorepo, configurar "Root Directory" a `backend`
   - O usar `railway.json` para especificar configuración

3. **Agregar base de datos PostgreSQL:**
   - En Railway, agregar servicio PostgreSQL
   - Railway generará automáticamente `DATABASE_URL`
   - Esta variable se inyecta automáticamente al servicio web

### 9.2 Variables de Entorno en Railway

Configurar las siguientes variables en Railway (Settings → Variables):

**Obligatorias:**
```env
SECRET_KEY=tu-secret-key-seguro-aqui
DEBUG=False
ALLOWED_HOSTS=tu-dominio.up.railway.app,*.up.railway.app
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

**Opcionales (con valores por defecto):**
```env
PORT=8000  # Railway lo proporciona automáticamente
DATABASE_URL=postgresql://...  # Railway lo proporciona automáticamente
```

**Notas importantes:**
- `DATABASE_URL` se configura automáticamente al agregar PostgreSQL
- `PORT` es proporcionado por Railway automáticamente
- `ALLOWED_HOSTS` debe incluir el dominio de Railway (`*.up.railway.app`)
- `CORS_ALLOWED_ORIGINS` debe incluir la URL del frontend en producción

### 9.3 Configuración de `railway.json`

Archivo en la raíz del proyecto para configurar Railway:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Para monorepo:**
- Si el Dockerfile está en `backend/Dockerfile`, configurar:
  - "Root Directory" en Railway UI: `backend`
  - O `dockerfilePath: "backend/Dockerfile"` en `railway.json`

### 9.4 Proceso de Deployment

1. **Build:**
   - Railway construye la imagen Docker
   - Instala dependencias de Python
   - Copia código del proyecto

2. **Deploy:**
   - Ejecuta `entrypoint.sh`
   - Ejecuta migraciones automáticamente
   - Recopila archivos estáticos
   - Inicia Gunicorn en el puerto proporcionado

3. **Health Check:**
   - Railway verifica que el servicio responda
   - Si falla, reintenta según `restartPolicyMaxRetries`

### 9.5 Verificación Post-Deployment

**Verificar que el servicio está corriendo:**
- Revisar logs en Railway Dashboard
- Verificar que no hay errores de migración
- Confirmar que Gunicorn está escuchando en el puerto correcto

**Probar endpoints:**
- `https://tu-dominio.up.railway.app/api/auth/register/` (debe mostrar interfaz DRF)
- Verificar que CORS está configurado correctamente
- Probar login y registro desde el frontend

### 9.6 Dominio Personalizado y Llamadas a la API

#### 9.6.1 Usar el Dominio de Railway (Por Defecto)

Railway proporciona automáticamente un dominio con el formato:
```
https://tu-proyecto-production.up.railway.app
```

**Ejemplo de llamadas a la API:**

```bash
# Registro de usuario
POST https://fidenza-system-test-production.up.railway.app/api/auth/register/

# Login
POST https://fidenza-system-test-production.up.railway.app/api/auth/login/

# Listar tareas (requiere autenticación)
GET https://fidenza-system-test-production.up.railway.app/api/tasks/
Authorization: Bearer <access_token>
```

**En el frontend (variable de entorno):**
```env
VITE_API_BASE_URL=https://fidenza-system-test-production.up.railway.app
```

#### 9.6.2 Configurar Tu Propio Dominio Personalizado

Railway permite usar tu propio dominio registrado (no el generado por Railway). Esto es útil si ya tienes un dominio propio y quieres usarlo para la API.

**Requisitos previos:**
- Tener un dominio registrado (ej: `tudominio.com`, `midominio.net`)
- Acceso al panel de control de tu proveedor DNS (donde compraste el dominio)
- Saber cómo configurar registros DNS (CNAME o A)

**Pasos para configurar tu dominio personalizado:**

1. **En Railway Dashboard:**
   - Ve a tu proyecto → Servicio del backend
   - Click en la pestaña **"Settings"**
   - Scroll hasta la sección **"Domains"** o **"Custom Domain"**
   - Click en **"Add Custom Domain"** o **"Custom Domain"**

2. **Ingresar tu dominio:**
   - Ingresa el subdominio que quieres usar (ej: `api.tudominio.com` o `backend.tudominio.com`)
   - **Recomendación:** Usa un subdominio como `api.` en lugar del dominio raíz
   - Ejemplos válidos:
     - `api.tudominio.com` ✅
     - `backend.tudominio.com` ✅
     - `api-fidenza.tudominio.com` ✅
     - `tudominio.com` ⚠️ (posible pero no recomendado, mejor usar subdominio)

3. **Railway te proporcionará información DNS:**
   - Railway mostrará un registro **CNAME** o **A** que debes configurar
   - Ejemplo de CNAME: `api.tudominio.com` → `tu-proyecto-production.up.railway.app`
   - O un registro A con una IP específica

4. **Configurar DNS en tu proveedor:**
   
   **Opción A: Usando CNAME (Recomendado)**
   - Ve al panel de control de tu proveedor DNS (GoDaddy, Namecheap, Cloudflare, etc.)
   - Busca la sección de "DNS Records" o "Zone Records"
   - Agrega un nuevo registro:
     - **Tipo:** CNAME
     - **Nombre/Host:** `api` (o el subdominio que elegiste)
     - **Valor/Target:** El dominio que Railway te proporcionó (ej: `tu-proyecto-production.up.railway.app`)
     - **TTL:** 3600 (o el valor por defecto)

   **Opción B: Usando registro A (si Railway lo requiere)**
   - **Tipo:** A
   - **Nombre/Host:** `api`
   - **Valor/Target:** La IP que Railway te proporcionó
   - **TTL:** 3600

5. **Esperar propagación DNS:**
   - Los cambios DNS pueden tardar desde minutos hasta 48 horas
   - Normalmente toma entre 5-30 minutos
   - Puedes verificar la propagación con herramientas como:
     - `https://dnschecker.org`
     - `nslookup api.tudominio.com` (en terminal)
     - `dig api.tudominio.com` (en terminal)

6. **Verificar en Railway:**
   - Railway verificará automáticamente cuando el DNS esté configurado correctamente
   - El estado cambiará de "Pending" a "Active" cuando esté listo
   - Railway configurará automáticamente el certificado SSL/HTTPS

**Ejemplo completo:**

Supongamos que tienes el dominio `midominio.com` y quieres usar `api.midominio.com`:

1. En Railway, agregas `api.midominio.com` como dominio personalizado
2. Railway te dice: "Configura CNAME: `api.midominio.com` → `fidenza-system-test-production.up.railway.app`"
3. Vas a tu proveedor DNS (ej: GoDaddy) y agregas:
   ```
   Tipo: CNAME
   Nombre: api
   Valor: fidenza-system-test-production.up.railway.app
   ```
4. Esperas 5-30 minutos
5. Railway detecta el DNS y activa el dominio
6. Ahora puedes usar: `https://api.midominio.com/api/auth/register/`

**Nota sobre dominio Railway corto (opcional):**
Si no tienes un dominio propio, Railway también puede generar un dominio más corto que el predeterminado:
- Dominio predeterminado: `fidenza-system-test-production.up.railway.app`
- Dominio Railway corto: `fidenza-api.railway.app` (más corto, pero sigue siendo de Railway)
- Para esto, usa la opción "Generate Domain" en Railway (no requiere configuración DNS)

**Ejemplo de dominio personalizado propio:**
```
# Antes (dominio largo de Railway)
https://fidenza-system-test-production.up.railway.app

# Después (tu dominio personalizado)
https://api.tudominio.com
# o
https://backend.tudominio.com
# o cualquier subdominio de tu dominio
```

**Nota:** Si no tienes un dominio propio, Railway puede generar uno más corto (`fidenza-api.railway.app`), pero sigue siendo de Railway. Para usar tu propio dominio, debes tenerlo registrado y configurar DNS.

#### 9.6.3 Actualizar Variables de Entorno Después de Configurar Tu Dominio

**⚠️ Importante:** Después de configurar tu dominio personalizado, debes actualizar las variables de entorno en ambos servicios.

**1. En Railway (Backend):**

Actualizar `ALLOWED_HOSTS` para incluir tu dominio personalizado:
```env
ALLOWED_HOSTS=api.tudominio.com,*.railway.app
```

**Explicación:**
- `api.tudominio.com` → Tu dominio personalizado (reemplaza con el tuyo)
- `*.railway.app` → Permite todos los subdominios de Railway (útil si también quieres usar el dominio de Railway)
- Puedes agregar múltiples dominios separados por comas: `api.tudominio.com,backend.tudominio.com,*.railway.app`

**Ejemplo real:**
Si tu dominio es `midominio.com` y configuraste `api.midominio.com`:
```env
ALLOWED_HOSTS=api.midominio.com,*.railway.app
```

**2. En Vercel (Frontend):**

Actualizar `VITE_API_BASE_URL` con tu dominio personalizado:
```env
VITE_API_BASE_URL=https://api.tudominio.com
```

**Ejemplo real:**
Si tu dominio es `midominio.com` y configuraste `api.midominio.com`:
```env
VITE_API_BASE_URL=https://api.midominio.com
```

**⚠️ Importante:**
- Debe incluir `https://` (Railway proporciona SSL automáticamente)
- No debe terminar en barra final (`/`)
- Debe ser exactamente el dominio que configuraste en Railway

**3. Redesplegar ambos servicios:**
- **Railway:** Automático o manual desde Deployments
- **Vercel:** Automático después del push o manual

#### 9.6.4 Ejemplos de Llamadas con Tu Dominio Personalizado

**Con tu dominio personalizado (recomendado):**
```bash
# Registro
POST https://api.tudominio.com/api/auth/register/
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "password_confirm": "password123",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```

**Ejemplo con dominio real:**
Si tu dominio es `midominio.com` y configuraste `api.midominio.com`:
```bash
# Login
POST https://api.midominio.com/api/auth/login/
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Con cURL usando tu dominio:**
```bash
# Crear tarea
curl -X POST https://api.tudominio.com/api/tasks/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi nueva tarea",
    "description": "Descripción de la tarea"
  }'
```

**Ejemplo real con dominio `midominio.com`:**
```bash
curl -X GET https://api.midominio.com/api/tasks/ \
  -H "Authorization: Bearer <access_token>"
```

**Con JavaScript/Fetch usando tu dominio:**
```javascript
// Usando fetch con tu dominio personalizado
const API_BASE_URL = 'https://api.tudominio.com'; // Tu dominio

const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const tasks = await response.json();
```

**Con Axios (como en el frontend) usando tu dominio:**
```javascript
import axios from 'axios';

// Usar variable de entorno o tu dominio directamente
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.tudominio.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usar la API
const tasks = await api.get('/api/tasks/');
```

#### 9.6.5 Ventajas de Usar Tu Propio Dominio Personalizado

- **Más profesional:** Usa tu propio dominio en lugar del de Railway
- **Más fácil de recordar:** `api.tudominio.com` vs `fidenza-system-test-production.up.railway.app`
- **Más corto en código:** Menos caracteres en variables de entorno y código
- **Mejor branding:** Tu dominio, tu marca
- **Mejor para documentación:** URLs más limpias y profesionales en documentación de API
- **Flexibilidad:** Puedes cambiar de proveedor (Railway, Render, etc.) sin cambiar el dominio
- **Control total:** Tú decides el nombre del subdominio (`api`, `backend`, `rest`, etc.)
- **Confianza:** Los usuarios ven tu dominio, no el de Railway

#### 9.6.6 Notas Importantes Sobre Tu Dominio Personalizado

- **HTTPS automático:** Railway configura automáticamente SSL/HTTPS para tu dominio personalizado (gratis)
- **Costo del dominio:** Necesitas tener tu propio dominio registrado (puede costar ~$10-15/año)
- **Configuración DNS:** Debes tener acceso al panel DNS de tu proveedor de dominio
- **Propagación DNS:** Los cambios pueden tardar desde minutos hasta 48 horas (normalmente 5-30 minutos)
- **Certificado SSL:** Railway gestiona automáticamente los certificados SSL (Let's Encrypt)
- **Renovación automática:** Railway renueva automáticamente los certificados SSL
- **Múltiples dominios:** Puedes configurar varios subdominios (ej: `api.tudominio.com`, `backend.tudominio.com`)
- **Verificación:** Railway verifica automáticamente cuando el DNS está configurado correctamente

### 9.7 Troubleshooting Común

**Error: "No changes detected" en migraciones:**
- Verificar que los modelos están correctamente definidos
- Ejecutar `makemigrations` localmente y commitear

**Error: "Port not valid":**
- Verificar que `entrypoint.sh` lee `PORT` correctamente
- Revisar que Gunicorn usa `${PORT:-8000}`

**Error de CORS:**
- Verificar que `CORS_ALLOWED_ORIGINS` incluye el dominio del frontend
- Asegurarse de que no hay espacios en la variable de entorno

**Error de base de datos:**
- Verificar que `DATABASE_URL` está configurado
- Confirmar que PostgreSQL está corriendo y accesible

**Error después de cambiar dominio:**
- Verificar que `ALLOWED_HOSTS` incluye el nuevo dominio
- Verificar que `CORS_ALLOWED_ORIGINS` está actualizado si es necesario
- Verificar que `VITE_API_BASE_URL` en Vercel está actualizado
- Redesplegar ambos servicios después de cambiar dominios

---

## 10. Panel de Administración

**URL local:** `http://localhost:8000/admin/`
**URL producción:** `https://tu-dominio.up.railway.app/admin/`

Permite gestión de usuarios y tareas desde interfaz web de Django. Útil para administración y debugging.

**Nota:** En producción, asegúrate de tener un superusuario creado para acceder al panel.

---

# Documentación Técnica - Frontend TaskFlow

## 11. Justificación del Diseño y Arquitectura

### 1.1 Stack Tecnológico

**Framework: Vue 3 (Composition API)**
- Vue 3 ofrece excelente rendimiento y reactividad granular
- Composition API proporciona mejor organización del código y reutilización de lógica
- Ecosistema maduro con herramientas y bibliotecas de calidad
- TypeScript nativo para mayor seguridad de tipos

**Build Tool: Vite 7.1.11**
- Desarrollo extremadamente rápido con Hot Module Replacement (HMR)
- Builds optimizados para producción con code splitting automático
- Soporte nativo para TypeScript y Vue SFC
- Compatible con la versión de Vite 3+ como se solicitó

**Gestión de Estado: Pinia**
- Store oficial recomendado para Vue 3 (sucesor de Vuex)
- API simple y tipada con TypeScript
- DevTools integradas para debugging
- Mejor rendimiento y menos boilerplate que Vuex

**Routing: Vue Router 4**
- Routing oficial de Vue con soporte completo para TypeScript
- Navigation guards para protección de rutas
- Lazy loading de componentes para optimización
- Historial de navegación configurable

**HTTP Client: Axios**
- Interceptores para manejo centralizado de requests/responses
- Manejo automático de renovación de tokens JWT
- Timeout configurable y manejo de errores robusto
- Ampliamente adoptado en el ecosistema Vue/React

**Estilos: Tailwind CSS 3.4**
- Utility-first CSS para desarrollo rápido
- Dark mode nativo con configuración de clases
- PurgeCSS integrado para bundles pequeños en producción
- Diseño responsive con breakpoints predefinidos
- Compatible con PostCSS para optimización

**TypeScript 5.9**
- Type safety en todo el proyecto
- Autocompletado mejorado y detección temprana de errores
- Mejor mantenibilidad y documentación implícita
- Interfaces y tipos compartidos con el backend

### 1.2 Arquitectura de la Aplicación

**Patrón de Arquitectura: Component-Based con Separación de Responsabilidades**

```
frontend/
├── src/
│   ├── api/           # Capa de comunicación con el backend
│   ├── components/    # Componentes reutilizables (UI)
│   ├── composables/   # Lógica reutilizable (custom hooks)
│   ├── router/        # Configuración de rutas
│   ├── stores/        # Estado global (Pinia)
│   ├── types/         # Definiciones de tipos TypeScript
│   ├── utils/         # Utilidades y helpers
│   ├── views/         # Vistas/páginas principales
│   └── styles/        # Estilos globales
```

**Ventajas de esta arquitectura:**
- **Modularidad**: Cada carpeta tiene una responsabilidad clara
- **Escalabilidad**: Fácil agregar nuevas features sin afectar otras
- **Mantenibilidad**: Código organizado y fácil de navegar
- **Testabilidad**: Componentes y lógica aislados para testing
- **Reutilización**: Componentes y composables reutilizables

### 1.3 Principios de Diseño Aplicados

**SOLID Principles:**
- **Single Responsibility**: Cada módulo/componente tiene una única responsabilidad
- **Open/Closed**: Extensible mediante composables y stores sin modificar código existente
- **Dependency Inversion**: Abstracción mediante interfaces y tipos

**Clean Code:**
- **DRY (Don't Repeat Yourself)**: Lógica común en composables y utilidades
- **KISS (Keep It Simple, Stupid)**: Soluciones simples y directas
- **YAGNI (You Aren't Gonna Need It)**: Solo implementar lo necesario

**Vue Best Practices:**
- Composition API para mejor organización
- TypeScript para type safety
- Computed properties para valores derivados
- Watchers para efectos secundarios
- Props y emits tipados

## 12. Estructura del Proyecto

### 2.1 Capa de API (`src/api/`)

**`client.ts`**: Cliente Axios configurado con interceptores
- Base URL desde variables de entorno
- Interceptor de requests: Agrega token JWT automáticamente
- Interceptor de responses: Maneja errores 401 y renueva tokens
- Sistema de cola para evitar múltiples renovaciones simultáneas
- Timeout de 10 segundos para evitar requests colgados

**`auth.ts`**: Servicios de autenticación
- `login()`: Inicio de sesión
- `register()`: Registro de usuarios
- `refreshToken()`: Renovación de tokens

**`tasks.ts`**: Servicios de gestión de tareas
- CRUD completo de tareas
- Funciones tipadas con TypeScript
- Manejo de paginación

### 2.2 Gestión de Estado (`src/stores/`)

**`auth.ts`**: Store de autenticación
- Estado: usuario, tokens, loading, error
- Getters: `isAuthenticated`, `fullName`
- Acciones: `login()`, `register()`, `logout()`, `refreshAccessToken()`, `initializeAuth()`

**`tasks.ts`**: Store de tareas
- Estado: lista de tareas, tarea actual, paginación, loading, error
- Getters: `pendingTasks`, `completedTasks`, `stats`, `completionPercentage`
- Acciones: CRUD completo, `toggleComplete()`, `fetchTasks()`

**Justificación de Pinia:**
- Estado centralizado pero no sobrecargado
- Reactividad automática en todos los componentes
- Type-safe con TypeScript
- Fácil de testear

### 2.3 Componentes (`src/components/`)

**`ui/Modal.vue`**: Modal reutilizable
- Teleport para renderizado en body
- Backdrop con blur
- Manejo de tecla Escape
- Click fuera para cerrar
- Animaciones suaves

**`ui/Drawer.vue`**: Drawer lateral
- Animación de slide desde la derecha
- Scroll interno independiente
- Mismo sistema de manejo que Modal
- z-index configurado para evitar conflictos

**Justificación:**
- Componentes UI reutilizables y modulares
- Accesibilidad considerada (Escape, focus)
- Estilos consistentes con Tailwind

### 2.4 Composables (`src/composables/`)

**`useAuth.ts`**: Lógica de autenticación reutilizable
- Helpers para verificar autenticación
- Funciones de redirección condicional
- Computed properties para estado del usuario

**`useTasks.ts`**: Lógica de tareas reutilizable
- Formateo de fechas
- Filtrado y búsqueda
- Helpers para estado de tareas

**`useTheme.ts`**: Gestión de tema oscuro/claro
- Persistencia en localStorage
- Detección de preferencias del sistema
- Toggle de tema

**Justificación de Composables:**
- Reutilización de lógica entre componentes
- Separación de concerns
- Fácil de testear de forma aislada
- Patrón recomendado en Vue 3

### 2.5 Utilidades (`src/utils/`)

**`token.ts`**: Manejo de tokens JWT
- Guardado/carga desde localStorage
- Persistencia de usuario
- Limpieza de tokens al logout

**`date.ts`**: Utilidades de fechas
- Formateo de fechas en español
- Fechas relativas ("hace 2 días")
- Consistencia en toda la aplicación

### 2.6 Rutas (`src/router/`)

**Configuración de rutas:**
- `/login` - Página de inicio de sesión (pública)
- `/register` - Página de registro (pública)
- `/` - Dashboard de tareas (protegida)
- `/*` - Redirección a `/` (catch-all)

**Navigation Guards:**
- Verificación de autenticación antes de cada ruta
- Inicialización automática desde localStorage
- Redirección inteligente según estado de autenticación

### 2.7 Vistas (`src/views/`)

**`LoginView.vue`**: Página de inicio de sesión
- Formulario con validación
- Manejo de errores del servidor
- Redirección automática si ya está autenticado

**`RegisterView.vue`**: Página de registro
- Validación de formulario en tiempo real
- Indicador de fortaleza de contraseña
- Validación de coincidencia de contraseñas
- Auto-login después del registro

**`DashboardView.vue`**: Vista principal de tareas
- Listado de tareas pendientes y completadas
- Estadísticas de progreso
- Modales para crear/editar tareas
- Drawer para detalles de tarea
- Búsqueda y filtrado

## 13. Decisiones de Diseño Importantes

### 3.1 Almacenamiento de Tokens en localStorage

**Decisión:** Guardar access token y refresh token en localStorage

**Justificación:**
- **Para esta prueba técnica**: Es una práctica común y aceptable
- Persistencia entre recargas de página
- Fácil de implementar sin cambios en backend
- Tokens tienen expiración (access: 24h, refresh: 7 días)
- Rotación de refresh tokens habilitada

**Consideraciones de seguridad:**
- localStorage es vulnerable a XSS
- Mitigaciones: Tokens con expiración, rotación, CORS configurado
- Para producción: Considerar httpOnly cookies o sessionStorage

**Código relacionado:** `src/utils/token.ts`

### 3.2 Renovación Automática de Tokens

**Decisión:** Interceptor de Axios que renueva tokens automáticamente

**Implementación:**
- Detecta errores 401 (token expirado)
- Renueva automáticamente usando refresh token
- Reintenta el request original con el nuevo token
- Sistema de cola para evitar múltiples renovaciones simultáneas

**Ventajas:**
- Experiencia de usuario fluida (sin interrupciones)
- Transparente para los componentes
- Manejo centralizado de autenticación

**Código relacionado:** `src/api/client.ts` (interceptor de responses)

### 3.3 Componentes UI Modales y Drawers

**Decisión:** Teleport para renderizar modales/drawers en body

**Justificación:**
- Evita problemas de z-index y overflow
- Mejor accesibilidad y manejo de focus
- Separación visual del DOM

**Features:**
- Backdrop con blur
- Animaciones suaves
- Cierre con Escape o click fuera
- z-index diferenciado (Modal: 60, Drawer: 50)

**Código relacionado:** `src/components/ui/Modal.vue`, `src/components/ui/Drawer.vue`

### 3.4 Gestión de Estado Centralizada

**Decisión:** Pinia stores para estado global

**Estructura:**
- Store separado para autenticación y tareas
- Estado reactivo con computed properties
- Acciones async para operaciones con API
- Getters para valores derivados

**Ventajas:**
- Estado compartido entre componentes
- Lógica de negocio centralizada
- Fácil de debuggear con DevTools
- Type-safe con TypeScript

### 3.5 Dark Mode con Persistencia

**Decisión:** Tema oscuro/claro con detección de preferencias del sistema

**Implementación:**
- Clase `dark` en `<html>` para Tailwind
- Persistencia en localStorage
- Detección de `prefers-color-scheme`
- Toggle manual del usuario

**Código relacionado:** `src/composables/useTheme.ts`

### 3.6 Validación de Formularios

**Decisión:** Validación en tiempo real con feedback visual

**Implementación:**
- Validación HTML5 nativa (required, type, pattern)
- Indicador de fortaleza de contraseña
- Validación de coincidencia de contraseñas
- Mensajes de error del servidor

**Ventajas:**
- Mejor UX con feedback inmediato
- Menos requests fallidos al servidor
- Validación en frontend y backend (defensa en profundidad)

## 14. Flujos Principales

### 4.1 Flujo de Autenticación

1. **Inicio de sesión:**
   - Usuario ingresa credenciales
   - Request a `/api/auth/login/`
   - Backend retorna tokens y datos del usuario
   - Store guarda tokens en memoria y localStorage
   - Router redirige a dashboard

2. **Persistencia de sesión:**
   - Al recargar página, `App.vue` llama `initializeAuth()`
   - Store carga tokens y usuario desde localStorage
   - Router guard verifica autenticación
   - Si válido, permite acceso; si no, redirige a login

3. **Renovación de tokens:**
   - Request falla con 401
   - Interceptor detecta token expirado
   - Renueva automáticamente con refresh token
   - Reintenta request original
   - Si falla renovación, hace logout

4. **Cierre de sesión:**
   - Usuario hace click en logout
   - Store limpia tokens y usuario
   - localStorage se limpia
   - Router redirige a login

### 4.2 Flujo de Gestión de Tareas

1. **Carga inicial:**
   - Dashboard se monta
   - Store hace request a `/api/tasks/`
   - Tareas se cargan con paginación
   - UI muestra listas separadas (pendientes/completadas)

2. **Crear tarea:**
   - Usuario abre modal de nueva tarea
   - Ingresa título (requerido) y descripción (opcional)
   - Store crea tarea en backend
   - Lista se actualiza automáticamente (reactividad)

3. **Editar tarea:**
   - Usuario abre modal de edición
   - Puede modificar título, descripción y estado
   - Store actualiza en backend
   - UI se actualiza automáticamente

4. **Eliminar tarea:**
   - Usuario confirma eliminación
   - Modal de confirmación
   - Store elimina en backend (soft delete)
   - Tarea desaparece de la lista

## 15. Seguridad

### 5.1 Autenticación JWT

- Tokens almacenados en localStorage (ver sección 3.1)
- Access token en header `Authorization: Bearer <token>`
- Refresh token para renovación automática
- Tokens expiran según configuración del backend

### 5.2 Protección de Rutas

- Navigation guards verifican autenticación
- Rutas protegidas requieren token válido
- Redirección automática a login si no autenticado

### 5.3 Validación de Inputs

- Validación HTML5 en formularios
- Sanitización en backend (defensa adicional)
- Validación de tipos con TypeScript

### 5.4 CORS

- Backend configurado para aceptar requests del frontend
- Headers apropiados configurados
- No se envían credenciales sensibles en URLs

## 16. Optimizaciones

### 6.1 Code Splitting

- Rutas con lazy loading: `() => import('@/views/LoginView.vue')`
- Reduce tamaño del bundle inicial
- Carga bajo demanda de componentes

### 6.2 Tree Shaking

- Vite elimina código no usado automáticamente
- Tailwind CSS con purge para eliminar estilos no usados
- Imports específicos de bibliotecas

### 6.3 Reactividad Eficiente

- Computed properties para valores derivados
- Evita re-renders innecesarios
- Pinia optimiza actualizaciones de estado

### 6.4 Imágenes y Assets

- Assets estáticos en `/public/`
- Favicon optimizado
- Material Symbols como fuente (no imágenes)

## 17. Guía de Desarrollo

### 7.1 Requisitos Previos

- Node.js 20.19.0+ o 22.12.0+
- npm o yarn
- Backend corriendo en `http://localhost:8000` (o configurar variable de entorno)

### 7.2 Instalación

```bash
cd frontend
npm install
```

### 7.3 Variables de Entorno

**Para desarrollo local:**

Crear archivo `.env.local` en el directorio `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Nota:** El proyecto incluye `.env.example` como referencia. Las variables de entorno deben empezar con `VITE_` para que Vite las exponga al código del frontend.

**Para producción (Vercel):**

Configurar en Vercel Dashboard → Settings → Environment Variables:
- **Nombre:** `VITE_API_BASE_URL`
- **Valor:** URL del backend en producción (ej: `https://fidenza-system-test-production.up.railway.app`)
- **Environment:** Production (y Preview/Development si aplica)

**⚠️ Importante:**
- Las variables deben incluir el protocolo (`https://` en producción)
- No deben terminar en barra final (`/`)
- Vercel necesita redesplegar para aplicar nuevas variables de entorno

### 7.4 Scripts Disponibles

```bash
# Desarrollo (con HMR)
npm run dev

# Build para producción (con type-check)
npm run build

# Build para producción (sin type-check, más rápido para CI/CD)
npm run build:production

# Preview de build de producción
npm run preview

# Type checking
npm run type-check

# Linter (con auto-fix)
npm run lint

# Formatear código
npm run format

# Tests unitarios
npm run test:unit
```

**Nota:** El script `build:production` está optimizado para deployments en Vercel y omite el type-check para builds más rápidos. Úsalo solo en CI/CD; para builds locales, usa `npm run build` para verificar tipos.

### 7.5 Estructura de Archivos

```
frontend/
├── src/
│   ├── api/              # Servicios de API
│   │   ├── auth.ts      # Endpoints de autenticación
│   │   ├── client.ts    # Cliente Axios configurado
│   │   └── tasks.ts     # Endpoints de tareas
│   ├── components/       # Componentes Vue
│   │   └── ui/          # Componentes de UI reutilizables
│   ├── composables/     # Lógica reutilizable (hooks)
│   ├── router/          # Configuración de rutas
│   ├── stores/          # Stores de Pinia
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   ├── views/           # Vistas/páginas
│   ├── styles/          # Estilos globales
│   ├── App.vue          # Componente raíz
│   └── main.ts          # Punto de entrada
├── vercel.json          # Configuración de deployment en Vercel
├── .env.example         # Ejemplo de variables de entorno
├── vite.config.ts       # Configuración de Vite
├── package.json         # Dependencias y scripts
└── tsconfig.json        # Configuración de TypeScript
```

### 7.6 Convenciones de Código

- **Componentes:** PascalCase (`LoginView.vue`)
- **Composables:** camelCase con prefijo `use` (`useAuth.ts`)
- **Stores:** camelCase (`auth.ts`)
- **Types:** PascalCase (`User`, `Task`)
- **Utils:** camelCase (`token.ts`)

### 7.7 Agregar Nueva Feature

1. **Nuevo endpoint de API:**
   - Agregar función en `src/api/`
   - Tipar request/response en `src/types/`

2. **Nueva vista:**
   - Crear componente en `src/views/`
   - Agregar ruta en `src/router/index.ts`

3. **Nuevo store:**
   - Crear archivo en `src/stores/`
   - Definir estado, getters y acciones

4. **Nuevo componente reutilizable:**
   - Crear en `src/components/ui/` o subdirectorio apropiado
   - Documentar props y emits

## 18. Testing

### 8.1 Configuración

- Vitest como framework de testing
- Vue Test Utils para componentes
- jsdom para ambiente de DOM

### 8.2 Ejecutar Tests

```bash
npm run test:unit
```

### 8.3 Estructura de Tests

- Tests en `__tests__/` junto a los archivos
- Archivos `.spec.ts` o `.test.ts`
- Ejemplo: `src/__tests__/App.spec.ts`

## 19. Build y Deployment

### 9.1 Build de Producción

**Para desarrollo local:**
```bash
npm run build
```
Este comando ejecuta type-check antes del build para asegurar que no hay errores de TypeScript.

**Para deployment en Vercel:**
```bash
npm run build:production
```
Este comando ejecuta solo `vite build` sin type-check, optimizando el tiempo de build en CI/CD.

Genera carpeta `dist/` con:
- Código minificado y optimizado
- Code splitting automático
- Assets optimizados
- Source maps (opcionales)

### 9.2 Preview Local

```bash
npm run preview
```

Sirve el build de producción localmente para pruebas.

### 9.3 Deployment

El frontend puede desplegarse en:
- **Vercel**: Deployment automático desde Git (configurado actualmente)
- **Netlify**: Similar a Vercel
- **GitHub Pages**: Para proyectos estáticos
- **Servidor propio**: Servir carpeta `dist/` con nginx/apache

#### 9.3.1 Deployment en Vercel

**Configuración implementada:**

El proyecto incluye `vercel.json` en la raíz del directorio `frontend/` con la siguiente configuración:

```json
{
  "buildCommand": "npm run build:production",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Características importantes:**

1. **Script de build optimizado**: Se usa `build:production` que ejecuta solo `vite build` (sin type-check) para deployments más rápidos en Vercel.
   - Script definido en `package.json`: `"build:production": "vite build"`

2. **SPA Routing**: Los `rewrites` configuran Vercel para redirigir todas las rutas a `index.html`, permitiendo que Vue Router maneje el routing del lado del cliente.

3. **DevTools deshabilitados en producción**: `vite-plugin-vue-devtools` está configurado para ejecutarse solo en desarrollo:
   ```typescript
   vueDevTools({
     enabled: process.env.NODE_ENV !== 'production',
   })
   ```

**Pasos para desplegar en Vercel:**

1. **Conectar repositorio:**
   - Iniciar sesión en [Vercel](https://vercel.com)
   - Crear nuevo proyecto
   - Conectar repositorio Git (GitHub, GitLab, etc.)
   - Si el proyecto está en un monorepo, configurar "Root Directory" a `frontend`

2. **Configurar variables de entorno:**
   - En Vercel Dashboard → Settings → Environment Variables
   - Agregar variable:
     - **Nombre:** `VITE_API_BASE_URL`
     - **Valor:** URL del backend en producción (ej: `https://fidenza-system-test-production.up.railway.app`)
     - **Environment:** Production, Preview, Development (según corresponda)

3. **Configuración automática:**
   - Vercel detectará automáticamente el framework (Vite) desde `vercel.json`
   - Usará el `buildCommand` y `outputDirectory` especificados
   - Configurará automáticamente los rewrites para SPA routing

4. **Deployment:**
   - Vercel desplegará automáticamente en cada push a la rama principal
   - Cada deployment genera una URL única para preview
   - El dominio de producción se configura en Settings → Domains

**Pasos para conectar Frontend (Vercel) con Backend (Railway):**

1. **En Railway (Backend):**
   - Ve a Railway → Tu proyecto → Backend service → Variables
   - Agregar o editar variable `CORS_ALLOWED_ORIGINS`
   - Valor: El dominio exacto de Vercel (ej: `https://fidenza-system-test-frontend.vercel.app`)
   - ⚠️ **Importante:** Debe incluir `https://`, sin barra final, sin espacios
   - Si tienes múltiples dominios, separarlos por comas: `https://frontend.vercel.app,http://localhost:5173`
   - **Redesplegar el backend** después de cambiar la variable (Railway → Deployments → Redeploy)

2. **En Vercel (Frontend):**
   - Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables
   - Agregar variable:
     - **Nombre:** `VITE_API_BASE_URL`
     - **Valor:** URL del backend en Railway (ej: `https://fidenza-system-test-production.up.railway.app`)
     - **Environment:** Production (y Preview/Development si aplica)
   - ⚠️ **Importante:** Debe incluir `https://`, sin barra final

3. **Redeploy ambos servicios:**
   - **Railway:** Ve a Deployments → tres puntos (`...`) → Redeploy (obligatorio después de cambiar variables)
   - **Vercel:** Redesplegar automáticamente después del push o manualmente desde Dashboard

**Verificación post-deployment:**

1. Verificar que el frontend carga correctamente
2. Abrir DevTools (F12) → Console
3. Debe mostrarse la URL del backend configurada
4. Probar login/registro para verificar que la comunicación con el backend funciona
5. Verificar que el routing funciona (navegar entre páginas y recargar)

**Troubleshooting común:**

- **Error 404 en rutas:** Verificar que `vercel.json` tiene los `rewrites` configurados
- **Error de conexión:** Verificar que `VITE_API_BASE_URL` está configurada en Vercel y que el backend tiene `CORS_ALLOWED_ORIGINS` con el dominio de Vercel
- **Error de build:** Verificar que el script `build:production` existe y funciona localmente
- **TypeScript errors en build:** El script `build:production` omite type-check para deployments más rápidos; usar `npm run build` localmente para verificar tipos

## 20. Troubleshooting

### 10.1 Error: "Cannot find module '@/...'"

- Verificar que `tsconfig.json` tiene el alias `@` configurado
- Verificar que `vite.config.ts` tiene el mismo alias

### 10.2 Error de CORS

- Verificar que backend tiene configurado CORS para el origen del frontend
  - En Railway: Variable `CORS_ALLOWED_ORIGINS` debe contener el dominio exacto de Vercel
  - Formato: `https://tu-frontend.vercel.app` (con `https://`, sin barra final, sin espacios)
- Verificar variable de entorno `VITE_API_BASE_URL` en Vercel
- **Importante:** Después de cambiar `CORS_ALLOWED_ORIGINS` en Railway, es obligatorio redesplegar el backend
- Verificar en Network tab del navegador que las solicitudes OPTIONS (preflight) retornan el header `Access-Control-Allow-Origin` con el dominio correcto

### 10.3 Tokens no persisten después de recargar

- Verificar que `initializeAuth()` se llama en `App.vue`
- Verificar localStorage en DevTools del navegador

### 10.4 Estilos de Tailwind no se aplican

- Verificar que `main.css` importa las directivas de Tailwind
- Verificar que `tailwind.config.js` tiene los paths correctos en `content`

## 21. Mejoras Futuras

### 11.1 Funcionalidades

- [ ] Recuperación de contraseña
- [ ] Búsqueda avanzada de tareas
- [ ] Filtros por fecha
- [ ] Exportar tareas a CSV/PDF
- [ ] Notificaciones push
- [ ] Compartir tareas entre usuarios

### 11.2 Optimizaciones

- [ ] Service Worker para PWA
- [ ] Lazy loading de imágenes
- [ ] Virtual scrolling para listas grandes
- [ ] Caché de requests con stale-while-revalidate
- [ ] Optimistic updates en UI

### 11.3 Seguridad

- [ ] Migrar tokens a httpOnly cookies
- [ ] Implementar Content Security Policy (CSP)
- [ ] Rate limiting en frontend
- [ ] Validación más estricta de inputs

### 11.4 Testing

- [ ] Aumentar cobertura de tests
- [ ] Tests E2E con Playwright/Cypress
- [ ] Tests de componentes con Vue Test Utils
- [ ] Tests de integración de stores

## 22. Referencias

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vite.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Axios Documentation](https://axios-http.com/)

---

**Autor:** brayan chiquito 
**Versión:** 1.0.0  
**Última actualización:** 2025
