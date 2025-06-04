from api.repositories.petsitter_availability_repository import PetsitterAvailabilityRepository

class PetsitterAvailabilityService:
    def __init__(self):
        self.repo = PetsitterAvailabilityRepository()

    def list_for_user(self, user):
        return self.repo.get_all_for_user(user)

    def create_for_user(self, user, **kwargs):
        return self.repo.create(user, **kwargs)

    def get_for_user(self, pk, user):
        return self.repo.get_by_id_for_user(pk, user)

    def delete(self, availability):
        self.repo.delete(availability)
