"""
Tests para la app de tareas
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Task

User = get_user_model()


class TaskCRUDTests(TestCase):
    """
    Tests para las operaciones CRUD de tareas.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.client = APIClient()
        self.tasks_url = '/api/tasks/'
        
        # Crear usuario y autenticarlo
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_task_success(self):
        """Test: Crear tarea exitosamente."""
        data = {
            'title': 'Mi primera tarea',
            'description': 'Descripción de la tarea',
            'completed': False
        }
        response = self.client.post(self.tasks_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Mi primera tarea')
        # Verificar que la tarea se creó con el usuario correcto
        task = Task.objects.get(title='Mi primera tarea')
        self.assertEqual(task.user, self.user)
        self.assertTrue(Task.objects.filter(title='Mi primera tarea').exists())
    
    def test_create_task_missing_title(self):
        """Test: No se puede crear tarea sin título."""
        data = {
            'description': 'Descripción sin título',
            'completed': False
        }
        response = self.client.post(self.tasks_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_task_empty_title(self):
        """Test: No se puede crear tarea con título vacío."""
        data = {
            'title': '',
            'description': 'Descripción',
            'completed': False
        }
        response = self.client.post(self.tasks_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_tasks(self):
        """Test: Listar tareas del usuario."""
        # Crear algunas tareas
        Task.objects.create(
            user=self.user,
            title='Tarea 1',
            description='Descripción 1'
        )
        Task.objects.create(
            user=self.user,
            title='Tarea 2',
            description='Descripción 2'
        )
        
        response = self.client.get(self.tasks_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # La respuesta está paginada, usar 'results' si existe, sino usar directamente
        tasks_data = response.data.get('results', response.data)
        self.assertEqual(len(tasks_data), 2)
    
    def test_list_tasks_excludes_deleted(self):
        """Test: Las tareas eliminadas no aparecen en el listado."""
        Task.objects.create(
            user=self.user,
            title='Tarea activa',
            description='Descripción'
        )
        deleted_task = Task.objects.create(
            user=self.user,
            title='Tarea eliminada',
            description='Descripción',
            is_deleted=True
        )
        
        response = self.client.get(self.tasks_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tasks_data = response.data.get('results', response.data)
        self.assertEqual(len(tasks_data), 1)
        self.assertNotEqual(tasks_data[0]['id'], deleted_task.id)
    
    def test_get_task_detail(self):
        """Test: Obtener detalle de una tarea."""
        task = Task.objects.create(
            user=self.user,
            title='Tarea de prueba',
            description='Descripción detallada',
            completed=False
        )
        
        response = self.client.get(f'{self.tasks_url}{task.id}/', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Tarea de prueba')
        self.assertEqual(response.data['description'], 'Descripción detallada')
    
    def test_update_task_put(self):
        """Test: Actualizar tarea completa con PUT."""
        task = Task.objects.create(
            user=self.user,
            title='Tarea original',
            description='Descripción original',
            completed=False
        )
        
        data = {
            'title': 'Tarea actualizada',
            'description': 'Nueva descripción',
            'completed': True
        }
        response = self.client.put(f'{self.tasks_url}{task.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Tarea actualizada')
        self.assertEqual(response.data['completed'], True)
    
    def test_update_task_patch(self):
        """Test: Actualizar tarea parcialmente con PATCH."""
        task = Task.objects.create(
            user=self.user,
            title='Tarea original',
            description='Descripción original',
            completed=False
        )
        
        data = {
            'completed': True
        }
        response = self.client.patch(f'{self.tasks_url}{task.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['completed'], True)
        self.assertEqual(response.data['title'], 'Tarea original')  # No cambió
    
    def test_delete_task_soft_delete(self):
        """Test: Eliminar tarea realiza borrado lógico."""
        task = Task.objects.create(
            user=self.user,
            title='Tarea a eliminar',
            description='Descripción'
        )
        
        response = self.client.delete(f'{self.tasks_url}{task.id}/', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verificar que la tarea existe pero está marcada como eliminada
        task.refresh_from_db()
        self.assertTrue(task.is_deleted)
        self.assertTrue(Task.objects.filter(id=task.id).exists())  # Existe en BD
    
    def test_get_deleted_task_returns_404(self):
        """Test: Intentar acceder a tarea eliminada retorna 404."""
        task = Task.objects.create(
            user=self.user,
            title='Tarea eliminada',
            description='Descripción',
            is_deleted=True
        )
        
        response = self.client.get(f'{self.tasks_url}{task.id}/', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TaskPermissionsTests(TestCase):
    """
    Tests para verificar los permisos de acceso a tareas.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.client = APIClient()
        self.tasks_url = '/api/tasks/'
        
        # Crear dos usuarios
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='password123',
            first_name='User',
            last_name='One'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='password123',
            first_name='User',
            last_name='Two'
        )
    
    def test_user_cannot_access_other_user_tasks(self):
        """Test: Usuario no puede acceder a tareas de otro usuario."""
        # Crear tarea del usuario 2
        task = Task.objects.create(
            user=self.user2,
            title='Tarea del usuario 2',
            description='Descripción'
        )
        
        # Autenticar como usuario 1
        self.client.force_authenticate(user=self.user1)
        
        # Intentar acceder a tarea del usuario 2
        response = self.client.get(f'{self.tasks_url}{task.id}/', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_user_cannot_update_other_user_task(self):
        """Test: Usuario no puede actualizar tarea de otro usuario."""
        task = Task.objects.create(
            user=self.user2,
            title='Tarea del usuario 2',
            description='Descripción'
        )
        
        self.client.force_authenticate(user=self.user1)
        
        data = {'title': 'Tarea modificada'}
        response = self.client.patch(f'{self.tasks_url}{task.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_user_cannot_delete_other_user_task(self):
        """Test: Usuario no puede eliminar tarea de otro usuario."""
        task = Task.objects.create(
            user=self.user2,
            title='Tarea del usuario 2',
            description='Descripción'
        )
        
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.delete(f'{self.tasks_url}{task.id}/', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_unauthenticated_user_cannot_access_tasks(self):
        """Test: Usuario no autenticado no puede acceder a tareas."""
        response = self.client.get(self.tasks_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_only_sees_own_tasks(self):
        """Test: Usuario solo ve sus propias tareas en el listado."""
        # Crear tareas para ambos usuarios
        Task.objects.create(
            user=self.user1,
            title='Tarea usuario 1',
            description='Descripción'
        )
        Task.objects.create(
            user=self.user2,
            title='Tarea usuario 2',
            description='Descripción'
        )
        
        # Autenticar como usuario 1
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get(self.tasks_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tasks_data = response.data.get('results', response.data)
        self.assertEqual(len(tasks_data), 1)
        self.assertEqual(tasks_data[0]['title'], 'Tarea usuario 1')

