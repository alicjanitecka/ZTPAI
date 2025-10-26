from api.repositories.visit_repository import VisitRepository
from api.services.notification_service import NotificationService
from api.services.email_service import EmailService


class VisitService:
    def __init__(self):
        self.repo = VisitRepository()

    def create_visit(self, user, **kwargs):
        visit = self.repo.create(user, **kwargs)

        # Send notifications
        NotificationService().create_visit_notification(visit)

        # Send emails
        EmailService.send_visit_created_email(visit)

        return visit

    def list_visits_for_user(self, user):
        return self.repo.list_all_related(user)

    def get_visit(self, pk):
        return self.repo.get_by_id(pk)

    def update_visit(self, visit, user, **kwargs):
        if visit.user != user and visit.petsitter.user != user:
            raise PermissionError("Nie masz uprawnień do modyfikacji tej wizyty.")
        return self.repo.update(visit, **kwargs)
