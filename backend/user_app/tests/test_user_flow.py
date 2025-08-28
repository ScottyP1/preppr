# user_app/tests/test_user_flow.py

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework.test import APITestCase
from rest_framework import status

from user_app.tokens import email_verification_token

User = get_user_model()


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class RegistrationEmailVerificationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("register-list")  # POST /api/auth/register/
        self.token_url = reverse("token_obtain_pair") # POST /api/auth/token/

    def _register(self, email="buyer@example.com", password="StrongPassw0rd!", role="buyer"):
        payload = {
            "email": email,
            "password": password,
            "password_confirm": password,
            "role": role,
            "first_name": "Test",
            "last_name": "User",
        }
        return self.client.post(self.register_url, payload, format="json")

    def _verify_url_for(self, user):
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token.make_token(user)
        # matches router action at: /api/auth/register/verify/<uidb64>/<token>/
        return reverse("register-verify", kwargs={"uidb64": uidb64, "token": token})

    def _jwt_login(self, email, password):
        # SimpleJWT expects USERNAME_FIELD (here: username); your serializer sets username=email
        return self.client.post(self.token_url, {"username": email, "password": password}, format="json")

    def test_register_buyer_is_inactive_profile_created_email_sent(self):
        resp = self._register()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # user exists, inactive
        user = User.objects.get(email="buyer@example.com")
        self.assertFalse(user.is_active)
        self.assertTrue(hasattr(user, "buyer_profile"))
        self.assertFalse(hasattr(user, "seller_profile"))

        # one email sent with a verification link
        self.assertEqual(len(mail.outbox), 1)
        body = mail.outbox[0].body
        self.assertIn("/api/auth/register/verify/", body)

    def test_register_seller_is_inactive_profile_created(self):
        resp = self._register(email="seller@example.com", role="seller")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="seller@example.com")
        self.assertFalse(user.is_active)
        self.assertTrue(hasattr(user, "seller_profile"))
        self.assertFalse(hasattr(user, "buyer_profile"))

    def test_inactive_user_cannot_obtain_jwt(self):
        self._register()
        login = self._jwt_login("buyer@example.com", "StrongPassw0rd!")
        self.assertEqual(login.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("No active account", str(login.data))

    def test_verify_activates_and_allows_jwt_login(self):
        self._register()
        user = User.objects.get(email="buyer@example.com")

        # GET the verify endpoint
        verify_url = self._verify_url_for(user)
        verify_resp = self.client.get(verify_url)
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_active)

        # Now JWT should work
        login = self._jwt_login("buyer@example.com", "StrongPassw0rd!")
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("access", login.data)

    def test_resend_verification_unauthenticated_by_email(self):
        self._register(email="resend@example.com")
        self.assertEqual(len(mail.outbox), 1)  # first email

        # POST /api/auth/register/resend/
        resend_url = reverse("register-resend")
        resp = self.client.post(resend_url, {"email": "resend@example.com"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 2)

    def test_duplicate_email_rejected(self):
        self._register(email="dupe@example.com")
        resp2 = self._register(email="dupe@example.com")
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)
        # error could be at serializer-level under 'email'
        self.assertIn("email", resp2.data or {})

    def test_me_endpoints_for_buyer_and_zipcode_validation(self):
        # register + verify + login
        self._register(email="zippy@example.com")
        user = User.objects.get(email="zippy@example.com")
        verify_url = self._verify_url_for(user)
        self.client.get(verify_url)

        login = self._jwt_login("zippy@example.com", "StrongPassw0rd!")
        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # GET /api/me/user/
        me_user_url = reverse("me-user")
        r1 = self.client.get(me_user_url)
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        self.assertEqual(r1.data["email"], "zippy@example.com")

        # GET /api/me/buyer_profile/ — auto-created; then PATCH with valid zipcode
        me_buyer_url = reverse("me-buyer-profile")
        r2 = self.client.get(me_buyer_url)
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

        r3 = self.client.patch(me_buyer_url, {"zipcode": 60606}, format="json")
        self.assertEqual(r3.status_code, status.HTTP_200_OK)
        self.assertEqual(r3.data["zipcode"], 60606)

        # invalid zipcode (too large)
        r4 = self.client.patch(me_buyer_url, {"zipcode": 100000}, format="json")
        self.assertEqual(r4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("zipcode", r4.data)

    def test_me_endpoints_for_seller_profile_flow(self):
        # register seller + verify + login
        self._register(email="seller2@example.com", role="seller")
        user = User.objects.get(email="seller2@example.com")
        verify_url = self._verify_url_for(user)
        self.client.get(verify_url)

        login = self._jwt_login("seller2@example.com", "StrongPassw0rd!")
        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # /api/me/seller_profile/
        me_seller_url = reverse("me-seller-profile")
        r1 = self.client.get(me_seller_url)
        self.assertEqual(r1.status_code, status.HTTP_200_OK)

        # PATCH address & zipcode (valid)
        r2 = self.client.patch(me_seller_url, {"address": "1 Main St", "zipcode": 94105}, format="json")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertEqual(r2.data["zipcode"], 94105)

        # invalid zipcode (non-numeric)
        r3 = self.client.patch(me_seller_url, {"zipcode": "abcde"}, format="json")
        self.assertEqual(r3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("zipcode", r3.data)
