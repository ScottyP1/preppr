from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .tokens import email_verification_token

def send_verification_email(request, user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)

    # Build URL using DRF router action name: register-verify
    # This resolves to: /api/auth/register/verify/<uidb64>/<token>/
    verify_path = reverse("register-verify", kwargs={"uidb64": uidb64, "token": token})
    verify_url = request.build_absolute_uri(verify_path)

    subject = "Verify your email"
    message = (
        f"Hi {user.first_name or user.username},\n\n"
        f"Please verify your email by clicking the link below:\n{verify_url}\n\n"
        f"If you didn’t create an account, you can ignore this email."
    )

    send_mail(
        subject=subject,
        message=message,                # keep a plain-text body
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=[user.email],
        fail_silently=False,
    )
