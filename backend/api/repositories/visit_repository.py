from api.models import Visit
from django.db import models

class VisitRepository:
    def create(self, user, **kwargs):
        return Visit.objects.create(user=user, **kwargs)

    def list_for_user(self, user):
        return Visit.objects.filter(
            user=user
        ).order_by('-start_date')

    def list_for_petsitter(self, user):
        return Visit.objects.filter(
            petsitter__user=user
        ).order_by('-start_date')

    def list_all_related(self, user):
        return Visit.objects.filter(
            models.Q(user=user) | models.Q(petsitter__user=user)
        ).order_by('-start_date')

    def get_by_id(self, pk):
        return Visit.objects.filter(id=pk).first()

    def update(self, visit, **kwargs):
        for key, value in kwargs.items():
            setattr(visit, key, value)
        visit.save()
        return visit
