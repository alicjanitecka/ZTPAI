from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=100, blank=True, null=True) 
    last_name = models.CharField(max_length=100, blank=True, null=True) 
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    street = models.CharField(max_length=100, blank=True, null=True)
    house_number = models.CharField(max_length=20, blank=True, null=True)
    apartment_number = models.CharField(max_length=20, blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    class Meta:
        db_table = 'user'


class Pet(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField(null=True, blank=True)
    breed = models.CharField(max_length=100, null=True, blank=True)
    additional_info = models.TextField(null=True, blank=True)
    photo_url = models.CharField(max_length=255, null=True, blank=True)
    pet_type = models.CharField(max_length=10)

    class Meta:
        db_table = 'pet'


class Petsitter(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    description = models.TextField(null=True, blank=True)
    is_dog_sitter = models.BooleanField(default=False)
    is_cat_sitter = models.BooleanField(default=False)
    is_rodent_sitter = models.BooleanField(default=False)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    care_at_owner_home = models.BooleanField(default=False)
    care_at_petsitter_home = models.BooleanField(default=False)
    dog_walking = models.BooleanField(default=False)

    class Meta:
        db_table = 'petsitter'


class PetsitterAvailability(models.Model):
    petsitter = models.ForeignKey(Petsitter, on_delete=models.CASCADE)
    date = models.DateField()
    is_available = models.BooleanField()

    class Meta:
        db_table = 'petsitter_availability'


class Visit(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    petsitter = models.ForeignKey(Petsitter, on_delete=models.CASCADE)
    care_type = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    confirmed = models.BooleanField(default=False)
    canceled = models.BooleanField(default=False)
    pets = models.JSONField() 

    class Meta:
        db_table = 'visit'
