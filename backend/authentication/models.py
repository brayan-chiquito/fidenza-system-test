"""
Modelos para la app de autenticación
"""
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """
    Manager personalizado para el modelo User.
    
    Sobrescribe los métodos de creación de usuarios para usar email
    en lugar de username.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Crea y retorna un usuario normal con email y contraseña.
        """
        if not email:
            raise ValueError('El email debe ser proporcionado')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crea y retorna un superusuario con email y contraseña.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Modelo de usuario del sistema.
    
    Hereda de AbstractUser y define los campos necesarios para la autenticación
    y gestión de usuarios. El email se utiliza como identificador único para el login.
    """
    username = models.CharField(
        max_length=150,
        unique=False,
        null=True,
        blank=True,
        verbose_name='Nombre de usuario',
        help_text='Campo heredado de AbstractUser'
    )
    
    email = models.EmailField(
        max_length=254,
        unique=True,
        null=False,
        blank=False,
        db_index=True,
        verbose_name='Correo electrónico',
        help_text='Correo electrónico único del usuario'
    )
    
    first_name = models.CharField(
        max_length=150,
        null=False,
        blank=False,
        verbose_name='Nombre',
        help_text='Nombre del usuario'
    )
    
    last_name = models.CharField(
        max_length=150,
        null=False,
        blank=False,
        verbose_name='Apellido',
        help_text='Apellido del usuario'
    )
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

