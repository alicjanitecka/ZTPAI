from api.models import CustomUser
from rest_framework import generics
from .serializers import UserCreateSerializer, UserListDetailSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserCreateSerializer 
    permission_classes = [AllowAny]

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserListDetailSerializer 

class UserDetailView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserListDetailSerializer
    permission_classes = [IsAuthenticated]