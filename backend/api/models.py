from django.db import models
from django.contrib.auth.models import User



# class User(models.Model):
#     username = models.CharField(max_length=150, unique=True)
#     password = models.CharField(max_length=128)

#     def __str__(self):
#         return self.username
    
    
# class Note(models.Model):
#     author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
#     title = models.CharField(max_length=255)
#     content = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)


#     def __str__(self):
#         return self.title
