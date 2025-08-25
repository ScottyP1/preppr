from rest_framework import serializers
from .models import User, BuyerProfile, SellerProfile
from store_app.models import Stall

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]

class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    favorite_stall = serializers.PrimaryKeyRelatedField(queryset=Stall.objects.all(), required=False, allow_null=True)

    class Meta:
        model = BuyerProfile
        fields = ["id", "user", "allergies", "preference", "location", "favorite_stall"]

class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    stall = serializers.PrimaryKeyRelatedField(queryset=Stall.objects.all(), required=False, allow_null=True)

    class Meta:
        model = SellerProfile
        fields = ["id", "user", "location", "stall"]
