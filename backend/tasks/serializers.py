"""
Serializers para la app de tareas
"""
from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Task.
    
    Serializa las tareas del usuario. El campo is_deleted no se incluye
    en los campos visibles ya que se maneja internamente para el borrado lógico.
    """
    
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'completed', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_title(self, value):
        """
        Valida que el título no esté vacío.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("El título no puede estar vacío.")
        return value.strip()

