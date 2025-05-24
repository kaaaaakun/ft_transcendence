import os
from django.core.management.base import BaseCommand
from user.models import User

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        login_name = os.getenv("DJANGO_SUPERUSER_LOGIN_NAME", "admin")
        display_name = os.getenv("DJANGO_SUPERUSER_DISPLAY_NAME", "admin")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "pass")
        secret_question = os.getenv("DJANGO_SUPERUSER_SECRET_QUESTION", "Q?")
        secret_answer = os.getenv("DJANGO_SUPERUSER_SECRET_ANSWER", "A")

        if not login_name or not password or not display_name or not secret_question or not secret_answer:
            raise Exception("Missing environment variables for superuser creation")

        if not User.objects.filter(login_name=login_name).exists():
            User.objects.create_superuser(
                login_name=login_name,
                display_name=display_name,
                password=password,
                secret_question=secret_question,
                secret_answer=secret_answer
            )
            self.stdout.write(self.style.SUCCESS("Superuser created."))
        else:
            self.stdout.write(self.style.WARNING("Superuser already exists."))
