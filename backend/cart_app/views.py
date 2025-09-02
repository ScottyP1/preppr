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

        # If item exists, update quantity (clamped by stock via serializer validate)
        stall_id = request.data.get("stall_id") or request.data.get("stall")
        quantity = request.data.get("quantity", 1)
        if not stall_id:
            return Response({"detail": "Missing stall_id."}, status=400)
        try:
            stall = Stall.objects.get(pk=stall_id)
        except Stall.DoesNotExist:
            return Response({"detail": "Invalid stall_id."}, status=400)

        item, created = CartItem.objects.get_or_create(cart=cart, stall=stall, defaults={"quantity": quantity})
        if not created:
            # merge quantities
            serializer = CartItemSerializer(instance=item, data={"quantity": int(item.quantity) + int(quantity)}, partial=True)
        else:
            serializer = CartItemSerializer(instance=item, data={"quantity": item.quantity}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=["patch"], url_path=r"items/(?P<item_id>[^/]+)")
    def update_item(self, request, item_id=None):
        err = self._require_buyer(request)
        if err:
            return err
        cart = self._get_or_create_cart(request)
        try:
            item = cart.items.get(pk=item_id)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found in cart."}, status=404)
        serializer = CartItemSerializer(instance=item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
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
            # Lock all involved stalls to avoid race conditions
            stall_ids = list(cart.items.values_list("stall_id", flat=True))
            stalls = list(Stall.objects.select_for_update().filter(id__in=stall_ids))
            stall_by_id = {s.id: s for s in stalls}

            # Verify stock
            insufficient = []
            for item in cart.items.select_related("stall"):
                stall = stall_by_id[item.stall_id]
                if item.quantity <= 0:
                    insufficient.append({"stall_id": item.stall_id, "reason": "Invalid quantity"})
                elif stall.quantity <= 0:
                    insufficient.append({"stall_id": item.stall_id, "reason": "Out of stock"})
                elif item.quantity > stall.quantity:
                    insufficient.append({"stall_id": item.stall_id, "reason": "Insufficient stock", "available": stall.quantity})
            if insufficient:
                return Response({"detail": "Insufficient stock for some items.", "items": insufficient}, status=400)

            # Decrement stock and create order snapshot
            order = Order.objects.create(buyer_profile=cart.buyer_profile)
            total_cents = 0
            for item in cart.items.select_related("stall"):
                stall = stall_by_id[item.stall_id]
                stall.quantity -= item.quantity
                stall.save(update_fields=["quantity"])

                line_total = item.quantity * stall.price_cents
                total_cents += line_total
                OrderItem.objects.create(
                    order=order,
                    stall=stall,
                    product_name=stall.product,
                    price_cents=stall.price_cents,
                    quantity=item.quantity,
                )

            order.total_cents = total_cents
            order.save(update_fields=["total_cents"])

            # Close cart
            cart.status = Cart.CHECKED_OUT
            cart.save(update_fields=["status"])

        return Response(OrderSerializer(order).data, status=201)

