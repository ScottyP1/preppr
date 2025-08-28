from rest_framework import serializers
from .models import Stall, Tag, Allergen, SpecialRequest


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class AllergenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergen
        fields = ["id", "name"]


class StallSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    allergens = AllergenSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Stall
        fields = [
            "id",
            # basics
            "product",
            "description",
            "image_url",
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


class StallWriteSerializer(serializers.ModelSerializer):
    tag_names = serializers.ListField(child=serializers.CharField(), required=False)
    allergen_names = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Stall
        fields = [
            "product",
            "description",
            "image_url",
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

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        allergen_names = validated_data.pop("allergen_names", None)
        stall = Stall.objects.create(**validated_data)
        self._assign_labels(stall, tag_names, allergen_names)
        return stall

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        allergen_names = validated_data.pop("allergen_names", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        self._assign_labels(instance, tag_names, allergen_names)
        return instance


class SpecialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialRequest
        fields = ["id", "stall", "buyer_profile", "note", "status", "created_at"]
        read_only_fields = ["buyer_profile", "status", "created_at"]
