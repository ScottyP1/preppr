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
        """Check if email is unique (since it will be used as username)"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        """Validate password using Django's built-in validators"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Check if passwords match"""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords don't match."}
            )
        return attrs

    def create(self, validated_data):
        # Remove password_confirm since it's not needed for user creation
        validated_data.pop("password_confirm")

        # Use email as username
        email = validated_data["email"]
        validated_data["username"] = email

        # Create user with hashed password
        user = User.objects.create_user(**validated_data)

        # Create appropriate profile based on role
        if user.role == User.Roles.BUYER:
            BuyerProfile.objects.create(user=user)
        elif user.role == User.Roles.SELLER:
            SellerProfile.objects.create(user=user)

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    favorite_stall = serializers.PrimaryKeyRelatedField(
        queryset=Stall.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = BuyerProfile
        fields = ["id", "user", "allergies", "preference", "location", "favorite_stall"]


class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    stall = serializers.PrimaryKeyRelatedField(
        queryset=Stall.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = SellerProfile
        fields = ["id", "user", "location", "stall"]
