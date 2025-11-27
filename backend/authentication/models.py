"""
Modelos para la app de autenticación
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


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
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

