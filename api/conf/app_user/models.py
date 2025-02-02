from django.db import models


class User(models.Model):
    id = models.AutoField(primary_key=True)
    login_name = models.CharField(max_length=20, unique=True)
    display_name = models.CharField(max_length=20, unique=True)
    avatar_path = models.CharField(max_length=255, default=None, null=True)
    password_hash = models.CharField(max_length=255)
    secret_question = models.CharField(max_length=255)
    secret_answer_hash = models.CharField(max_length=255)
    last_online_at = models.DateTimeField(default=None, null=True)
    deleted_at = models.DateTimeField(default=None, null=True)


    class Meta:
        db_table = 'users'
