# serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, BuyerProfile, SellerProfile
from store_app.models import Stall


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password_confirm",
            "role",
            "first_name",
            "last_name",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_email(self, value):
        # Use email as username → ensure uniqueness across both fields
        if User.objects.filter(email=value).exists() or User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        email = validated_data["email"]
        validated_data["username"] = email
        user = User.objects.create_user(**validated_data)

        # ensure inactive until verified
        user.is_active = False
        user.save(update_fields=["is_active"])

        if user.role == User.Roles.BUYER:
            BuyerProfile.objects.create(user=user)
        elif user.role == User.Roles.SELLER:
            SellerProfile.objects.create(user=user)
        return user



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "first_name", "last_name"]
        read_only_fields = ["id", "username", "email", "role"]


class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    favorite_stall = serializers.PrimaryKeyRelatedField(
        queryset=Stall.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = BuyerProfile
        # Include all model fields that belong on the API
        fields = [
            "id",
            "user",
            "allergies",
            "preference",
            "location",
            "address",
            "zipcode",
            "favorite_stall",
            "avatar",
        ]

    def validate_zipcode(self, value):
        # Allow empty / null to pass through (handled by model defaults)
        if value in ("", None):
            return value
        # Enforce numeric and <= 5 digits (0..99999)
        try:
            iv = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Zipcode must be numeric.")
        if iv < 0 or iv > 99999:
            raise serializers.ValidationError("Zipcode must be at most 5 digits (0–99999).")
        return iv


class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    stall = serializers.PrimaryKeyRelatedField(
        queryset=Stall.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "user",
            "location",
            "address",
            "zipcode",
            "stall",
            "avatar",
            "image",
        ]

    def validate_zipcode(self, value):
        if value in ("", None):
            return value
        try:
            iv = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Zipcode must be numeric.")
        if iv < 0 or iv > 99999:
            raise serializers.ValidationError("Zipcode must be at most 5 digits (0–99999).")
        return iv
