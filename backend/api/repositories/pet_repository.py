from api.models import Pet

class PetRepository:
    def get_all_for_user(self, user):
        return Pet.objects.filter(user=user)

    def create(self, user, **kwargs):
        return Pet.objects.create(user=user, **kwargs)

    def get_by_id(self, pet_id):
        try:
            return Pet.objects.get(id=pet_id)
        except Pet.DoesNotExist:
            return None

    def get_for_user(self, pet_id, user):
        try:
            return Pet.objects.get(id=pet_id, user=user)
        except Pet.DoesNotExist:
            return None

    def update(self, pet, **kwargs):
        for key, value in kwargs.items():
            setattr(pet, key, value)
        pet.save()
        return pet

    def delete(self, pet):
        pet.delete()
