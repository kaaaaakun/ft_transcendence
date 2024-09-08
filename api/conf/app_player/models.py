from django.db import models

class Player(models.Model):
    name = models.CharField(max_length=20) # 何文字までOKかフロントと調整（未）

    class Meta:
        db_table = 'players'
