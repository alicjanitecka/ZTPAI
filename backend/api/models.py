from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=100, blank=True)
    street = models.CharField(max_length=100, blank=True)
    house_number = models.CharField(max_length=10, blank=True)
    apartment_number = models.CharField(max_length=10, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    def __str__(self):
        return self.username
    class Meta:
        db_table = 'user'


class Petsitter(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='petsitter_profile',  db_index=True)
    description = models.TextField(blank=True)
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
    petsitter = models.ForeignKey(Petsitter, on_delete=models.CASCADE, related_name='availabilities',  db_index=True)
    date = models.DateField()
    is_available = models.BooleanField(default=True)   
    class Meta:
        db_table = 'petsitter_availability'

class Visit(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE)
    petsitter = models.ForeignKey('Petsitter', on_delete=models.CASCADE)
    care_type = models.CharField(max_length=50,  db_index=True)
    start_date = models.DateField()
    end_date = models.DateField()
    confirmed = models.BooleanField(default=False)
    canceled = models.BooleanField(default=False)
    pets = models.JSONField(default=list)  

    class Meta:
        db_table = 'visit'

    def __str__(self):
        return f"Visit: {self.user} with {self.petsitter} ({self.start_date} - {self.end_date})"
    
class Pet(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE)
    name = models.CharField(max_length=100,  db_index=True)
    age = models.DecimalField(max_digits=4, decimal_places=1)
    breed = models.CharField(max_length=100, blank=True)
    additional_info = models.TextField(blank=True)
    photo = models.ImageField(upload_to='pet_photos/', blank=True, null=True)
    pet_type = models.CharField(max_length=10)
    class Meta:
        db_table = 'pet'
    def __str__(self):
        return f"{self.name} ({self.pet_type})"

class Review(models.Model):
    visit = models.OneToOneField('Visit', on_delete=models.CASCADE, related_name='review', db_index=True)
    petsitter = models.ForeignKey('Petsitter', on_delete=models.CASCADE, related_name='reviews', db_index=True)
    reviewer = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='reviews_given')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'review'
        unique_together = ['visit', 'reviewer']  # One review per visit per reviewer
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.petsitter.user.username} - {self.rating} stars"