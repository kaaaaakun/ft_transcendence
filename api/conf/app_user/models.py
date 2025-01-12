from django.db import models


class User(models.Model):
    login_name = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    display_name = models.CharField(max_length=20)
    secret_question = models.CharField(max_length=255)
    secret_answer = models.CharField(max_length=255)



    class Meta:
        db_table = 'users'
