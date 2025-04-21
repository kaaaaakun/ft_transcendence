from rest_framework.exceptions import APIException

class AuthError(APIException):
    status_code = 401
    default_detail = 'Authentication failed.'
    default_code = 'authentication_failed'
