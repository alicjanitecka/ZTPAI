from api.repositories.visit_repository import VisitRepository



class VisitService:
    def __init__(self):
        self.repo = VisitRepository()

    def create_visit(self, user, **kwargs):
        return self.repo.create(user, **kwargs)

    def list_visits_for_user(self, user):
        return self.repo.list_all_related(user)

    def get_visit(self, pk):
        return self.repo.get_by_id(pk)

    def update_visit(self, visit, user, **kwargs):
        if visit.user != user and visit.petsitter.user != user:
            raise PermissionError("Nie masz uprawnień do modyfikacji tej wizyty.")
        return self.repo.update(visit, **kwargs)
