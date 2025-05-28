from django.db.models import Q
from api.models import Petsitter, PetsitterAvailability

class PetsitterRepository:
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

        # if date:
        #     qs = qs.filter(availabilities__date=date, availabilities__is_available=True)

        return qs.distinct()
