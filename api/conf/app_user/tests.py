from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient

from .models import User

class UserModelTest(TestCase):
    def setUp(self):

        self.user = User.objects.create_user(
            login_name='testuser',
            display_name='Test User',
            password='password123',
            secret_question='What is your favorite color?',
            secret_answer='blue'
        )

    def test_user_creation(self):
        """ユーザー作成が正しく機能することをテスト"""
        self.assertEqual(self.user.login_name, 'testuser')
        self.assertEqual(self.user.display_name, 'Test User')
        self.assertEqual(self.user.secret_question, 'What is your favorite color?')
        self.assertTrue(check_password('password123', self.user.password))

    def test_ft_authenticate(self):
        """認証メソッドが正しく機能することをテスト"""
        authenticated_user = User.ft_authenticate(login_name='testuser', password='password123')
        self.assertIsNotNone(authenticated_user)
        self.assertEqual(authenticated_user.id, self.user.id)

        self.assertIsNone(User.ft_authenticate(login_name='testuser', password='wrongpassword'))

        self.assertIsNone(User.ft_authenticate(login_name='nonexistent', password='password123'))

    def test_logical_delete(self):
        """論理削除が正しく機能することをテスト"""
        self.assertIsNone(self.user.deleted_at)
        self.user.logical_delete()
        self.assertIsNotNone(self.user.deleted_at)

        self.assertIsNone(User.ft_authenticate(login_name='testuser', password='password123'))


class UserAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'login_name': 'apiuser',
            'display_name': 'API User',
            'password': 'password123',
            'secret_question': 'What is your pet name?',
            'secret_answer': 'fluffy'
        }

    def test_user_registration(self):
        """ユーザー登録APIが正しく機能することをテスト"""
        response = self.client.post(
            reverse('user'),
            self.user_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(login_name='apiuser').exists())

    def test_user_login(self):
        """ユーザーログインAPIが正しく機能することをテスト"""

        User.objects.create_user(**self.user_data)


        response = self.client.post(
            reverse('login'),
            {'login_name': 'apiuser', 'password': 'password123'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.json())
        self.assertIn('refresh_token', response.json())

    def test_user_delete(self):
        """ユーザー削除APIが正しく機能することをテスト"""

        user = User.objects.create_user(**self.user_data)


        response = self.client.post(
            reverse('login'),
            {'login_name': 'apiuser', 'password': 'password123'},
            format='json'
        )
        token = response.json()['access_token']


        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.delete(
            reverse('user'),
            {'login_name': 'apiuser'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertIsNotNone(user.deleted_at)
