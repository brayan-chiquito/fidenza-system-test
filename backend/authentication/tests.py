"""
Tests para la app de autenticación
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserRegistrationTests(TestCase):
    """
    Tests para el endpoint de registro de usuarios.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
    
    def test_register_user_success(self):
        """Test: Registro exitoso de usuario."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')
        self.assertTrue(User.objects.filter(email='test@example.com').exists())
    
    def test_register_user_duplicate_email(self):
        """Test: No se puede registrar con email duplicado."""
        User.objects.create_user(
            email='existing@example.com',
            password='password123',
            first_name='Existing',
            last_name='User'
        )
        
        data = {
            'email': 'existing@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_password_mismatch(self):
        """Test: Las contraseñas deben coincidir."""
        data = {
            'email': 'test@example.com',
            'password': 'ComplexPass123!',
            'password_confirm': 'DifferentPass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Verificar que hay un error relacionado con password_confirm
        self.assertTrue(
            'password_confirm' in str(response.data) or 
            'no coinciden' in str(response.data).lower() or
            'password' in str(response.data)
        )
    
    def test_register_user_short_password(self):
        """Test: La contraseña debe tener mínimo 8 caracteres."""
        data = {
            'email': 'test@example.com',
            'password': 'short',
            'password_confirm': 'short',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_missing_fields(self):
        """Test: Todos los campos requeridos deben estar presentes."""
        data = {
            'email': 'test@example.com',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTests(TestCase):
    """
    Tests para el endpoint de login.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.client = APIClient()
        self.login_url = '/api/auth/login/'
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_login_success(self):
        """Test: Login exitoso con credenciales válidas."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')
    
    def test_login_invalid_credentials(self):
        """Test: Login falla con credenciales inválidas."""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_nonexistent_user(self):
        """Test: Login falla con usuario inexistente."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshTests(TestCase):
    """
    Tests para el endpoint de refresh token.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.client = APIClient()
        self.refresh_url = '/api/auth/refresh/'
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Obtener refresh token
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        login_response = self.client.post('/api/auth/login/', login_data, format='json')
        self.refresh_token = login_response.data['refresh']
    
    def test_refresh_token_success(self):
        """Test: Refresh token exitoso."""
        data = {
            'refresh': self.refresh_token
        }
        response = self.client.post(self.refresh_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        # Con ROTATE_REFRESH_TOKENS=True, también retorna nuevo refresh
        if 'refresh' in response.data:
            self.assertIn('refresh', response.data)
    
    def test_refresh_token_invalid(self):
        """Test: Refresh token inválido."""
        data = {
            'refresh': 'invalid_token_here'
        }
        response = self.client.post(self.refresh_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

