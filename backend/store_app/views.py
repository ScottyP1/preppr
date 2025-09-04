from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Stall, SpecialRequest, Tag, Allergen
from .serializers import (
    StallSerializer,
    StallWriteSerializer,
    SpecialRequestSerializer,
)
from .permissions import IsSellerOrReadOnly


class StallViewSet(viewsets.ModelViewSet):
    queryset = Stall.objects.all().order_by("id")
    permission_classes = [IsSellerOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    # Enable detail routes addressed by `id`, e.g. /api/stalls/123/
    lookup_field = "id"
    lookup_url_kwarg = "id"

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return StallWriteSerializer
        return StallSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by tags: ?tags=gluten-free,vegan
        tags = self.request.query_params.get("tags")
        if tags:
            names = [t.strip() for t in tags.split(",") if t.strip()]
            qs = qs.filter(tags__name__in=names).distinct()

        # Exclude stalls containing allergens: ?allergens_exclude=fish,nuts
        ex = self.request.query_params.get("allergens_exclude")
        if ex:
            names = [a.strip() for a in ex.split(",") if a.strip()]
            qs = qs.exclude(allergens__name__in=names).distinct()

        return qs

    def perform_destroy(self, instance):
        """Only allow deletion by the owning seller profile."""
        user = getattr(self.request, "user", None)
        # Role check handled by IsSellerOrReadOnly; enforce ownership here
        seller_profile = getattr(user, "seller_profile", None)
        if not seller_profile or instance.owner_profile_id != getattr(
            seller_profile, "id", None
        ):
            raise PermissionDenied("You can only delete your own stalls.")
        instance.delete()

    

    @action(detail=True, methods=["post"])
    def set_quantity(self, request, pk=None):
        stall = self.get_object()
        try:
            qty = int(request.data.get("quantity"))
        except (TypeError, ValueError):
            return Response({"detail": "quantity must be int"}, status=400)
        stall.quantity = max(0, qty)
        stall.save()
        return Response(StallSerializer(stall, context={"request": request}).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        user = request.user
        if getattr(user, "role", None) != "buyer":
            return Response({"detail": "Only buyers can favorite stalls."}, status=403)
        stall = self.get_object()
        profile = user.buyer_profile
        profile.favorite_stall = stall
        profile.save(update_fields=["favorite_stall"])
        return Response({"detail": "Favorited."}, status=200)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def request(self, request, pk=None):
        stall = self.get_object()
        user = request.user
        if getattr(user, "role", None) != "buyer":
            return Response({"detail": "Only buyers can create requests."}, status=403)
        if not stall.special_requests_allowed:
            return Response(
                {"detail": "Special requests disabled for this stall."}, status=400
            )
        note = request.data.get("note")
        if not note:
            return Response({"detail": "note is required"}, status=400)
        sr = SpecialRequest.objects.create(
            stall=stall, buyer_profile=user.buyer_profile, note=note
        )
        return Response(
            SpecialRequestSerializer(sr).data, status=status.HTTP_201_CREATED
        )
