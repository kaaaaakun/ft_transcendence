from django.db import models
from user.models import User

class Friend(models.Model):
    STATUS_CHOICES = (
        ('pending', '申請中'),
        ('accepted', '承認済み'),
        ('rejected', '拒否'),
    )
    user = models.ForeignKey(User, related_name='friendships', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friends_to', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    class Meta:
        db_table = 'friend'
        unique_together = ('user', 'friend')

