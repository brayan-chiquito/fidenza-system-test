"""
Serializers para la app de autenticación
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de nuevos usuarios.
    
    Validaciones:
    - Email único (validado automáticamente por Django)
    - Password mínimo 8 caracteres
    - first_name y last_name requeridos
    - Password y password_confirm deben coincidir
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text='Contraseña mínima de 8 caracteres'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Confirma tu contraseña'
    )
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {
                'required': True,
                'help_text': 'Correo electrónico único'
            },
            'first_name': {
                'required': True,
                'help_text': 'Nombre del usuario'
            },
            'last_name': {
                'required': True,
                'help_text': 'Apellido del usuario'
            }
        }
    
    def validate_email(self, value):
        """
        Valida que el email sea único.
        Django lo valida automáticamente, pero agregamos un mensaje personalizado.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return value
    
    def validate(self, attrs):
        """
        Valida que password y password_confirm coincidan.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden.'
            })
        return attrs
    
    def create(self, validated_data):
        """
        Crea un nuevo usuario en la base de datos.
        La contraseña se hashea automáticamente mediante create_user.
        """
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        
        return user


class UserLoginSerializer(TokenObtainPairSerializer):
    """
    Serializer para autenticación de usuarios mediante JWT.
    
    Valida las credenciales del usuario y genera tokens de acceso y refresh.
    Retorna información del usuario junto con los tokens.
    """
    username_field = 'email'
    
    email = serializers.EmailField(
        required=True,
        help_text='Correo electrónico del usuario'
    )
    
    def validate(self, attrs):
        """
        Valida las credenciales del usuario y genera los tokens JWT.
        Retorna los tokens junto con información básica del usuario.
        """
        if 'email' in attrs:
            attrs['username'] = attrs.pop('email')
        
        data = super().validate(attrs)
        
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_active': self.user.is_active,
        }
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """
        Genera el token JWT para el usuario autenticado.
        """
        token = super().get_token(user)
        return token

