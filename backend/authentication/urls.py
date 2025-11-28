"""
URLs para la app de autenticación
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView

urlpatterns = [
    # POST /api/auth/register/ - Registro de usuario
    path('register/', RegisterView.as_view(), name='register'),
    
    # POST /api/auth/login/ - Login y obtención de token JWT
    path('login/', LoginView.as_view(), name='login'),
    
    # POST /api/auth/refresh/ - Renovar token JWT
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

