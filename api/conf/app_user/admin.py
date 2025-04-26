from django.contrib import admin
from user.models import User

class UserAdmin(admin.ModelAdmin):  # ← ModelAdminだけ継承に変える！
    model = User
    list_display = ('login_name', 'display_name', 'is_staff', 'is_superuser')
    ordering = ('login_name',)
    fieldsets = (
        (None, {'fields': ('login_name', 'password')}),
        ('Personal info', {'fields': ('display_name', 'avatar_path')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_online_at',)}),
    )
    add_fieldsets = (  # ※ 本当はModelAdminにはadd_fieldsetsはないけど、ここは今エラーの本質じゃないのでそのままでOK
        (None, {
            'classes': ('wide',),
            'fields': ('login_name', 'display_name', 'password1', 'password2', 'is_staff', 'is_superuser')}
        ),
    )
    search_fields = ('login_name',)

admin.site.register(User, UserAdmin)
