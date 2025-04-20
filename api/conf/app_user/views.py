from rest_framework import viewsets
from .models import User
from django.db.models import Q
from .utils import create_response, get_user_by_request
import random
import traceback
import os
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from django.db import transaction, DatabaseError
from django.views import View
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.http import JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password, check_password
import json
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from django.conf import settings
from django.core.files.storage import default_storage
import requests
from django.utils.timezone import now
from rest_framework.response import Response
from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer
)
from rest_framework_simplejwt.authentication import JWTAuthentication


class UserProfileView(APIView):
    def get(self, request, display_name):
        try:
            user = User.objects.filter(display_name=display_name).first()
            if not user:
                raise User.DoesNotExist
            access_id = get_user_by_request(request)
            data = create_response(user, access_id)
            return JsonResponse(data)
        except User.DoesNotExist:
            return JsonResponse({
                'errors': [{
                    'field': 'display_name',
                    'message': 'User not found.'
                }]
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({
                'errors': [{
                    'field': 'unknown',
                    'message': 'An unexpected error occurred.'
                }]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UpdateLastLoginView(APIView):

    def post(self, request):
        user = User.objects.get(id=1)
        user.last_online_at = now()
        user.save(update_fields=['last_online_at'])  # DB 更新
        return Response({"message": "last_online_at updated"}, status=status.HTTP_200_OK)

class UserUpdateView(APIView):
    def patch(self, request):
        try:
            access_id = get_user_by_request(request)
            user = User.objects.get(id=access_id)
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
                file_name = f"{user.login_name}.png"
                with open(f"patch.txt", "a") as f: 
                    f.write(str(avatar))
                with open(f"/var/www/data/avatars/{file_name}", "wb") as f:
                    for chunk in avatar.chunks():
                        f.write(chunk)
                user.avatar_path = f"/avatars/{file_name}"
                user.save()
                response["avatar_path"] = f"/avatars/{file_name}"
            return JsonResponse(response)

        except User.DoesNotExist:
            return JsonResponse({
                'errors': [{
                    'field': 'user',
                    'message': 'User not found.'
                }]
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({
                'errors': [{
                    'field': 'unknown',
                    'message': 'An unexpected error occurred.'
                }]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'message': 'Login successful',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UserView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({
                'message': 'Sign up successful',
            }, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            login_name = data.get('login_name')

            if not login_name:
                return JsonResponse({
                    'error': 'Login name is required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            auth = request.headers.get('Authorization')

            if auth:
                access_token = auth.split(' ')[1]
            if not access_token:
                return JsonResponse({
                    'message': 'Login before you delete your account'
                }, status=status.HTTP_401_UNAUTHORIZED)


            access_id = AccessToken(access_token).get('user_id')
            user = User.objects.get(login_name=login_name)
            if (user.deleted_at is not None):
                raise User.DoesNotExist

            if (user.id != access_id):
                return JsonResponse({
                    'message': 'You can only delete your own account'
                }, status=status.HTTP_403_FORBIDDEN)

            if (user.deleted_at is not None):
                raise User.DoesNotExist

            if (user.deleted_at is not None):
                raise User.DoesNotExist

            user.logical_delete()

            return JsonResponse({
                'message': 'User deleted.'
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return JsonResponse({
                'error': 'Something went wrong.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserSecretQuestionView(APIView):
    def post(self, request,*args, **kwargs):
        data = json.loads(request.body)
        login_name = data.get('login_name')
        serializer = PasswordResetRequestSerializer(data={'login_name': login_name})
        if serializer.is_valid():
            try:
                user = User.objects.get(login_name=login_name)
                if (user.deleted_at is not None):
                    raise User.DoesNotExist

                return JsonResponse({
                    'secret_question': user.secret_question
                }, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                return JsonResponse({
                    'error': 'User not found.'
                }, status=status.HTTP_404_NOT_FOUND)

            except Exception as e:
                return JsonResponse({
                    'error': "Something went wrong."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserPasswordResetView(APIView):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        serializer = PasswordResetSerializer(data=data)

        if serializer.is_valid():

            user = serializer.validated_data['user']
            secret_answer = serializer.validated_data['secret_answer']
            new_password = serializer.validated_data['new_password']

            if check_password(secret_answer, user.secret_answer):
                user.password = make_password(password=new_password)
                user.save()
                return JsonResponse({
                    'message': 'Password reset successful.'
                }, status=status.HTTP_200_OK)
            else:
                return JsonResponse({
                    'error': 'Incorrect secret answer.'
                }, status=status.HTTP_400_BAD_REQUEST)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
