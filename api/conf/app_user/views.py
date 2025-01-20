import random

from rest_framework import viewsets
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.db import transaction, DatabaseError
from django.views import View
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password
import json
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView


def ft_authenticate(login_name=None, password=None):
    try:
        user = User.objects.get(login_name=login_name)
    except User.DoesNotExist:
        return None

    if user.password_hash == make_password(password=password, salt="ft_transcendence"):
        return user
    else:
        return None


class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            login_name = data.get('login_name')
            password = data.get('password')

            if not login_name or not password:
                return JsonResponse({
                    'error': 'Login name and password are required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = ft_authenticate(login_name=login_name, password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)
                return JsonResponse({
                    'message': 'Login successful',
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                }, status=status.HTTP_200_OK)
            else:
                return JsonResponse({
                    'error': f'Invalid login name or password. {login_name} {make_password(password=password, salt="ft_transcendence")}'
                }, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserRegisterView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # リクエストのボディをJSONとしてパース
            data = json.loads(request.body)

            login_name = data.get('login_name')
            display_name = data.get('display_name')
            password = data.get('password')
            secret_question = data.get('secret_question')
            secret_answer = data.get('secret_answer')

            # フィールドがすべて入力されているか確認
            if not login_name or not password or not display_name or not secret_question or not secret_answer:
                return JsonResponse({
                    'error': 'All fields are required.',
                    'Your request': str(data)
                }, status=status.HTTP_400_BAD_REQUEST)

            # ユーザーを作成
            user = User.objects.create(
                login_name=login_name,
                password_hash=make_password(password=password, salt='ft_transcendence'),
                display_name=display_name,
                secret_question=secret_question,
                secret_answer_hash=make_password(secret_answer, salt='ft_transcendence'),
            )

            # JWTのアクセストークンとリフレッシュトークンを生成
            refresh = RefreshToken.for_user(user)

            return JsonResponse({
                'message': 'Sign up successful',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # エラー時は500エラーを返す
            return JsonResponse({
                'error': str(e),
                'Your request': str(request.body)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserGetSecretQuestionView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            login_name = data.get('login_name')

            if not login_name:
                return JsonResponse({
                    'error': 'Login name is required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(login_name=login_name)

            return JsonResponse({
                'secret_question': user.secret_question
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserPasswordResetView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            login_name = data.get('login_name')
            secret_answer = data.get('secret_answer')
            new_password = data.get('new_password')

            if not login_name or not secret_answer or not new_password:
                return JsonResponse({
                    'error': 'Login name, secret answer and new password are required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(login_name=login_name)

            if user.secret_answer_hash == make_password(secret_answer, salt='ft_transcendence'):
                user.password_hash = make_password(password=new_password, salt='ft_transcendence')
                user.save()
                return JsonResponse({
                    'message': 'Password reset successful.'
                }, status=status.HTTP_200_OK)
            else:
                return JsonResponse({
                    'error': 'Incorrect secret answer.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
