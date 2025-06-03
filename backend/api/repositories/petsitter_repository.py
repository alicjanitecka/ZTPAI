from django.db.models import Q
from api.models import Petsitter, PetsitterAvailability

class PetsitterRepository:
    def get_by_user(self, user):
        return Petsitter.objects.filter(user=user).first()

    def create(self, user, **kwargs):
        return Petsitter.objects.create(user=user, **kwargs)

    def update(self, petsitter, **kwargs):
        for key, value in kwargs.items():
            setattr(petsitter, key, value)
        petsitter.save()
        return petsitter

    def delete(self, petsitter):
        petsitter.delete()
    def search(self, city=None, pet_type=None, care_type=None, date=None):
        qs = Petsitter.objects.select_related('user').all()

        if city:
            qs = qs.filter(user__city__icontains=city)

        if pet_type == 'dog':
            qs = qs.filter(is_dog_sitter=True)
        elif pet_type == 'cat':
            qs = qs.filter(is_cat_sitter=True)
        elif pet_type == 'rodent':
            qs = qs.filter(is_rodent_sitter=True)

        if care_type == 'dog_walking':
            qs = qs.filter(dog_walking=True)
        elif care_type == 'care_at_owner_home':
            qs = qs.filter(care_at_owner_home=True)
        elif care_type == 'care_at_petsitter_home':
            qs = qs.filter(care_at_petsitter_home=True)


        return qs.distinct()
