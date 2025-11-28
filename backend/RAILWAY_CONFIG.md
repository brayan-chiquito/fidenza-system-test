# Configuración Específica para Railway

## Problema Común: Error "Error creating build plan with Railpack"

Si ves este error, significa que Railway está intentando usar Railpack (detección automática) en lugar del Dockerfile.

## Solución: Configurar Root Directory

1. Ve a tu servicio en Railway
2. Haz clic en **Settings**
3. Busca la sección **Root Directory**
4. Configura: `backend`
5. Guarda los cambios
6. Railway ahora usará el `Dockerfile` en `backend/`

## Configuración Alternativa: Usar railway.json

El archivo `railway.json` en la raíz del proyecto ya está configurado para usar el Dockerfile:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"
  }
}
```

Si Railway no lo detecta automáticamente, configura manualmente el Root Directory como se indica arriba.

## Verificar Configuración

Después de configurar, Railway debería:
1. Detectar el Dockerfile en `backend/`
2. Construir la imagen correctamente
3. Ejecutar las migraciones automáticamente
4. Iniciar gunicorn

## Si el Error Persiste

1. Verifica que el `Dockerfile` esté en `backend/Dockerfile`
2. Verifica que `requirements.txt` esté en `backend/requirements.txt`
3. Verifica que el Root Directory esté configurado como `backend`
4. Revisa los logs de build para ver el error específico

