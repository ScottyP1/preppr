from django.db import models, transaction


class Cart(models.Model):
    OPEN = "open"
    CHECKED_OUT = "checked_out"
    CANCELED = "canceled"

    STATUS_CHOICES = [
        (OPEN, "Open"),
        (CHECKED_OUT, "Checked Out"),
        (CANCELED, "Canceled"),
    ]

    buyer_profile = models.ForeignKey(
        "user_app.BuyerProfile", on_delete=models.CASCADE, related_name="carts"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["buyer_profile", "status"])]

    def __str__(self):
        return f"Cart({self.id}) for buyer {self.buyer_profile_id} [{self.status}]"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    stall = models.ForeignKey("store_app.Stall", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("cart", "stall")

    def __str__(self):
        return f"CartItem(cart={self.cart_id}, stall={self.stall_id}, qty={self.quantity})"


class Order(models.Model):
    buyer_profile = models.ForeignKey(
        "user_app.BuyerProfile", on_delete=models.CASCADE, related_name="orders"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    total_cents = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Order({self.id}) buyer={self.buyer_profile_id} total={self.total_cents}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    stall = models.ForeignKey("store_app.Stall", on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=120)
    price_cents = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    STATUS_CHOICES = [
        ("new", "New"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    def line_total_cents(self):
        return self.price_cents * self.quantity
