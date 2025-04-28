from django.urls import reverse
import pytest # type: ignore

@pytest.mark.django_db
def test_user_list(api_client, custom_user_factory):
    # Utwórz użytkownika i zaloguj klienta
    user = custom_user_factory.create()
    api_client.force_authenticate(user=user)

    # Utwórz 5 użytkowników
    custom_user_factory.create_batch(5)
    
    # Wyślij żądanie
    response = api_client.get(reverse("home"))
    
    # Sprawdź odpowiedź
    assert response.status_code == 200
    assert len(response.data) == 6  # Upewnij się, że endpoint zwraca wszystkich użytkowników
