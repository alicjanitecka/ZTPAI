from api.models import Pet

class PetRepository:
    def get_all_for_user(self, user):
        return Pet.objects.filter(user=user)

    def create(self, user, **kwargs):
        return Pet.objects.create(user=user, **kwargs)
    