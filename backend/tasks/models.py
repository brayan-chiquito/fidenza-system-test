"""
Modelos para la app de tareas
"""
from django.db import models
from django.conf import settings


class Task(models.Model):
    """
    Modelo de tarea del sistema.
    
    Representa una tarea personal asociada a un usuario.
    Soporta borrado lógico mediante el campo is_deleted.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name='Usuario',
        help_text='Usuario propietario de la tarea'
    )
    
    title = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        verbose_name='Título',
        help_text='Título de la tarea'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción',
        help_text='Descripción detallada de la tarea'
    )
    
    completed = models.BooleanField(
        default=False,
        verbose_name='Completada',
        help_text='Indica si la tarea está completada'
    )
    
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name='Eliminada',
        help_text='Indica si la tarea fue eliminada (borrado lógico)'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name='Fecha de creación',
        help_text='Fecha y hora de creación de la tarea'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de actualización',
        help_text='Fecha y hora de última actualización'
    )
    
    class Meta:
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_deleted']),
            models.Index(fields=['is_deleted', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"

