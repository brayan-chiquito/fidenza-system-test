"""
Permisos personalizados para la app de tareas
"""
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Permiso personalizado que verifica que el usuario sea propietario del objeto.
    
    Solo permite el acceso si el objeto pertenece al usuario autenticado.
    Se utiliza para garantizar que los usuarios solo puedan acceder
    a sus propias tareas.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica si el usuario tiene permiso para acceder al objeto.
        
        Retorna True si el usuario es propietario del objeto (obj.user == request.user),
        False en caso contrario.
        """
        return obj.user == request.user

