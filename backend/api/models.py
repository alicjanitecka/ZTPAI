from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=100, blank=True)
    street = models.CharField(max_length=100, blank=True)
    house_number = models.CharField(max_length=10, blank=True)
    apartment_number = models.CharField(max_length=10, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username
    class Meta:
        db_table = 'user'