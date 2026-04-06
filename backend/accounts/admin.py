from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
  fieldsets = BaseUserAdmin.fieldsets + (
    ('Access', {'fields': ('role', 'permissions', 'can_edit', 'can_delete')}),
  )
  list_display = ('username', 'email', 'role', 'is_active', 'is_staff', 'is_superuser')
