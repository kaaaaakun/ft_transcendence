from .models import User
from .utils import create_response, get_user_by_auth
from rest_framework import status
from rest_framework.views import APIView
from django.views import View
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
import json
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from django.utils.timezone import now
from rest_framework.response import Response
from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer,
    UserUpdateSerializer,
)
from .exceptions import AuthError
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging
logger = logging.getLogger('django')

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
            logger.info('create user')
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

            user_by_auth = get_user_by_auth(request.headers.get('Authorization'))
            if not user_by_auth:
                return JsonResponse({
                    'message': 'Login before you delete your account'
                }, status=status.HTTP_401_UNAUTHORIZED)
            user_by_request_body = User.objects.get(login_name=login_name)
            if (user_by_auth.deleted_at is not None):
                raise User.DoesNotExist

            if (user_by_request_body.id != user_by_auth.id):
                return JsonResponse({
                    'message': 'You can only delete your own account'
                }, status=status.HTTP_403_FORBIDDEN)

            if (user_by_request_body.deleted_at is not None):
                raise User.DoesNotExist

            if (user_by_request_body.deleted_at is not None):
                raise User.DoesNotExist

            user_by_request_body.logical_delete()

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

class UserProfileView(APIView):
    def get_user_by_display_name(self, display_name):
        user = User.objects.filter(display_name=display_name, deleted_at=None).first()
        if not user:
            raise User.DoesNotExist
        return user

    def get(self, request, display_name):
        try:
            user_by_auth = get_user_by_auth(request.headers.get('Authorization'))
            if not user_by_auth:
                raise AuthError('Authorization header is required.')

            user = self.get_user_by_display_name(display_name)
            data = create_response(user, user_by_auth.id)
            return JsonResponse(data)

        except AuthError as auth_error:
            return JsonResponse({
                'errors': [{
                    'field': 'Authorization',
                    'message': str(auth_error)
                }]
            }, status=auth_error.status_code)

        except User.DoesNotExist:
            return JsonResponse({
                'errors': [{
                    'field': 'display_name',
                    'message': 'User not found.'
                }]
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception:
            return JsonResponse({
                'errors': [{
                    'field': 'unknown',
                    'message': 'An unexpected error occurred.'
                }]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UpdateLastLoginView(APIView):

    def post(self, request):
        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is incorrect.')
            if user.deleted_at is not None:
                raise User.DoesNotExist
            user.last_online_at = now()
            user.save(update_fields=['last_online_at'])  # DB 更新
            return Response({"message": "last_online_at updated"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return JsonResponse({
                'errors': [{
                    'field': 'user',
                    'message': 'User not found.'
                }]
            }, status=status.HTTP_404_NOT_FOUND)
        except AuthError as auth_error:
            return JsonResponse({
                'errors': 'auth',
                'message': str(auth_error)
            }, status=auth_error.status_code)
        except Exception as e:
            return JsonResponse({
                'errors': [{
                    'field': 'unknown',
                    'message': str(e)
                }]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserUpdateView(APIView):
    def patch(self, request):
        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is incorrect.')
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            errors = [
                {'field': field, 'message': msg[0]}
                for field, msg in serializer.errors.items()
            ]
            return JsonResponse({
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({
                'errors': [{
                    'field': 'user',
                    'message': 'User not found.'
                }]
            }, status=status.HTTP_404_NOT_FOUND)
        except AuthError as auth_error:
            return Response({
                'errors': [{
                    'field': 'auth',
                    'message': str(auth_error)
                }]
            }, status=auth_error.status_code)
        except Exception as e:
            return Response({
                'errors': [{
                    'field': 'unknown',
                    'message': str(e)
                }]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserCurrentView(APIView):
    def get(self, request):
        try:
            user = get_user_by_auth(request.headers.get('Authorization'))
            if not user:
                raise AuthError('Authorization header is incorrect.')
            data = create_response(user, user.id)
            return JsonResponse(data)
        except AuthError as auth_error:
            return JsonResponse({
                'errors': [{
                    'field': 'auth',
                    'message': str(auth_error)
                }]
            }, status=auth_error.status_code)
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
                    'message': str(e)
                }]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
