"""
URLs para la app de tareas
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

# Router para las rutas del ViewSet
router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]



