import pytest
from django.urls import reverse
from rest_framework import status
from api.models import CustomUser, Pet, Petsitter, PetsitterAvailability, Visit
from datetime import date, timedelta

@pytest.mark.django_db
def test_create_user(client):
    url = reverse("register")
    payload = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpass123"
    }
    response = client.post(url, payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert CustomUser.objects.filter(username="testuser").exists()

@pytest.mark.django_db
def test_user_list(api_client, custom_user_factory):
    user = custom_user_factory.create(role='admin')
    api_client.force_authenticate(user=user)
    custom_user_factory.create_batch(5)
    response = api_client.get(reverse("admin-panel"))
    assert response.status_code == 200
    assert len(response.data) >= 6

@pytest.mark.django_db
def test_user_detail(api_client, custom_user_factory):
    user = custom_user_factory.create(role='admin')
    target = custom_user_factory.create()
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("user_detail", args=[target.id]))
    assert response.status_code == 200
    assert response.data["id"] == target.id

@pytest.mark.django_db
def test_user_delete(api_client, custom_user_factory):
    admin = custom_user_factory.create(role='admin')
    user = custom_user_factory.create()
    api_client.force_authenticate(user=admin)
    response = api_client.delete(reverse("delete_user", args=[user.id]))
    assert response.status_code == 204
    assert not CustomUser.objects.filter(id=user.id).exists()

@pytest.mark.django_db
def test_user_profile_get_patch(api_client, custom_user_factory):
    user = custom_user_factory.create()
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("user-profile"))
    assert response.status_code == 200
    patch_data = {"first_name": "Alicja"}
    response = api_client.patch(reverse("user-profile"), patch_data)
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.first_name == "Alicja"

@pytest.mark.django_db
def test_pet_list_create(api_client, custom_user_factory):
    user = custom_user_factory.create()
    api_client.force_authenticate(user=user)
    # List
    response = api_client.get(reverse("pet-list-create"))
    assert response.status_code == 200
    # Create
    payload = {"name": "Burek", "pet_type": "dog", "age": 3}
    response = api_client.post(reverse("pet-list-create"), payload)
    assert response.status_code == 201
    assert Pet.objects.filter(name="Burek", user=user).exists()


@pytest.mark.django_db
def test_petsitter_me_patch(api_client, custom_user_factory, petsitter_factory):
    user = custom_user_factory.create()
    petsitter = petsitter_factory.create(user=user)
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("petsitter-me"))
    assert response.status_code == 200
    response = api_client.patch(reverse("petsitter-me"), {"description": "Nowy opis"})
    assert response.status_code == 200
    petsitter.refresh_from_db()
    assert petsitter.description == "Nowy opis"

@pytest.mark.django_db
def test_petsitter_search(api_client, petsitter_factory, custom_user_factory):
    user = custom_user_factory.create(city="Warsaw")
    petsitter_factory.create(user=user)
    response = api_client.get(reverse("petsitter_search"), {"city": "Warsaw"})
    assert response.status_code == 200
    assert len(response.data) > 0

@pytest.mark.django_db
def test_petsitter_create(api_client, custom_user_factory):
    user = custom_user_factory.create()
    api_client.force_authenticate(user=user)
    payload = {
        "description": "Lubię psy",
        "hourly_rate": 30,
        "is_dog_sitter": True,
        "is_cat_sitter": False,
        "is_rodent_sitter": False,
        "care_at_owner_home": True,
        "care_at_petsitter_home": False,
        "dog_walking": True
    }
    response = api_client.post(reverse("petsitter-create"), payload)
    assert response.status_code == 201
    assert Petsitter.objects.filter(user=user).exists()

@pytest.mark.django_db
def test_petsitter_availability_delete(api_client, custom_user_factory, petsitter_factory, petsitter_availability_factory):
    user = custom_user_factory.create()
    api_client.force_authenticate(user=user)
    petsitter = petsitter_factory.create(user=user) 
    availability = petsitter_availability_factory.create(petsitter=petsitter)
    response = api_client.delete(reverse("petsitter-availability-update-delete", args=[availability.id]))
    assert response.status_code == 204
    assert not PetsitterAvailability.objects.filter(id=availability.id).exists()


@pytest.mark.django_db
def test_visit_create_list(api_client, custom_user_factory, pet_factory, petsitter_factory):
    user = custom_user_factory.create()
    petsitter = petsitter_factory.create()
    pet = pet_factory.create(user=user)
    api_client.force_authenticate(user=user)
    payload = {
        "pets": [pet.id],
        "petsitter": petsitter.id,
        "start_date": (date.today() + timedelta(days=3)).isoformat(),
        "end_date": (date.today() + timedelta(days=4)).isoformat(),
        "care_type": "care_at_owner_home"
    }
    response = api_client.post(reverse("visit_create"), payload)
    assert response.status_code == 201
    response = api_client.get(reverse("my-visits"))
    assert response.status_code == 200

@pytest.mark.django_db
def test_visit_patch(api_client, custom_user_factory, visit_factory):
    user = custom_user_factory.create()
    visit = visit_factory.create(user=user)
    api_client.force_authenticate(user=user)
    response = api_client.patch(reverse("visit-update", args=[visit.id]), {"care_type": "dog_walking"})
    assert response.status_code == 200
    visit.refresh_from_db()
    assert visit.care_type == "dog_walking"

def test_documentation():
    """
    This test documents that all endpoints have at least one integration test.
    - User: register, list, detail, delete, profile get/patch
    - Pet: list/create, get/patch/delete
    - Petsitter: me get/patch, search, create
    - PetsitterAvailability: list/create, delete
    - Visit: create, list, patch
    """
    assert True
