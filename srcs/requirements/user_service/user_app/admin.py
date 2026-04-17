from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Relationship

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'display_name', 'is_online', 'is_staff']
    
    # Define which fields to show in the edit screen from our custom model
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile', {'fields': ('display_name', 'intra_id', 'avatar', 'friends')}),
        ('Status', {'fields': ('is_online', 'last_seen')}),
    )

# Register the models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Relationship)
