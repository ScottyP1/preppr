from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Allergen(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Stall(models.Model):
    # Basic listing info
    product = models.CharField(max_length=120)
    description = models.TextField(blank=True, default="")
    image = models.ImageField(upload_to="stalls/main/", blank=True, null=True)


    # Location / availability
    location = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=0)
    radius_m = models.PositiveIntegerField(default=1000)

    # Pricing and rating
    price_cents = models.PositiveIntegerField(default=0)
    price_level = models.PositiveSmallIntegerField(default=1)  # 1-4 for $ ... $$$$
    average_rating = models.FloatField(default=0.0)
    rating_count = models.PositiveIntegerField(default=0)

    # Nutrition (approximate per serving)
    calories = models.PositiveIntegerField(default=0)
    fat_g = models.FloatField(default=0)
    carbs_g = models.FloatField(default=0)

    # Labels and warnings
    tags = models.ManyToManyField(Tag, blank=True, related_name="stalls")
    allergens = models.ManyToManyField(Allergen, blank=True, related_name="stalls")

    # Options and details
    options = models.JSONField(blank=True, default=list)   # e.g., ["Single meal", "7-day meal prep", "Custom"]
    includes = models.JSONField(blank=True, default=list)  # e.g., ["x7 salmon entrees", "x7 asparagus"]
    special_requests_allowed = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product} @ {self.location}"


class SpecialRequest(models.Model):
    stall = models.ForeignKey("store_app.Stall", on_delete=models.CASCADE, related_name="special_requests")
    buyer_profile = models.ForeignKey("user_app.BuyerProfile", on_delete=models.CASCADE, related_name="special_requests")
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="new")  # new, acknowledged, fulfilled, rejected

    def __str__(self):
        return f"Request by {self.buyer_profile_id} for stall {self.stall_id}"


class StallImage(models.Model):
    stall = models.ForeignKey("store_app.Stall", on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="stalls/images/")
    alt_text = models.CharField(max_length=200, blank=True, default="")
    position = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["position", "id"]
        indexes = [
            models.Index(fields=["stall", "position"]),
            models.Index(fields=["stall", "is_primary"]),
        ]

    def __str__(self):
        return f"StallImage(stall={self.stall_id}, pos={self.position})"
