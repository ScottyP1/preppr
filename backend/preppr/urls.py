"""
URL configuration for preppr project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# ViewSets
from user_app.views import (
    MeViewSet,
    BuyerProfileViewSet,
    SellerProfileViewSet,
    UserRegistrationViewSet,  \
    LogoutView,

)
from store_app.views import StallViewSet
from cart_app.views import CartViewSet

# DRF router resources
router = DefaultRouter()
router.register("me", MeViewSet, basename="me")
router.register("buyers", BuyerProfileViewSet, basename="buyers")
router.register("sellers", SellerProfileViewSet, basename="sellers")
router.register("stalls", StallViewSet, basename="stalls")
router.register("auth/register", UserRegistrationViewSet, basename="register")  # POST /api/auth/register/
router.register("cart", CartViewSet, basename="cart")

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),

    # API routes
    path("api/", include(router.urls)),
    



]

# Serve uploaded media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
