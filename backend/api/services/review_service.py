from api.repositories.review_repository import ReviewRepository
from api.repositories.visit_repository import VisitRepository
from datetime import date

class ReviewService:
    def __init__(self):
        self.repo = ReviewRepository()
        self.visit_repo = VisitRepository()

    def create_review(self, reviewer, visit_id, petsitter_id, rating, comment):
        # Validate visit exists
        visit = self.visit_repo.get_by_id(visit_id)
        if not visit:
            raise ValueError("Visit not found")

        # Validate user is the owner of the visit
        if visit.user != reviewer:
            raise PermissionError("You can only review visits you booked")

        # Validate visit is completed (end_date is in the past)
        if visit.end_date >= date.today():
            raise ValueError("You can only review completed visits")

        # Validate visit is confirmed and not canceled
        if visit.canceled:
            raise ValueError("Cannot review a canceled visit")

        if not visit.confirmed:
            raise ValueError("Cannot review an unconfirmed visit")

        # Check if review already exists
        existing_review = self.repo.get_by_visit(visit)
        if existing_review:
            raise ValueError("You have already reviewed this visit")

        # Create review
        return self.repo.create(
            reviewer=reviewer,
            visit=visit,
            petsitter_id=petsitter_id,
            rating=rating,
            comment=comment
        )

    def get_review(self, pk):
        return self.repo.get_by_id(pk)

    def list_reviews_for_petsitter(self, petsitter):
        return self.repo.list_for_petsitter(petsitter)

    def get_average_rating(self, petsitter):
        return self.repo.get_average_rating(petsitter)

    def get_reviews_count(self, petsitter):
        return self.repo.get_reviews_count(petsitter)

    def update_review(self, review, user, **kwargs):
        # Only reviewer can update their review
        if review.reviewer != user:
            raise PermissionError("You can only update your own reviews")
        return self.repo.update(review, **kwargs)

    def delete_review(self, review, user):
        # Only reviewer can delete their review
        if review.reviewer != user:
            raise PermissionError("You can only delete your own reviews")
        self.repo.delete(review)
