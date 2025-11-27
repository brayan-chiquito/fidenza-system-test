"""
URLs para la app de autenticación
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Las vistas se importarán cuando las creemos en la Fase 2
# from .views import RegisterView

urlpatterns = [
    # POST /api/auth/register/ - Registro de usuario
    # path('register/', RegisterView.as_view(), name='register'),
    
    # POST /api/auth/login/ - Login y obtención de token JWT
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # POST /api/auth/refresh/ - Renovar token JWT
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

