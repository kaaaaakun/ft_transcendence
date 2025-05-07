from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, login_name, display_name, password, secret_question, secret_answer):
        if not login_name or not display_name or not password or not secret_question or not secret_answer:
            raise ValueError("Required fields are missing")
        user = self.model(login_name=login_name, display_name=display_name, password=make_password(password), secret_question=secret_question, secret_answer=make_password(secret_answer))
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    id = models.AutoField(auto_created=True,primary_key=True)
    login_name = models.CharField(unique=True, max_length=20)
    display_name = models.CharField(unique=True, max_length=20)
    avatar_path = models.CharField(max_length=255, default=None, null=True)
    password = models.CharField(max_length=255)
    secret_question = models.CharField(max_length=255)
    secret_answer = models.CharField(max_length=255)
    last_online_at = models.DateTimeField(default=timezone.now, null=True)
    deleted_at = models.DateTimeField(default=None, null=True)
    is_active = models.BooleanField(default=True)
    friends = models.ManyToManyField(
        'self',
        through='friend.Friend',
        symmetrical=False,
        related_name='friend_of',
    )

    objects = UserManager()

    USERNAME_FIELD = 'login_name'
    REQUIRED_FIELDS = ['display_name', 'password', 'secret_question', 'secret_answer']

    def __str__(self):
        return self.display_name


    @classmethod
    def ft_authenticate(self, login_name, password):
        try:
            user = self.objects.get(login_name=login_name)
            if (user.deleted_at is not None):
                return None
        except self.DoesNotExist:
            return None

        if check_password(password, user.password):
            return user
        else:
            return None

    def logical_delete(self):
        self.deleted_at = timezone.now()
        self.save()

    class Meta:
        db_table = 'users'
