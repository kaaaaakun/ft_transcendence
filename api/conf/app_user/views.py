import random
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
                    'error': str('Login failed. Check your login name and password.')
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            with open('error.log', 'a') as f:
                f.write(str(e))
            return JsonResponse({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)

            login_name = data.get('login_name')
            display_name = data.get('display_name')
            password = data.get('password')
            secret_question = data.get('secret_question')
            secret_answer = data.get('secret_answer')

            if not login_name or not password or not display_name or not secret_question or not secret_answer:
                return JsonResponse({
                    'error': 'All fields are required.',
                    'Your request': str(data)
                }, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(
                login_name=login_name,
                password=password,
                display_name=display_name,
                secret_question=secret_question,
                secret_answer=secret_answer
            )


            return JsonResponse({
                'message': 'Sign up successful',
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            with open('error.log', 'a') as f:
                f.write(str(e))
            return JsonResponse({
                'error': str(e),
                'Your request': str(request.body)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            login_name = data.get('login_name')
            auth = request.headers.get('Authorization')

            if auth:
                access_token = auth.split(' ')[1]
            if not access_token:
                return JsonResponse({
                    'message': 'Login before you delete your account'
                }, status=status.HTTP_401_UNAUTHORIZED)


            access_id = AccessToken(access_token).get('user_id')
            user = User.objects.get(login_name=login_name)


            if (user.id != access_id):
                return JsonResponse({
                    'message': 'You can only delete your own account'
                }, status=status.HTTP_403_FORBIDDEN)


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

            if check_password(secret_answer, user.secret_answer_hash):
                user.password = make_password(password=new_password)
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

