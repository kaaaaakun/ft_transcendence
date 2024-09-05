from django.contrib import admin

from .models import tournaments, tournament_players

admin.site.register(tournaments)
admin.site.register(tournament_players)