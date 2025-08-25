from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        BUYER = "buyer", "Buyer"
        SELLER = "seller", "Seller"

    role = models.CharField(max_length=10, choices=Roles.choices, default=Roles.BUYER)

    def is_buyer(self):
        return self.role == self.Roles.BUYER

    def is_seller(self):
        return self.role == self.Roles.SELLER


from django.db import models
from django.conf import settings

class BuyerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="buyer_profile")
    allergies = models.TextField(blank=True, default="")
    preference = models.CharField(max_length=255, blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    favorite_stall = models.ForeignKey(
        "store_app.Stall",           
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="fans",
    )

class SellerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_profile")
    location = models.CharField(max_length=255, blank=True, default="")
    stall = models.OneToOneField(
        "store_app.Stall",                
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="owner_profile",
    )
