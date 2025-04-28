from api.models import CustomUser

class UserRepository:
    def get_by_email(self, email):
        return CustomUser.objects.filter(email=email).first()

    def create(self, username, email, password):
        return CustomUser.objects.create(username=username, email=email, password=password)
    
    def get_all(self):
        return CustomUser.objects.all()

    def get_by_id(self, user_id):
        return CustomUser.objects.filter(id=user_id).first()

    def email_exists(self, email):
        return CustomUser.objects.filter(email=email).exists()