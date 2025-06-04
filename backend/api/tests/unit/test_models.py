from django.test import TestCase
from api.models import CustomUser, Petsitter, PetsitterAvailability, Visit, Pet
from datetime import date, timedelta

class CustomUserModelTest(TestCase):
    def test_create_user(self):
        user = CustomUser.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpass123"))

    def test_str_method(self):
        user = CustomUser.objects.create_user(
            username="struser",
            email="str@example.com",
            password="abc"
        )
        self.assertEqual(str(user), "struser")

    def test_role_default(self):
        user = CustomUser.objects.create_user(
            username="roleuser",
            email="role@example.com",
            password="abc"
        )
        self.assertEqual(user.role, 'user')

    def test_unique_email(self):
        CustomUser.objects.create_user(
            username="user1",
            email="unique@example.com",
            password="abc"
        )
        with self.assertRaises(Exception):
            CustomUser.objects.create_user(
                username="user2",
                email="unique@example.com",
                password="xyz"
            )

class PetsitterModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="petsitteruser",
            email="ps@example.com",
            password="abc"
        )

    def test_create_petsitter(self):
        petsitter = Petsitter.objects.create(
            user=self.user,
            description="Loves pets",
            is_dog_sitter=True,
            hourly_rate=25.50
        )
        self.assertTrue(petsitter.is_dog_sitter)
        self.assertEqual(petsitter.hourly_rate, 25.50)

    def test_petsitter_related_name(self):
        petsitter = Petsitter.objects.create(user=self.user)
        self.assertEqual(self.user.petsitter_profile, petsitter)

class PetsitterAvailabilityModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="availuser",
            email="avail@example.com",
            password="abc"
        )
        self.petsitter = Petsitter.objects.create(user=self.user)

    def test_create_availability(self):
        avail = PetsitterAvailability.objects.create(
            petsitter=self.petsitter,
            date=date.today(),
            is_available=True
        )
        self.assertEqual(avail.petsitter, self.petsitter)
        self.assertTrue(avail.is_available)

class VisitModelTest(TestCase):
    def setUp(self):
        self.owner = CustomUser.objects.create_user(
            username="visitowner",
            email="visitowner@example.com",
            password="abc"
        )
        self.petsitter_user = CustomUser.objects.create_user(
            username="visitpetsitter",
            email="visitpetsitter@example.com",
            password="abc"
        )
        self.petsitter = Petsitter.objects.create(user=self.petsitter_user)
        self.pet = Pet.objects.create(
            user=self.owner,
            name="Fluffy",
            age=3,
            pet_type="dog"
        )

    def test_create_visit(self):
        visit = Visit.objects.create(
            user=self.owner,
            petsitter=self.petsitter,
            care_type="dog_walking",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=2),
            pets=[self.pet.id]
        )
        self.assertEqual(visit.user, self.owner)
        self.assertEqual(visit.petsitter, self.petsitter)
        self.assertIn(self.pet.id, visit.pets)
        self.assertFalse(visit.confirmed)
        self.assertFalse(visit.canceled)

    def test_visit_str(self):
        visit = Visit.objects.create(
            user=self.owner,
            petsitter=self.petsitter,
            care_type="dog_walking",
            start_date=date(2024, 6, 1),
            end_date=date(2024, 6, 2),
            pets=[self.pet.id]
        )
        expected = f"Visit: {self.owner} with {self.petsitter} (2024-06-01 - 2024-06-02)"
        self.assertEqual(str(visit), expected)

class PetModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="petuser",
            email="petuser@example.com",
            password="abc"
        )

    def test_create_pet(self):
        pet = Pet.objects.create(
            user=self.user,
            name="Bella",
            age=2,
            breed="Bulldog",
            additional_info="Very playful",
            photo_url="http://example.com/bella.jpg",
            pet_type="dog"
        )
        self.assertEqual(pet.name, "Bella")
        self.assertEqual(pet.pet_type, "dog")

    def test_pet_str(self):
        pet = Pet.objects.create(
            user=self.user,
            name="Charlie",
            age=1,
            pet_type="cat"
        )
        self.assertEqual(str(pet), "Charlie (cat)")