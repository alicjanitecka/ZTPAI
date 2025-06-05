from api.repositories.user_repository import UserRepository
from django.contrib.auth.hashers import make_password

class UserService:
    def __init__(self):
        self.repo = UserRepository()

    def list_users(self):
        return self.repo.get_all()

    def get_user(self, user_id):
        return self.repo.get_by_id(user_id)

    def create_user(self, username, email, password):
        if self.repo.email_exists(email):
            raise ValueError("Email already exists")
        user = self.repo.create(username, email, make_password(password))
        return user

    def delete_user(self, user):
        self.repo.delete(user)

    def update_user(self, user, **kwargs):
        return self.repo.update(user, **kwargs)
