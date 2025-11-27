"""
URLs para la app de tareas
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# El ViewSet se importará cuando lo creemos en la Fase 3
# from .views import TaskViewSet

# Router para las rutas del ViewSet
router = DefaultRouter()
# router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    # Las rutas del router se agregarán cuando creemos el ViewSet
    # path('', include(router.urls)),
]

