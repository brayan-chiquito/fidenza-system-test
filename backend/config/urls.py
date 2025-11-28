"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin de Django
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/auth/', include('authentication.urls')),
    path('api/tasks/', include('tasks.urls')),
]
