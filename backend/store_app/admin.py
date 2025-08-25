from django.contrib import admin
from .models import Stall

@admin.register(Stall)
class StallAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "location", "quantity", "radius_m")
