from api.models import Review
from django.db.models import Avg

class ReviewRepository:
    def create(self, reviewer, **kwargs):
        return Review.objects.create(reviewer=reviewer, **kwargs)

    def get_by_id(self, pk):
        return Review.objects.filter(id=pk).first()

    def get_by_visit(self, visit):
        return Review.objects.filter(visit=visit).first()

    def list_for_petsitter(self, petsitter):
        return Review.objects.filter(petsitter=petsitter).select_related('reviewer').order_by('-created_at')

    def get_average_rating(self, petsitter):
        result = Review.objects.filter(petsitter=petsitter).aggregate(Avg('rating'))
        return result['rating__avg'] or 0

    def get_reviews_count(self, petsitter):
        return Review.objects.filter(petsitter=petsitter).count()

    def update(self, review, **kwargs):
        for key, value in kwargs.items():
            setattr(review, key, value)
        review.save()
        return review

    def delete(self, review):
        review.delete()
