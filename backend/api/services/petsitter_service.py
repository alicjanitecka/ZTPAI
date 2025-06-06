from api.repositories.petsitter_repository import PetsitterRepository

class PetsitterService:
    def __init__(self):
        self.repo = PetsitterRepository()

    def get_petsitter_for_user(self, user):
        return self.repo.get_by_user(user)

    def create_petsitter(self, user, **kwargs):
        if self.repo.get_by_user(user):
            raise ValueError("User is already a petsitter")
        return self.repo.create(user, **kwargs)

    def update_petsitter(self, petsitter, **kwargs):
        return self.repo.update(petsitter, **kwargs)

    def delete_petsitter(self, petsitter):
        self.repo.delete(petsitter)
    def search_petsitters(self, city=None, pet_type=None, care_type=None, date=None):
        return self.repo.search(city=city, pet_type=pet_type, care_type=care_type, date=date)