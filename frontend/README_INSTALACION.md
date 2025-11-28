# Guía de Instalación - Frontend TaskFlow

Guía simple y directa para ejecutar el frontend de TaskFlow en tu máquina.

## 📋 Índice

- [Opción 1: Con Docker (Recomendado)](#opción-1-con-docker-recomendado)
- [Opción 2: Instalación Manual](#opción-2-instalación-manual)
- [Troubleshooting](#troubleshooting)

---

## Opción 1: Con Docker (Recomendado)

Esta opción es la más simple porque **no necesitas instalar Node.js ni ninguna dependencia**. Solo necesitas Docker.

### Requisitos

- Docker Desktop instalado y corriendo
  - Descargar: [docker.com](https://www.docker.com/products/docker-desktop)
  - Verificar: `docker --version`

### Pasos

1. **Navegar a la carpeta frontend:**
   ```bash
   cd frontend
   ```

2. **Crear archivo `.env.local`** (opcional, solo si tu API está en otra URL):
   
   Copia el archivo de ejemplo:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env.local
   
   # Linux/Mac
   cp .env.example .env.local
   ```
   
   Si la URL por defecto (`http://localhost:8000`) es correcta, puedes saltarte este paso.

3. **Ejecutar con Docker Compose:**
   ```bash
   docker-compose up --build
   ```

4. **Abrir en el navegador:**
   🌐 **http://localhost:3000**

### Detener el contenedor

Presiona `Ctrl + C` en la terminal, o en otra terminal:
```bash
docker-compose down
```

### Comandos útiles

```bash
# Ver logs
docker-compose logs -f

# Reconstruir imagen
docker-compose up --build

# Detener y eliminar
docker-compose down
```

---

## Opción 2: Instalación Manual

Esta opción requiere instalar Node.js en tu sistema.

### Requisitos

- **Node.js** versión 20.19.0+ o 22.12.0+
  - Verificar: `node --version`
  - Descargar: [nodejs.org](https://nodejs.org/)
- **npm** (viene incluido con Node.js)
  - Verificar: `npm --version`

### Pasos

1. **Navegar a la carpeta frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```
   
   Este comando descargará e instalará todas las dependencias necesarias (puede tardar 1-3 minutos).

3. **Crear archivo `.env.local`**:
   
   Copia el archivo de ejemplo:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env.local
   
   # Linux/Mac
   cp .env.example .env.local
   ```
   
   O créalo manualmente con el contenido:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
   🌐 **http://localhost:5173**

   Verás un mensaje en la terminal indicando que el servidor está corriendo.

### Detener el servidor

Presiona `Ctrl + C` en la terminal.

### Comandos útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo con hot reload

# Build y preview
npm run build            # Construir para producción
npm run preview          # Preview del build de producción

# Testing
npm run test:unit        # Ejecutar tests
npm run test:coverage    # Ver cobertura de tests

# Calidad de código
npm run lint             # Verificar código con ESLint
npm run format           # Formatear código
npm run type-check       # Verificar tipos de TypeScript
```

---

## Variables de Entorno

### Archivo `.env.local`

Este archivo contiene las variables de entorno para tu entorno local. **No se sube a git** por seguridad.

**Crear el archivo:**

1. **Opción más fácil:** Copia el archivo de ejemplo:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env.local
   
   # Linux/Mac
   cp .env.example .env.local
   ```

2. **O créalo manualmente** con este contenido:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

### Cambiar la URL del backend

Si tu backend está en otra URL, edita `.env.local` y cambia el valor:

```env
# Ejemplo: Backend en otra máquina
VITE_API_BASE_URL=http://192.168.1.100:8000

# Ejemplo: Backend en producción
VITE_API_BASE_URL=https://api.tu-dominio.com
```

**Nota:** 
- El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio
- El archivo `.env.example` es solo un template y sí se sube a git

---

## Troubleshooting

### Problema: Error "Cannot find module"

**Solución:**
```bash
# Eliminar e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Problema: Puerto 5173 o 3000 ya está en uso

**Solución:**

- **Docker:** Cambia el puerto en `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:80"  # Cambia 3000 a otro número
  ```

- **Instalación manual:** Usa otro puerto:
  ```bash
  npm run dev -- --port 5174
  ```

### Problema: Docker no inicia

**Solución:**
1. Asegúrate de que Docker Desktop esté abierto y corriendo
2. Espera a que el ícono en la bandeja esté estable (no animándose)
3. Intenta de nuevo

### Problema: npm install falla

**Solución:**
```bash
# Limpiar cache de npm
npm cache clean --force

# Instalar de nuevo
npm install
```

### Problema: La aplicación no se conecta al backend

**Verificar:**
1. El archivo `.env.local` existe y tiene la URL correcta
2. El backend está corriendo en la URL especificada
3. No hay errores en la consola del navegador (F12)

**Probar conexión:**
```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:8000/api/tasks/

# Linux/Mac
curl http://localhost:8000/api/tasks/
```

### Problema: Build de Docker falla

**Solución:**
```bash
# Reconstruir sin usar cache
docker-compose build --no-cache
docker-compose up
```

---

## Verificación

Una vez ejecutado, deberías:

✅ Ver la aplicación en el navegador  
✅ Ver la página de login  
✅ No tener errores en la consola del navegador (F12)

---

## Archivos Necesarios

### Archivos que ya existen (no necesitas crearlos)

- ✅ `package.json` - Define todas las dependencias del proyecto
- ✅ `Dockerfile` - Para construir la imagen Docker
- ✅ `docker-compose.yml` - Para ejecutar con Docker
- ✅ `.env.example` - Template de variables de entorno

### Archivo que debes crear

- 📝 `.env.local` - Variables de entorno para tu entorno local

**Cómo crearlo:**
```bash
# Copiar desde el ejemplo (más fácil)
cp .env.example .env.local

# O crearlo manualmente con el contenido:
# VITE_API_BASE_URL=http://localhost:8000
```

**Nota:** 
- No necesitas un `requirements.txt` como en Python
- En Node.js, todas las dependencias se definen en `package.json` y se instalan con `npm install`
- El archivo `.env.local` NO se sube a git (está en `.gitignore`)

---

## Comparación Rápida

| Característica | Docker | Instalación Manual |
|----------------|--------|-------------------|
| Requiere Node.js | ❌ No | ✅ Sí |
| Setup | 1 comando | 3 comandos |
| Ideal para | Probar rápido | Desarrollo activo |

---

## Siguiente Paso

Una vez que tengas la aplicación corriendo:

1. Abre tu navegador en `http://localhost:3000` (Docker) o `http://localhost:5173` (Manual)
2. Deberías ver la página de login
3. ¡Listo para usar!

**¿Necesitas más ayuda?** Revisa:
- `README_FRONT.md` - Documentación técnica completa
- `README_DOCKER.md` - Más detalles sobre Docker
