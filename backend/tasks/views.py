"""
Vistas para la app de tareas
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsOwner


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las tareas del usuario.
    
    Proporciona operaciones CRUD completas con borrado lógico.
    Solo permite acceso a las tareas del usuario autenticado.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        """
        Retorna el queryset de tareas del usuario autenticado.
        
        Filtra automáticamente:
        - Solo tareas del usuario actual (user=request.user)
        - Solo tareas no eliminadas (is_deleted=False)
        """
        return Task.objects.filter(
            user=self.request.user,
            is_deleted=False
        )
    
    def perform_create(self, serializer):
        """
        Crea una nueva tarea asignándola automáticamente al usuario autenticado.
        
        El campo user se asigna desde request.user, por lo que no es necesario
        incluirlo en los datos de la petición.
        """
        serializer.save(user=self.request.user)
    
    def perform_destroy(self, instance):
        """
        Realiza un borrado lógico de la tarea.
        
        En lugar de eliminar físicamente el registro de la base de datos,
        establece is_deleted=True. Esto permite mantener el historial
        y la posibilidad de recuperar la tarea si es necesario.
        """
        instance.is_deleted = True
        instance.save()
    
    def get_object(self):
        """
        Retorna el objeto de la tarea.
        
        Si la tarea está eliminada (is_deleted=True), retorna 404.
        Esto garantiza que las tareas eliminadas no sean accesibles
        incluso si se conoce su ID.
        """
        obj = super().get_object()
        if obj.is_deleted:
            from rest_framework.exceptions import NotFound
            raise NotFound("La tarea no existe.")
        return obj

