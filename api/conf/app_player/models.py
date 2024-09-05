from django.db import models

class players(models.Model):
    name = models.CharField(max_length=20) # 何文字までOKかフロントと調整（未）