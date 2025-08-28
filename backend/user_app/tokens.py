from django.contrib.auth.tokens import PasswordResetTokenGenerator

# Reuse Django’s proven, time-limited token generator
email_verification_token = PasswordResetTokenGenerator()
