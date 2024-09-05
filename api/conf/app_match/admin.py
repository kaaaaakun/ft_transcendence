from django.contrib import admin

from .models import matches, match_details

admin.site.register(matches)
admin.site.register(match_details)