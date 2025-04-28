from rest_framework.test import APITestCase
from api.serializers import UserCreateSerializer

class UserCreateSerializerTest(APITestCase):
    def test_valid_data(self):
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
        serializer = UserCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_invalid_email(self):
        data = {"username": "testuser", "email": "invalid", "password": "testpass123"}
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
