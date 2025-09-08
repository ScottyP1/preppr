from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from store_app.models import Stall


class StallMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stall
        fields = ["id", "product", "price_cents", "quantity"]


class CartItemSerializer(serializers.ModelSerializer):
    stall = StallMiniSerializer(read_only=True)
    stall_id = serializers.PrimaryKeyRelatedField(
        queryset=Stall.objects.all(), source="stall", write_only=True
    )
    # We don't track quantity anymore; expose a constant 1 for compatibility
    quantity = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "stall", "stall_id", "quantity", "added_at"]

    def get_quantity(self, obj):
        return 1


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "status", "created_at", "updated_at", "items"]


class OrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.PrimaryKeyRelatedField(source="order", read_only=True)
    buyer = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "order_id",
            "stall",
            "product_name",
            "price_cents",
            "quantity",
            "status",
            "buyer",
        ]

    def get_buyer(self, obj):
        o = getattr(obj, "order", None)
        prof = getattr(o, "buyer_profile", None)
        u = getattr(prof, "user", None)
        if not u:
            return None
        return {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
        }


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "created_at", "total_cents", "items"]
