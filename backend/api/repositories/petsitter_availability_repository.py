from api.models import Petsitter, PetsitterAvailability

class PetsitterAvailabilityRepository:
    def get_all_for_user(self, user):
        petsitter = Petsitter.objects.get(user=user)
        return PetsitterAvailability.objects.filter(petsitter=petsitter)

    def create(self, user, **kwargs):
        petsitter = Petsitter.objects.get(user=user)
        return PetsitterAvailability.objects.create(petsitter=petsitter, **kwargs)

    def get_by_id_for_user(self, pk, user):
        petsitter = Petsitter.objects.get(user=user)
        return PetsitterAvailability.objects.filter(petsitter=petsitter, id=pk).first()

    def delete(self, availability):
        availability.delete()
