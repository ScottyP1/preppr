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
        fields = ["id", "href", "alt_text", "position", "is_primary"]


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
            "image_url",
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
        if owner and getattr(owner, "image_url", ""):
            return owner.image_url
        return ""


class StallWriteSerializer(serializers.ModelSerializer):
    tag_names = serializers.ListField(child=serializers.CharField(), required=False)
    allergen_names = serializers.ListField(child=serializers.CharField(), required=False)
    image_urls = serializers.ListField(child=serializers.URLField(), required=False)

    class Meta:
        model = Stall
        fields = [
            "product",
            "description",
            "image_url",
            "image_urls",
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

    def _sync_images(self, stall, image_urls):
        if image_urls is None:
            return
        # replace current images with provided list
        stall.images.all().delete()
        for idx, href in enumerate(image_urls):
            StallImage.objects.create(
                stall=stall,
                href=href,
                alt_text=f"{stall.product}",
                position=idx,
                is_primary=(idx == 0),
            )
        # keep legacy field in sync with first image if present
        if image_urls:
            stall.image_url = image_urls[0]
            stall.save(update_fields=["image_url"])

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        allergen_names = validated_data.pop("allergen_names", None)
        image_urls = validated_data.pop("image_urls", None)
        stall = Stall.objects.create(**validated_data)
        self._assign_labels(stall, tag_names, allergen_names)
        self._sync_images(stall, image_urls)
        return stall

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        allergen_names = validated_data.pop("allergen_names", None)
        image_urls = validated_data.pop("image_urls", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        self._assign_labels(instance, tag_names, allergen_names)
        self._sync_images(instance, image_urls)
        return instance


class SpecialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialRequest
        fields = ["id", "stall", "buyer_profile", "note", "status", "created_at"]
        read_only_fields = ["buyer_profile", "status", "created_at"]
