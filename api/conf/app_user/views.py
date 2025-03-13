import random
from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from django.views import View
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.http import JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password, check_password
import json
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer
)
from rest_framework_simplejwt.authentication import JWTAuthentication


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



class UserPasswordResetView(APIView):
    def get(self, request, login_name,*args, **kwargs):
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


    def post(self, request, login_name,*args, **kwargs):
        data = json.loads(request.body)
        data['login_name'] = login_name

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
