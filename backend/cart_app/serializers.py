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

    class Meta:
        model = CartItem
        fields = ["id", "stall", "stall_id", "quantity", "added_at"]

    def validate_quantity(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Quantity must be a positive integer.")
        return value

    def validate(self, attrs):
        stall = attrs.get("stall") or getattr(self.instance, "stall", None)
        qty = attrs.get("quantity") or getattr(self.instance, "quantity", None)
        if stall is None or qty is None:
            return attrs
        # prevent adding items that are out of stock
        if stall.quantity <= 0:
            raise serializers.ValidationError({"stall_id": "This item is out of stock."})
        # ensure requested does not exceed available at add/update time
        if qty > stall.quantity:
            raise serializers.ValidationError({"quantity": "Requested quantity exceeds available stock."})
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "status", "created_at", "updated_at", "items"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "stall", "product_name", "price_cents", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "created_at", "total_cents", "items"]

