from django.contrib import admin

from .models import Tournament, TournamentPlayer

admin.site.register(Tournament)
admin.site.register(TournamentPlayer)