from django.db import models
from django.contrib.auth.hashers import make_password


class User(models.Model):
    id = models.AutoField(primary_key=True)
    user_id=models.CharField(unique=True)
    login_name = models.CharField(max_length=20, unique=True)
    display_name = models.CharField(max_length=20, unique=True)
    avatar_path = models.CharField(max_length=255, default=None, null=True)
    password = models.CharField(max_length=255)
    secret_question = models.CharField(max_length=255)
    secret_answer_hash = models.CharField(max_length=255)
    last_online_at = models.DateTimeField(default=None, null=True)
    deleted_at = models.DateTimeField(default=None, null=True)

    @classmethod
    def ft_authenticate(self, login_name=None, password=None):
        try:
            user = self.objects.get(login_name=login_name)
        except self.DoesNotExist:
            return None

        if user.password == make_password(password=password, salt="ft_transcendence"):
            return user
        else:
            return None



    class Meta:
        db_table = 'users'
