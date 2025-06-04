from rest_framework.test import APITestCase
from rest_framework.test import APITestCase
from api.serializers import (
    UserCreateSerializer, UserListDetailSerializer, UserProfileSerializer,
    PetsitterSerializer, VisitSerializer, PetSerializer, PetsitterAvailabilitySerializer
)
from api.models import CustomUser, Petsitter, Visit, Pet, PetsitterAvailability
from django.utils import timezone
from datetime import date, timedelta

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

    def test_duplicate_email(self):
        CustomUser.objects.create_user(username="other", email="dup@example.com", password="x")
        data = {"username": "testuser", "email": "dup@example.com", "password": "testpass123"}
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_missing_email(self):
        data = {"username": "testuser", "password": "testpass123"}
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

class UserListDetailSerializerTest(APITestCase):
    def test_fields_output(self):
        user = CustomUser.objects.create_user(username="u", email="e@e.com", password="p", role="user")
        serializer = UserListDetailSerializer(user)
        self.assertIn("id", serializer.data)
        self.assertIn("username", serializer.data)
        self.assertIn("email", serializer.data)
        self.assertIn("role", serializer.data)

class UserProfileSerializerTest(APITestCase):
    def test_profile_fields(self):
        user = CustomUser.objects.create_user(
            username="test", email="t@t.com", password="p",
            first_name="A", last_name="B", phone="123", city="C", street="S",
            house_number="1", apartment_number="2", postal_code="00-000"
        )
        serializer = UserProfileSerializer(user)
        self.assertEqual(serializer.data["first_name"], "A")
        self.assertEqual(serializer.data["is_petsitter"], False)

    def test_is_petsitter_true(self):
        user = CustomUser.objects.create_user(username="t", email="t@e.com", password="p")
        Petsitter.objects.create(user=user)
        serializer = UserProfileSerializer(user)
        self.assertEqual(serializer.data["is_petsitter"], True)

class PetsitterSerializerTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username="pet", email="p@p.com", password="p", city="Warsaw")
        self.petsitter = Petsitter.objects.create(
            user=self.user, description="desc", hourly_rate=20,
            is_dog_sitter=True, is_cat_sitter=False, is_rodent_sitter=False,
            care_at_owner_home=True, care_at_petsitter_home=False, dog_walking=True
        )

    def test_fields_output(self):
        serializer = PetsitterSerializer(self.petsitter)
        self.assertEqual(serializer.data["username"], self.user.username)
        self.assertEqual(serializer.data["city"], self.user.city)
        self.assertEqual(serializer.data["description"], "desc")

class VisitSerializerTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username="v", email="v@v.com", password="p")
        self.petsitter = Petsitter.objects.create(user=self.user)
        self.pet = Pet.objects.create(user=self.user, name="Rex", pet_type="dog", age=5)
        self.visit = Visit.objects.create(
        user=self.user,
        petsitter=self.petsitter,
        pets=[self.pet.id],
        start_date=date.today(),
        end_date=date.today() + timedelta(days=2),
        care_type="care_at_owner_home"
    )

    def test_fields_output(self):
        serializer = VisitSerializer(self.visit)
        self.assertEqual(serializer.data["user"], self.user.id)
        self.assertEqual(serializer.data["petsitter"], self.petsitter.id)
        self.assertIn(self.pet.id, serializer.data["pets"])

class PetSerializerTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username="petuser", email="pet@pet.com", password="p")
        self.pet = Pet.objects.create(user=self.user, name="Mruczek", pet_type="cat", age=4)

    def test_fields_output(self):
        serializer = PetSerializer(self.pet)
        self.assertEqual(serializer.data["name"], "Mruczek")
        self.assertEqual(serializer.data["pet_type"], "cat")
        self.assertEqual(serializer.data["user"], self.user.id)

class PetsitterAvailabilitySerializerTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username="a", email="a@a.com", password="p")
        self.petsitter = Petsitter.objects.create(user=self.user)
        self.availability = PetsitterAvailability.objects.create(
            petsitter=self.petsitter, date=date.today(), is_available=True
        )

    def test_fields_output(self):
        serializer = PetsitterAvailabilitySerializer(self.availability)
        self.assertEqual(serializer.data["date"], self.availability.date.isoformat())
        self.assertEqual(serializer.data["is_available"], True)
        self.assertEqual(serializer.data["id"], self.availability.id)
