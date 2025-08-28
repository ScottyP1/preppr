from django.contrib import admin
from .models import User, BuyerProfile, SellerProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_staff")

admin.site.register(BuyerProfile)
admin.site.register(SellerProfile)
