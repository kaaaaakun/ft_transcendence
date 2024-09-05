from django.contrib import admin

from .models import Tournament, tournament_players

admin.site.register(Tournament)
admin.site.register(tournament_players)