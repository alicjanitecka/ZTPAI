from django.urls import reverse
import pytest # type: ignore

@pytest.mark.django_db
def test_user_list(api_client, custom_user_factory):
    user = custom_user_factory.create()
    api_client.force_authenticate(user=user)

    custom_user_factory.create_batch(5)

    response = api_client.get(reverse("home"))

    assert response.status_code == 200
    assert len(response.data) == 6 
