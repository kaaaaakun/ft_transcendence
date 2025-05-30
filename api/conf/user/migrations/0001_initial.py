# Generated by Django 4.2 on 2025-05-18 15:52

from django.conf import settings
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('friend', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('login_name', models.CharField(max_length=20, unique=True)),
                ('display_name', models.CharField(max_length=20, unique=True)),
                ('avatar_path', models.CharField(default=None, max_length=255, null=True)),
                ('password', models.CharField(max_length=255)),
                ('secret_question', models.CharField(max_length=255)),
                ('secret_answer', models.CharField(max_length=255)),
                ('last_online_at', models.DateTimeField(default=django.utils.timezone.now, null=True)),
                ('deleted_at', models.DateTimeField(default=None, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('friends', models.ManyToManyField(related_name='friend_of', through='friend.Friend', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'users',
            },
        ),
    ]
