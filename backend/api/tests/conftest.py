import factory # type: ignore
from api.models import CustomUser, Pet, Petsitter, PetsitterAvailability, Visit
from rest_framework.test import APIClient
import pytest # type: ignore
import pytest_factoryboy # type: ignore

class CustomUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomUser
        skip_postgeneration_save = True
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda o: f"{o.username}@example.com")
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    role = "user"

class PetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pet
    user = factory.SubFactory(CustomUserFactory)
    name = factory.Sequence(lambda n: f"Pet{n}")
    pet_type = "dog"
    age = 3

class PetsitterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Petsitter
    user = factory.SubFactory(CustomUserFactory)
    description = "Opis"
    hourly_rate = 20

class PetsitterAvailabilityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PetsitterAvailability
    petsitter = factory.SubFactory(PetsitterFactory)
    date = "2030-01-01"
    is_available = True

class VisitFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Visit
    user = factory.SubFactory(CustomUserFactory)
    petsitter = factory.SubFactory(PetsitterFactory)
    pets = factory.LazyAttribute(lambda o: [PetFactory.create(user=o.user).id])
    start_date = "2030-01-01"
    end_date = "2030-01-02"
    care_type = "care_at_owner_home"

pytest_factoryboy.register(CustomUserFactory)

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def custom_user_factory():
    return CustomUserFactory

@pytest.fixture
def pet_factory():
    return PetFactory

@pytest.fixture
def petsitter_factory():
    return PetsitterFactory

@pytest.fixture
def petsitter_availability_factory():
    return PetsitterAvailabilityFactory

@pytest.fixture
def visit_factory():
    return VisitFactory
