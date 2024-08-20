from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/plyr/', include('plyr.urls')),
    path('api/tmt/', include('tmt.urls')),
    path('api/mtch/', include('mtch.urls')),
]
