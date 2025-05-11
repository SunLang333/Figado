from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # add languages to both edit and add forms
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('languages',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('languages',)}),
    )
