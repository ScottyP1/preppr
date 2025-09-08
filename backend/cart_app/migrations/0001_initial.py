from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("user_app", "0001_initial"),
        ("store_app", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Cart",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("open", "Open"), ("checked_out", "Checked Out"), ("canceled", "Canceled")], default="open", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("buyer_profile", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="carts", to="user_app.buyerprofile")),
            ],
        ),
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("total_cents", models.PositiveIntegerField(default=0)),
                ("buyer_profile", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="orders", to="user_app.buyerprofile")),
            ],
        ),
        migrations.CreateModel(
            name="CartItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("quantity", models.PositiveIntegerField(default=1)),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                ("cart", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="cart_app.cart")),
                ("stall", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="store_app.stall")),
            ],
        ),
        migrations.CreateModel(
            name="OrderItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("product_name", models.CharField(max_length=120)),
                ("price_cents", models.PositiveIntegerField()),
                ("quantity", models.PositiveIntegerField()),
                ("status", models.CharField(choices=[("new", "New"), ("accepted", "Accepted"), ("declined", "Declined")], default="new", max_length=20)),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="cart_app.order")),
                ("stall", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to="store_app.stall")),
            ],
        ),
        migrations.AddIndex(
            model_name="cart",
            index=models.Index(fields=["buyer_profile", "status"], name="cart_app_ca_buyer_p_055290_idx"),
        ),
        migrations.AlterUniqueTogether(
            name="cartitem",
            unique_together={("cart", "stall")},
        ),
    ]
