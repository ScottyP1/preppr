from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSelfProfile(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is BuyerProfile or SellerProfile
        return getattr(obj, "user_id", None) == request.user.id
