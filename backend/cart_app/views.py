from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from user_app.models import User, BuyerProfile
from store_app.models import Stall


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _require_buyer(self, request):
        if request.user.role != User.Roles.BUYER:
            return Response({"detail": "Only buyers can access cart."}, status=403)
        return None

    def _get_or_create_cart(self, request):
        profile, _ = BuyerProfile.objects.get_or_create(user=request.user)
        cart, _ = Cart.objects.get_or_create(buyer_profile=profile, status=Cart.OPEN)
        return cart

    def list(self, request):
        err = self._require_buyer(request)
        if err:
            return err
        cart = self._get_or_create_cart(request)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["post"], url_path="items")
    def add_item(self, request):
        err = self._require_buyer(request)
        if err:
            return err
        cart = self._get_or_create_cart(request)

        # Parse inputs
        stall_id = request.data.get("stall_id") or request.data.get("stall")
        if not stall_id:
            return Response({"detail": "Missing stall_id."}, status=400)
        # quantity no longer tracked; always treat as a single entry per stall

        # Resolve stall and validate stock before creating/updating
        try:
            stall = Stall.objects.get(pk=stall_id)
        except Stall.DoesNotExist:
            return Response({"detail": "Invalid stall_id."}, status=400)

        item = CartItem.objects.filter(cart=cart, stall=stall).first()
        if item:
            created = False
        else:
            CartItem.objects.create(cart=cart, stall=stall)
            created = True

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=["patch"], url_path=r"items/(?P<item_id>[^/]+)")
    def update_item(self, request, item_id=None):
        # Quantity updates are no-ops since we don't track quantity.
        err = self._require_buyer(request)
        if err:
            return err
        cart = self._get_or_create_cart(request)
        try:
            cart.items.get(pk=item_id)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found in cart."}, status=404)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["delete"], url_path=r"items/(?P<item_id>[^/]+)")
    def remove_item(self, request, item_id=None):
        err = self._require_buyer(request)
        if err:
            return err
        cart = self._get_or_create_cart(request)
        try:
            item = cart.items.get(pk=item_id)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found in cart."}, status=404)
        item.delete()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["post"], url_path="checkout")
    def checkout(self, request):
        err = self._require_buyer(request)
        if err:
            return err
        cart = self._get_or_create_cart(request)
        if cart.items.count() == 0:
            return Response({"detail": "Cart is empty."}, status=400)

        with transaction.atomic():
            # Create order snapshot without inventory checks; chef will accept/decline
            order = Order.objects.create(buyer_profile=cart.buyer_profile)
            total_cents = 0
            for item in cart.items.select_related("stall"):
                stall = item.stall
                line_total = (stall.price_cents or 0)
                total_cents += line_total
                OrderItem.objects.create(
                    order=order,
                    stall=stall,
                    product_name=stall.product,
                    price_cents=stall.price_cents,
                    quantity=1,
                )

            order.total_cents = total_cents
            order.save(update_fields=["total_cents"])

            # Close cart
            cart.status = Cart.CHECKED_OUT
            cart.save(update_fields=["status"])

        return Response(OrderSerializer(order).data, status=201)

    @action(detail=False, methods=["get"], url_path="orders")
    def list_buyer_orders(self, request):
        err = self._require_buyer(request)
        if err:
            return err
        orders = Order.objects.filter(buyer_profile__user=request.user).order_by("-created_at")
        return Response(OrderSerializer(orders, many=True).data)

    @action(detail=False, methods=["get"], url_path="seller-orders")
    def list_seller_orders(self, request):
        if request.user.role != User.Roles.SELLER:
            return Response({"detail": "Only sellers can view seller orders."}, status=403)
        seller_profile = request.user.seller_profile
        items = (
            OrderItem.objects
            .select_related("order", "stall", "order__buyer_profile__user")
            .filter(stall__owner_profile=seller_profile)
            .order_by("-order__created_at", "-id")
        )
        from .serializers import OrderItemSerializer
        return Response(OrderItemSerializer(items, many=True).data)

    @action(detail=False, methods=["post"], url_path=r"items/(?P<order_item_id>[^/]+)/status")
    def set_item_status(self, request, order_item_id=None):
        if request.user.role != User.Roles.SELLER:
            return Response({"detail": "Only sellers can update order status."}, status=403)
        status_val = request.data.get("status")
        if status_val not in ("accepted", "declined"):
            return Response({"detail": "Invalid status."}, status=400)
        try:
            item = OrderItem.objects.select_related("stall").get(pk=order_item_id)
        except OrderItem.DoesNotExist:
            return Response({"detail": "Order item not found."}, status=404)
        if item.stall is None or item.stall.owner_profile_id != request.user.seller_profile_id:
            return Response({"detail": "You do not own this order item."}, status=403)
        item.status = status_val
        item.save(update_fields=["status"])
        from .serializers import OrderItemSerializer
        return Response(OrderItemSerializer(item).data)
