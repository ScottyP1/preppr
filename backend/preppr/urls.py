"""
URL configuration for preppr project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# ViewSets
from user_app.views import (
    MeViewSet,
    BuyerProfileViewSet,
    SellerProfileViewSet,
    UserRegistrationViewSet,  \

)
from store_app.views import StallViewSet

# DRF router resources
router = DefaultRouter()
router.register("me", MeViewSet, basename="me")
router.register("buyers", BuyerProfileViewSet, basename="buyers")
router.register("sellers", SellerProfileViewSet, basename="sellers")
router.register("stalls", StallViewSet, basename="stalls")
router.register("auth/register", UserRegistrationViewSet, basename="register")  # POST /api/auth/register/

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API routes
    path("api/", include(router.urls)),

]
