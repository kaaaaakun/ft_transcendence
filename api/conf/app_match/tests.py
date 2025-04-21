from django.test import TestCase

from user.models import User
from .models import Match, MatchDetail
from django.contrib.auth.models import User

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

'''
class BaseTestSetup(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create Users
        ユーザーモデルでテストケースを作成して、それを参照する形でセットアップ（できるか不明）するほうが、モデルごとのテストケースの記述が少なくてすみそう

        # Create simple matches

        # Create matchdetails

        # Create admin user
        cls.admin = User.objects.create_user(username = 'admin', password = 'pass', is_staff = True)
'''