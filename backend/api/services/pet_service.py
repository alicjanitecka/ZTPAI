from api.repositories.pet_repository import PetRepository

class PetService:
    def __init__(self):
        self.repo = PetRepository()

    def list_pets_for_user(self, user):
        return self.repo.get_all_for_user(user)

    def create_pet(self, user, **kwargs):
        return self.repo.create(user, **kwargs)
    def get_pet(self, pet_id):
        return self.repo.get_by_id(pet_id)
    def update_pet(self, pet, **kwargs):
        return self.repo.update(pet, **kwargs)
    def delete_pet(self, pet):
        self.repo.delete(pet)

    
