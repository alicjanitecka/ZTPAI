from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from api.models import CustomUser, Pet, Petsitter, PetsitterAvailability, Visit
from datetime import date, timedelta

def create_user(username="user1", email="user1@example.com", password="testpass123", role="user"):
    user = CustomUser.objects.create_user(username=username, email=email, password=password, role=role)
    return user

def get_token(client, username, password):
    url = reverse("get_token")
    response = client.post(url, {"username": username, "password": password})
    return response.data["access"]

class UserEndpointsTest(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.admin = create_user(username="admin", email="admin@example.com", password="adminpass", role="admin")
        self.client = APIClient()

    def test_register(self):
        url = reverse("register")
        data = {"username": "newuser", "email": "new@example.com", "password": "newpass123"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_list_admin(self):
        token = get_token(self.client, self.admin.username, "adminpass")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("admin-panel")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_detail(self):
        token = get_token(self.client, self.user.username, "testpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("user_detail", args=[self.user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_profile_get_and_patch(self):
        token = get_token(self.client, self.user.username, "testpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("user-profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        patch_data = {"first_name": "Ala"}
        response = self.client.patch(url, patch_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Ala")

    def test_user_delete_admin(self):
        token = get_token(self.client, self.admin.username, "adminpass")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("delete_user", args=[self.user.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class PetEndpointsTest(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client = APIClient()
        self.token = get_token(self.client, self.user.username, "testpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_pet_list_create(self):
        url = reverse("pet-list-create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = {"name": "Burek", "pet_type": "dog", "breed": "mutt", "age": 3}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class PetsitterEndpointsTest(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client = APIClient()
        self.token = get_token(self.client, self.user.username, "testpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_petsitter_create_and_me(self):
        url = reverse("petsitter-create")
        data = {
            "description": "Lubię zwierzęta",
            "hourly_rate": 25,
            "is_dog_sitter": True,
            "is_cat_sitter": False,
            "is_rodent_sitter": False,
            "care_at_owner_home": True,
            "care_at_petsitter_home": False,
            "dog_walking": True
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        url = reverse("petsitter-me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_petsitter_patch(self):
        Petsitter.objects.create(user=self.user, description="desc", hourly_rate=20)
        url = reverse("petsitter-me")
        patch_data = {"description": "Nowy opis"}
        response = self.client.patch(url, patch_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Nowy opis")

    def test_petsitter_search(self):
        url = reverse("petsitter_search")
        response = self.client.get(url, {"city": "Warsaw"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class PetsitterAvailabilityEndpointsTest(APITestCase):
    def setUp(self):
        self.user = create_user()
        Petsitter.objects.create(user=self.user, description="desc", hourly_rate=20)
        self.client = APIClient()
        self.token = get_token(self.client, self.user.username, "testpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_availability_list_create(self):
        url = reverse("petsitter-availability-list-create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = {"date": (date.today() + timedelta(days=1)).isoformat(), "is_available": True}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_availability_delete(self):
        petsitter = Petsitter.objects.get(user=self.user)
        avail = PetsitterAvailability.objects.create(petsitter=petsitter,  date=date.today(), is_available=True)
        url = reverse("petsitter-availability-update-delete", args=[avail.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class VisitEndpointsTest(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.petsitter_user = create_user(username="petsit", email="petsit@example.com")
        self.petsitter = Petsitter.objects.create(user=self.petsitter_user, description="desc", hourly_rate=20)
        self.pet = Pet.objects.create(user=self.user, name="Burek", pet_type="dog", breed="mutt", age=3)
        self.client = APIClient()
        self.token = get_token(self.client, self.user.username, "testpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_visit_patch(self):
        visit = Visit.objects.create(
            user=self.user,
            petsitter=self.petsitter,
            pets=[self.pet.id],
            start_date=date.today(),
            end_date=date.today() + timedelta(days=2),
            care_type="dog_walking" )
        url = reverse("visit-update", args=[visit.id])
        patch_data = {"care_type": "dog_walking"}
        response = self.client.patch(url, patch_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["care_type"], "dog_walking")
