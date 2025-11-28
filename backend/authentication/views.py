"""
Vistas para la app de autenticación
"""
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegistrationSerializer, UserLoginSerializer


class RegisterView(CreateAPIView):
    """
    Vista para el registro de nuevos usuarios.
    
    Permite crear una nueva cuenta de usuario con email, contraseña,
    nombre y apellido. La contraseña se valida y se hashea automáticamente.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = []  # Endpoint público, no requiere autenticación
    
    def create(self, request, *args, **kwargs):
        """
        Crea un nuevo usuario y retorna los datos del usuario creado.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(
            {
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(TokenObtainPairView):
    """
    Vista para la autenticación de usuarios mediante JWT.
    
    Valida las credenciales del usuario y retorna tokens de acceso y refresh
    junto con información básica del usuario.
    """
    serializer_class = UserLoginSerializer



