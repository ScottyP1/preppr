# user_app/views.py

from django.db import transaction
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

from rest_framework import viewsets, mixins, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User, BuyerProfile, SellerProfile
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    BuyerProfileSerializer,
    SellerProfileSerializer,
)
from .tokens import email_verification_token
from .email_utils import send_verification_email
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


class UserRegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    Router-friendly registration + email verification.

    Routes (when registered as router.register("auth/register", ...)):

    - POST   /api/auth/register/                         -> create()
    - GET    /api/auth/register/verify/<uidb64>/<token>/ -> verify()
    - POST   /api/auth/register/resend/                  -> resend()
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Register a new user, set inactive, send verification email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = serializer.save()  # serializer creates Buyer/Seller profile
            # Ensure account is inactive until email is verified
            if user.is_active:
                user.is_active = False
                user.save(update_fields=["is_active"])
            send_verification_email(request, user)

        data = {
            "user": UserSerializer(user).data,
            "detail": "Account created. Check your email to verify your address.",
        }
        return Response(data, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["get"],
        url_path=r"verify/(?P<uidb64>[^/]+)/(?P<token>[^/]+)",
        permission_classes=[AllowAny],
    )
    def verify(self, request, uidb64=None, token=None):
        """Activate an account if the token is valid."""
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid verification link."}, status=400)

        if email_verification_token.check_token(user, token):
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=["is_active"])
            return Response({"detail": "Email verified. You can now sign in."}, status=200)

        return Response({"detail": "Link expired or invalid."}, status=400)

    @action(
        detail=False,
        methods=["post"],
        url_path="resend",
        permission_classes=[AllowAny],
    )
    def resend(self, request):
        """
        Resend a verification email.

        - If authenticated: resends for the current user (if inactive).
        - If unauthenticated: POST {"email": "<address>"} to resend.
        """
        user = None
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            email = request.data.get("email")
            if email:
                user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response({"detail": "User not found."}, status=404)

        if user.is_active:
            return Response({"detail": "Account is already verified."}, status=400)

        send_verification_email(request, user)
        return Response({"detail": "Verification email sent."}, status=200)


class MeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get", "put", "patch"])
    def user(self, request):
        if request.method in ["PUT", "PATCH"]:
            ser = UserSerializer(instance=request.user, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(ser.data)
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

    @action(detail=False, methods=["post"])
    def become_seller(self, request):
        """Upgrade the current user to seller and create SellerProfile.

        - Requires: authenticated user with role=buyer
        - Effect: switches user.role to seller, creates SellerProfile (if missing)
        - Response: the created/updated seller profile
        """
        if request.user.role != User.Roles.BUYER:
            return Response({"detail": "Only buyers can become sellers."}, status=403)

        with transaction.atomic():
            user = request.user
            user.role = User.Roles.SELLER
            user.save(update_fields=["role"])
            profile, _ = SellerProfile.objects.get_or_create(user=user)

        return Response(SellerProfileSerializer(profile).data, status=status.HTTP_201_CREATED)


class BuyerProfileViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    queryset = BuyerProfile.objects.select_related("user", "favorite_stall").all()
    serializer_class = BuyerProfileSerializer
    permission_classes = [IsAuthenticated]  # read-only listing; modify via /me endpoints


class SellerProfileViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    queryset = SellerProfile.objects.select_related("user", "stall").all()
    serializer_class = SellerProfileSerializer
    permission_classes = [IsAuthenticated]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Invalidate the provided refresh token by blacklisting it.

        Expected payload: {"refresh": "<refresh_token>"}
        """
        token_str = request.data.get("refresh")
        if not token_str:
            return Response({"detail": "Missing 'refresh' token."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(token_str)
            token.blacklist()  # requires token_blacklist app installed
        except TokenError:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)
