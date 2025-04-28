import factory # type: ignore
from api.models import CustomUser
from rest_framework.test import APIClient
import pytest # type: ignore
import pytest_factoryboy # type: ignore

class CustomUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomUser
        skip_postgeneration_save = True
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    password = factory.PostGenerationMethodCall("set_password", "defaultpassword")

pytest_factoryboy.register(CustomUserFactory)

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def custom_user_factory(db):  
    return CustomUserFactory
