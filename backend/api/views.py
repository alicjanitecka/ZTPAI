# from django.shortcuts import render
# from django.contrib.auth.models import User
# from rest_framework import generics
# from .serializers import UserSerializer # NoteSerializer
# from rest_framework.permissions import AllowAny, IsAuthenticated
# #from .models import Note


# class CreateUserView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [AllowAny]

# class UserListView(generics.ListAPIView):
#     # queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]
#     def get_queryset(self):
#            return User.objects.all()

# class UserDetailView(generics.RetrieveAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]

    
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserCreateSerializer, UserListDetailSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer 
    permission_classes = [AllowAny]

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListDetailSerializer 

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserListDetailSerializer
    permission_classes = [IsAuthenticated]