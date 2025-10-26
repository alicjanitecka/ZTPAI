from django.db.models import Q, Avg, Count
from api.models import Petsitter, PetsitterAvailability
from datetime import datetime, timedelta

class PetsitterRepository:
    def get_by_user(self, user):
        return Petsitter.objects.filter(user=user).first()

    def get_by_id(self, petsitter_id):
        return Petsitter.objects.select_related('user').filter(id=petsitter_id).first()

    def create(self, user, **kwargs):
        return Petsitter.objects.create(user=user, **kwargs)

    def update(self, petsitter, **kwargs):
        for key, value in kwargs.items():
            setattr(petsitter, key, value)
        petsitter.save()
        return petsitter

    def delete(self, petsitter):
        petsitter.delete()
    def search(self, city=None, pet_type=None, care_type=None, start_date=None, end_date=None, min_rating=None):
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

        if min_rating:
            qs = qs.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=float(min_rating))

        # Filter by availability for date range
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                end = datetime.strptime(end_date, '%Y-%m-%d').date()

                # Generate list of all dates in range
                delta = end - start
                required_dates = [start + timedelta(days=i) for i in range(delta.days + 1)]

                # Filter petsitters who have availability for ALL required dates
                petsitter_ids = []
                for petsitter in qs:
                    available_dates = set(
                        PetsitterAvailability.objects.filter(
                            petsitter=petsitter,
                            is_available=True
                        ).values_list('date', flat=True)
                    )

                    # Check if all required dates are in available dates
                    if all(date in available_dates for date in required_dates):
                        petsitter_ids.append(petsitter.id)

                qs = qs.filter(id__in=petsitter_ids)
            except (ValueError, TypeError):
                pass  # Invalid date format, ignore filtering

        return qs.distinct()
