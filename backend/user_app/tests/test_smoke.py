# backend/user_app/tests/test_smoke.py
from django.test import TestCase

class SmokeTests(TestCase):
    def test_discovery(self):
        self.assertTrue(True)
