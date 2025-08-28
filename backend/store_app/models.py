from django.db import models

class Stall(models.Model):
    product = models.CharField(max_length=120)      # STALL_PRODUCT
    location = models.CharField(max_length=255)     # STALL_LOCATION
    quantity = models.PositiveIntegerField(default=0)  # STALL_QUANTITY
    radius_m = models.PositiveIntegerField(default=1000)  # STALL_RADIUS (meters)

    def __str__(self):
        return f"{self.product} @ {self.location}"
