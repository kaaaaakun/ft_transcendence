from django.contrib import admin

from .models import Match, match_details

admin.site.register(Match)
admin.site.register(match_details)