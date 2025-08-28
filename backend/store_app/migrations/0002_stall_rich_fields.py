from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("store_app", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Tag",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="Allergen",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name="stall",
            name="average_rating",
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name="stall",
            name="calories",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="stall",
            name="carbs_g",
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name="stall",
            name="description",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="stall",
            name="fat_g",
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name="stall",
            name="image_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="stall",
            name="includes",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="stall",
            name="options",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="stall",
            name="price_cents",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="stall",
            name="price_level",
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="stall",
            name="rating_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="stall",
            name="special_requests_allowed",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="stall",
            name="tags",
            field=models.ManyToManyField(blank=True, related_name="stalls", to="store_app.tag"),
        ),
        migrations.AddField(
            model_name="stall",
            name="allergens",
            field=models.ManyToManyField(blank=True, related_name="stalls", to="store_app.allergen"),
        ),
        migrations.CreateModel(
            name="SpecialRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("note", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("status", models.CharField(default="new", max_length=20)),
                ("buyer_profile", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="special_requests", to="user_app.buyerprofile")),
                ("stall", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="special_requests", to="store_app.stall")),
            ],
        ),
    ]

