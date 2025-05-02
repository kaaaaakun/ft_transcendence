from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
import json
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

        self.sub_user_data = {
            'login_name': 'subuser',
            'display_name': 'Sub User',
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

    def test_get_profile(self):
        """ユーザープロフィール取得APIが正しく機能することをテスト"""

        user = User.objects.create_user(**self.user_data)
        sub_user = User.objects.create_user(**self.sub_user_data)


        response = self.client.post(
            reverse('login'),
            {'login_name': 'apiuser', 'password': 'password123'},
            format='json'
        )
        token = response.json()['access_token']


        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(
            reverse('profile', kwargs={'display_name': 'API User'}),
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(data['display_name'], 'API User')
        self.assertEqual(data['login_name'], 'apiuser')
        response = self.client.get(
            reverse('profile', kwargs={'display_name': 'Sub User'}),
            format='json'
        )
        data = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data['display_name'], 'Sub User')
        self.assertNotIn('login_name', data)

    def test_update_profile(self):
        """ユーザープロフィール更新APIが正しく機能することをテスト"""

        user = User.objects.create_user(**self.user_data)


        response = self.client.post(
            reverse('login'),
            {'login_name': 'apiuser', 'password': 'password123'},
            format='json'
        )
        token = response.json()['access_token']


        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(
            reverse('user_update'),
            {'display_name': 'Updated User'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.display_name, 'Updated User')

def test_update_last_online_at(self):
    """last_online_at を更新するAPIが正しく動作することをテスト"""

    user = User.objects.create_user(**self.user_data)

    # ログインしてトークンを取得
    response = self.client.post(
        reverse('login'),
        {'login_name': 'apiuser', 'password': 'password123'},
        format='json'
    )
    token = response.json()['access_token']

    # トークン付きでlast_online_at更新APIを呼び出す
    self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    response = self.client.post(
        reverse('update_last_login'),
        format='json'
    )

    self.assertEqual(response.status_code, status.HTTP_200_OK)
    data = json.loads(response.content)
    self.assertEqual(data['message'], 'last_online_at updated')

    user.refresh_from_db()
    self.assertIsNotNone(user.last_online_at)
