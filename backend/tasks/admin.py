"""
Configuración del admin para la app de tareas
"""
from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Task.
    
    Permite gestionar las tareas desde el panel de administración de Django.
    """
    list_display = ('id', 'title', 'user', 'completed', 'is_deleted', 'created_at', 'updated_at')
    list_filter = ('completed', 'is_deleted', 'created_at', 'user')
    search_fields = ('title', 'description', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Información básica', {
            'fields': ('id', 'user', 'title', 'description')
        }),
        ('Estado', {
            'fields': ('completed', 'is_deleted')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimiza las consultas usando select_related para el campo user.
        """
        qs = super().get_queryset(request)
        return qs.select_related('user')

