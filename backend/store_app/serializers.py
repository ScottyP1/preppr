from rest_framework import serializers
from .models import Stall, Tag, Allergen, SpecialRequest, StallImage


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


class StallSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    allergens = AllergenSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    images = StallImageSerializer(many=True, read_only=True)
    seller_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Stall
        fields = [
            "id",
            # basics
            "product",
            "description",
            "image",
            "images",
            "seller_image_url",
            # location/availability
            "location",
            "quantity",
            "radius_m",
            # pricing/rating
            "price_cents",
            "price_level",
            "average_rating",
            "rating_count",
            # nutrition
            "calories",
            "fat_g",
            "carbs_g",
            # labels
            "tags",
            "allergens",
            # details
            "options",
            "includes",
            "special_requests_allowed",
            # computed
            "is_favorited",
        ]

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or getattr(user, "role", None) != "buyer":
            return False
        profile = getattr(user, "buyer_profile", None)
        return bool(profile and getattr(profile, "favorite_stall_id", None) == obj.id)

    def get_seller_image_url(self, obj):
        # If the seller has a profile image, surface it here for item cards
        owner = getattr(obj, "owner_profile", None)
        # If owner has an uploaded image, return its URL
        if owner and getattr(owner, "image", None):
            try:
                return owner.image.url
            except Exception:
                return ""
        return ""


class StallWriteSerializer(serializers.ModelSerializer):
    tag_names = serializers.ListField(child=serializers.CharField(), required=False)
    allergen_names = serializers.ListField(child=serializers.CharField(), required=False)
    # Accept a primary image file and optional additional images
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
        # Replace current additional images with provided list
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

        stall = Stall.objects.create(**validated_data)

        # Assign primary image if provided
        if primary_image is not None:
            stall.image = primary_image
            stall.save(update_fields=["image"])

        self._assign_labels(stall, tag_names, allergen_names)
        self._sync_images(stall, image_files)
        # If no explicit primary image but we have additional images, set the first as primary
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
