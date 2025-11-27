# Documentación Técnica - API RESTful de Gestión de Tareas

## 1. Justificación del Diseño y Arquitectura

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

### 1.2 Arquitectura de Aplicaciones

**Separación de Responsabilidades:**
- `authentication`: Manejo completo de usuarios, registro y autenticación
- `tasks`: CRUD de tareas con lógica de negocio específica

**Ventajas:**
- Modularidad y mantenibilidad
- Escalabilidad independiente de cada módulo
- Facilita testing y debugging

### 1.3 Modelo de Datos

**User (Modelo Custom):**
- Hereda de `AbstractUser` para aprovechar funcionalidades de Django
- `email` como `USERNAME_FIELD` para autenticación moderna
- Campos requeridos: `first_name`, `last_name` para información completa del usuario
- Índice en `email` para búsquedas rápidas

**Task:**
- ForeignKey a User con `CASCADE` para integridad referencial
- Campo `is_deleted` para borrado lógico (soft delete)
- Índices compuestos en `['user', 'is_deleted']` y `['is_deleted', 'created_at']` para optimización
- `ordering = ['-created_at']` para listados ordenados por defecto

**Justificación del Borrado Lógico:**
- Preserva historial de datos
- Permite recuperación de tareas eliminadas
- Mejora la experiencia de usuario
- Facilita auditorías y reportes

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

**Diseño RESTful estándar:**
- GET `/api/tasks/` - Listar recursos
- POST `/api/tasks/` - Crear recurso
- GET `/api/tasks/{id}/` - Obtener recurso específico
- PUT `/api/tasks/{id}/` - Actualizar recurso completo
- PATCH `/api/tasks/{id}/` - Actualizar recurso parcial
- DELETE `/api/tasks/{id}/` - Eliminar recurso (soft delete)

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

## 2. Endpoints de la API

### 2.1 Autenticación

#### POST /api/auth/register/
Registro de nuevos usuarios. Valida email único, contraseña mínima de 8 caracteres y campos requeridos.

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

## 3. Códigos de Estado HTTP

- **200 OK**: Petición exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Recurso eliminado exitosamente
- **400 Bad Request**: Error de validación
- **401 Unauthorized**: Token inválido o faltante
- **403 Forbidden**: No tienes permiso
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

---

## 4. Manejo de Errores

**401 Unauthorized:** Token inválido, expirado o faltante. Solución: Renovar token o hacer login.

**403 Forbidden:** Intento de acceso a recurso de otro usuario. Solución: Solo se puede acceder a recursos propios.

**404 Not Found:** Recurso no existe, fue eliminado (soft delete) o no pertenece al usuario.

**400 Bad Request:** Datos inválidos. Revisar formato JSON y campos requeridos.

---

## 5. Configuración de Desarrollo

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

---

## 6. Panel de Administración

**URL:** `http://localhost:8000/admin/`

Permite gestión de usuarios y tareas desde interfaz web de Django. Útil para administración y debugging.
