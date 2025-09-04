from rest_framework import serializers
from .models import Stall, Tag, Allergen, SpecialRequest, StallImage
from user_app.models import User, SellerProfile  # adjust path as needed


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class AllergenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergen
        fields = ["id", "name"]


class StallImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StallImage
        fields = ["id", "image", "alt_text", "position", "is_primary"]


class SellerMiniSerializer(serializers.ModelSerializer):
    """Minimal nested seller info surfaced inside a stall"""
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "avatar"]


class StallSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    allergens = AllergenSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    images = StallImageSerializer(many=True, read_only=True)
    seller = serializers.SerializerMethodField()  # 👈 nested seller info

    class Meta:
        model = Stall
        fields = [
            "id",
            "product",
            "description",
            "image",
            "images",
            "seller",   # 👈 include seller object
            "location",
            "quantity",
            "radius_m",
            "price_cents",
            "price_level",
            "average_rating",
            "rating_count",
            "calories",
            "fat_g",
            "carbs_g",
            "tags",
            "allergens",
            "options",
            "includes",
            "special_requests_allowed",
            "is_favorited",
        ]

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or getattr(user, "role", None) != "buyer":
            return False
        profile = getattr(user, "buyer_profile", None)
        return bool(profile and getattr(profile, "favorite_stall_id", None) == obj.id)

    def get_seller(self, obj):
        owner = getattr(obj, "owner_profile", None)
        if owner and owner.user:
            u = owner.user
            return {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "avatar": u.avatar,
                "profile_image": owner.image.url if owner.image else None,
            }
        return None


class StallWriteSerializer(serializers.ModelSerializer):
    tag_names = serializers.ListField(child=serializers.CharField(), required=False)
    allergen_names = serializers.ListField(child=serializers.CharField(), required=False)
    image = serializers.ImageField(required=False, allow_empty_file=False, write_only=True)
    images = serializers.ListField(child=serializers.ImageField(), required=False, write_only=True)

    class Meta:
        model = Stall
        fields = [
            "product",
            "description",
            "image",
            "images",
            "location",
            "quantity",
            "radius_m",
            "price_cents",
            "price_level",
            "calories",
            "fat_g",
            "carbs_g",
            "options",
            "includes",
            "special_requests_allowed",
            "tag_names",
            "allergen_names",
        ]

    def _assign_labels(self, stall, tag_names, allergen_names):
        if tag_names is not None:
            tags = [Tag.objects.get_or_create(name=name.strip())[0] for name in tag_names if name.strip()]
            stall.tags.set(tags)
        if allergen_names is not None:
            alls = [Allergen.objects.get_or_create(name=name.strip())[0] for name in allergen_names if name.strip()]
            stall.allergens.set(alls)

    def _sync_images(self, stall, image_files):
        if image_files is None:
            return
        stall.images.all().delete()
        for idx, img in enumerate(image_files):
            StallImage.objects.create(
                stall=stall,
                image=img,
                alt_text=f"{stall.product}",
                position=idx,
                is_primary=(idx == 0),
            )

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        allergen_names = validated_data.pop("allergen_names", None)
        image_files = validated_data.pop("images", None)
        primary_image = validated_data.pop("image", None)

        request = self.context.get("request")
        seller_profile = None
        if request and request.user.is_authenticated:
            seller_profile = getattr(request.user, "seller_profile", None)

        # Attach seller_profile (owner) to the stall
        stall = Stall.objects.create(owner_profile=seller_profile, **validated_data)

        if primary_image is not None:
            stall.image = primary_image
            stall.save(update_fields=["image"])

        self._assign_labels(stall, tag_names, allergen_names)
        self._sync_images(stall, image_files)

        if not stall.image and image_files:
            stall.image = image_files[0]
            stall.save(update_fields=["image"])

        return stall

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        allergen_names = validated_data.pop("allergen_names", None)
        image_files = validated_data.pop("images", None)
        primary_image = validated_data.pop("image", None)

        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()

        self._assign_labels(instance, tag_names, allergen_names)
        if primary_image is not None:
            instance.image = primary_image
            instance.save(update_fields=["image"])
        self._sync_images(instance, image_files)
        return instance


class SpecialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialRequest
        fields = ["id", "stall", "buyer_profile", "note", "status", "created_at"]
        read_only_fields = ["buyer_profile", "status", "created_at"]
