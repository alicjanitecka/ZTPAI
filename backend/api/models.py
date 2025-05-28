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


class Petsitter(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='petsitter_profile')
    description = models.TextField(blank=True)
    is_dog_sitter = models.BooleanField(default=False)
    is_cat_sitter = models.BooleanField(default=False)
    is_rodent_sitter = models.BooleanField(default=False)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    care_at_owner_home = models.BooleanField(default=False)
    care_at_petsitter_home = models.BooleanField(default=False)
    dog_walking = models.BooleanField(default=False)

class PetsitterAvailability(models.Model):
    petsitter = models.ForeignKey(Petsitter, on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField()
    is_available = models.BooleanField(default=True)   