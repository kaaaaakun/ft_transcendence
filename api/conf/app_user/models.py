from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, login_name, display_name, password, secret_question, secret_answer):
        if not login_name:
            raise ValueError("The Login name must be set")
        user = self.model(login_name=login_name, display_name=display_name, password=make_password(password, salt='ft_transcendence'), secret_question=secret_question, secret_answer_hash=make_password(secret_answer, salt='ft_transcendence'))
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    login_name = models.CharField(unique=True, max_length=20)
    display_name = models.CharField(max_length=20)
    avatar_path = models.CharField(max_length=255, default=None, null=True)
    password = models.CharField(max_length=255)
    secret_question = models.CharField(max_length=255)
    secret_answer_hash = models.CharField(max_length=255)
    last_online_at = models.DateTimeField(default=None, null=True)
    deleted_at = models.DateTimeField(default=None, null=True)

    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'login_name'
    REQUIRED_FIELDS = ['display_name', 'password', 'secret_question', 'secret_answer_hash']

    def __str__(self):
        return self.display_name

    @classmethod
    def ft_authenticate(self, login_name, password):
        try:
            user = self.objects.get(login_name=login_name)
        except self.DoesNotExist:
            return None

        if user.password == make_password(password, salt='ft_transcendence'):
            return user
        else:
            return None



    class Meta:
        db_table = 'users'
