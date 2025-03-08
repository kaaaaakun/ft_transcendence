from rest_framework import viewsets
from .models import User
from django.db.models import Q
from .utils import create_response
import random
import traceback
import os
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
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
from django.conf import settings
from django.core.files.storage import default_storage
import requests
from django.utils.timezone import now


class UserView(APIView):
    def get(self, request, display_name):
        try:
            user = User.objects.filter(display_name=display_name).first()
            data = create_response(user)
            return JsonResponse(data)
        except Exception as e:
            with open('log.txt', 'a') as f:
                f.write(traceback.format_exc())
            return JsonResponse({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
class UpdateLastLoginView(APIView):

    def post(self, request):
        user = User.objects.get(id=1)
        user.last_online_at = now()
        user.save(update_fields=['last_online_at'])  # DB 更新
        return Response({"message": "last_online_at updated"}, status=status.HTTP_200_OK)

class UserUpdateView(APIView):
    def patch(self, request):
        try:
            user = User.objects.get(id=1)
            response = {}

            if request.content_type == "application/json":
                data = json.loads(request.body.decode('utf-8'))
                # display_name の更新
                if "display_name" in data:
                    user.display_name = data["display_name"]
                    user.save()
                    response["display_name"] = user.display_name

            # アバター画像の更新
            if "avatar_path" in request.FILES:
                avatar = request.FILES["avatar_path"]
                file_name = f"{user.display_name}.png"
                with open(f"patch.txt", "a") as f: 
                    f.write(str(avatar))
                with open(f"/var/www/data/avatars/test_user1.png", "wb") as f:
                    for chunk in avatar.chunks():
                        f.write(chunk)
                response["avatar_path"] = "/avatars/test_user1.png"
            return JsonResponse(response)

        except Exception as e:
            # with open('patch.txt', 'a') as f:
            #     f.write(str(e))
            #     f.write("\n")
            #     f.write(traceback.format_exc())
            return JsonResponse({"error": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

            user = User.ft_authenticate(login_name=login_name, password=password)

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



class UserPasswordResetView(APIView):
    def get(self, request, login_name,*args, **kwargs):
        try:

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


    def post(self, request, login_name,*args, **kwargs):
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


class UserDeleteView(APIView):
    def delete(self, request, login_name, *args, **kwargs):
        try:
            user = User.objects.get(login_name=login_name)
            user.delete()
            return JsonResponse({
                'message': 'User deleted.'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

