from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from typing import Optional, Tuple

from .models import Stall, SpecialRequest, Tag, Allergen
from .serializers import (
    StallSerializer,
    StallWriteSerializer,
    SpecialRequestSerializer,
)
from .permissions import IsSellerOrReadOnly

# Geo helpers
try:
    from geopy.geocoders import Nominatim
    from geopy.distance import geodesic
except Exception:  # Allow import even if geopy not yet installed
    Nominatim = None
    geodesic = None


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

        # Single category alias: ?category=vegan (maps to tags__name)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(tags__name__iexact=category.strip()).distinct()

        # Filter by seller zipcode: ?zip=94107
        zip_param = self.request.query_params.get("zip")
        if zip_param:
            try:
                z = int(zip_param)
                qs = qs.filter(owner_profile__zipcode=z)
            except (TypeError, ValueError):
                # ignore invalid zip
                pass

        # TODO: radius filtering requires coordinates (lat/lng). If you add
        # coords to SellerProfile/Stall, compute distance with Haversine and filter.
        # For now, `radius` parameter is accepted but ignored.

        return qs

    # Utilities
    def _geocode(self, geolocator, query: str) -> Optional[Tuple[float, float]]:
        if not query:
            return None
        try:
            loc = geolocator.geocode(query)
            if not loc:
                return None
            return (loc.latitude, loc.longitude)
        except Exception:
            return None

    @action(detail=False, methods=["get"], url_path="filter")
    def filter(self, request):
        """
        Filters stalls by proximity to a buyer zipcode and optional criteria.

        Query params:
        - `zipcode`: buyer zipcode or address (required)
        - `radius_m`: buyer search radius in meters (default 5000)
        - `food`: free-text match on stall product name (optional)
        - `preferences`: comma-separated tag names to include (optional)
        - `allergens_exclude`: comma-separated allergens to exclude (optional)
        """
        if Nominatim is None or geodesic is None:
            return Response(
                {"detail": "geopy is required for distance filtering. Please install geopy."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        zipcode = request.query_params.get("zipcode")
        if not zipcode:
            return Response({"detail": "zipcode is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            radius_m = int(request.query_params.get("radius_m", 5000))
        except (TypeError, ValueError):
            return Response({"detail": "radius_m must be an integer (meters)"}, status=400)

        food = request.query_params.get("food")
        preferences = request.query_params.get("preferences")  # comma-separated tag names
        allergens_exclude = request.query_params.get("allergens_exclude")

        geolocator = Nominatim(user_agent="preppr_api")
        buyer_coords = self._geocode(geolocator, zipcode)
        if not buyer_coords:
            return Response({"detail": "Unable to geocode buyer zipcode/address"}, status=400)

        qs = Stall.objects.all()
        if food:
            qs = qs.filter(product__icontains=food)
        if preferences:
            tag_names = [t.strip() for t in preferences.split(",") if t.strip()]
            if tag_names:
                qs = qs.filter(tags__name__in=tag_names).distinct()
        if allergens_exclude:
            names = [a.strip() for a in allergens_exclude.split(",") if a.strip()]
            if names:
                qs = qs.exclude(allergens__name__in=names).distinct()

        # In-request geocode cache for stall locations
        cache = {}
        results = []
        for stall in qs:
            loc_str = stall.location or ""
            if not loc_str:
                continue
            if loc_str not in cache:
                cache[loc_str] = self._geocode(geolocator, loc_str)
            stall_coords = cache[loc_str]
            if not stall_coords:
                continue
            try:
                distance_m = geodesic(buyer_coords, stall_coords).meters
            except Exception:
                continue
            # Satisfy both buyer radius and seller's allowed radius
            seller_radius = max(getattr(stall, "radius_m", 0), 0)
            if distance_m <= min(max(radius_m, 0), seller_radius):
                results.append(stall)

        serializer = StallSerializer(results, many=True, context={"request": request})
        return Response(serializer.data)

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
