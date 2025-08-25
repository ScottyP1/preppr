from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import User, BuyerProfile, SellerProfile
from .serializers import UserSerializer, BuyerProfileSerializer, SellerProfileSerializer
from .permissions import IsSelfProfile

class MeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def user(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["get", "put", "patch"])
    def buyer_profile(self, request):
        if request.user.role != User.Roles.BUYER:
            return Response({"detail": "Not a buyer."}, status=403)
        profile, _ = BuyerProfile.objects.get_or_create(user=request.user)
        if request.method in ["PUT", "PATCH"]:
            ser = BuyerProfileSerializer(profile, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(ser.data)
        return Response(BuyerProfileSerializer(profile).data)

    @action(detail=False, methods=["get", "put", "patch"])
    def seller_profile(self, request):
        if request.user.role != User.Roles.SELLER:
            return Response({"detail": "Not a seller."}, status=403)
        profile, _ = SellerProfile.objects.get_or_create(user=request.user)
        if request.method in ["PUT", "PATCH"]:
            ser = SellerProfileSerializer(profile, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(ser.data)
        return Response(SellerProfileSerializer(profile).data)

class BuyerProfileViewSet(mixins.RetrieveModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    queryset = BuyerProfile.objects.select_related("user", "favorite_stall").all()
    serializer_class = BuyerProfileSerializer
    permission_classes = [IsAuthenticated]  # listing is okay; modify via /me endpoints only

class SellerProfileViewSet(mixins.RetrieveModelMixin,
                           mixins.ListModelMixin,
                           viewsets.GenericViewSet):
    queryset = SellerProfile.objects.select_related("user", "stall").all()
    serializer_class = SellerProfileSerializer
    permission_classes = [IsAuthenticated]
