from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status, permissions
from api.serializers import UserCreateSerializer, UserListDetailSerializer, PetsitterSerializer, VisitSerializer, UserProfileSerializer, PetSerializer
from api.models import Visit, Petsitter, CustomUser, Pet
from api.repositories.petsitter_repository import PetsitterRepository
from api.services.user_service import UserService
from django.db import models

class CreateUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                user = UserService().create_user(
                    username=data['username'],
                    email=data['email'],
                    password=data['password']
                )
                return Response(UserListDetailSerializer(user).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = UserService().list_users()
        serializer = UserListDetailSerializer(users, many=True)
        return Response(serializer.data)

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = UserService().get_user(pk)
        if user:
            serializer = UserListDetailSerializer(user)
            return Response(serializer.data)
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class UserDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        user = UserService().get_user(pk)
        if not user:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin':
            return Response({"error": "Brak uprawnień"}, status=status.HTTP_403_FORBIDDEN)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class PetsitterSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        city = request.query_params.get('city')
        pet_type = request.query_params.get('pet_type')
        care_type = request.query_params.get('care_type')
        date = request.query_params.get('date')
        petsitters = PetsitterRepository().search(city, pet_type, care_type, date)
        serializer = PetsitterSerializer(petsitters, many=True)
        return Response(serializer.data)

class VisitCreateView(generics.CreateAPIView):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class VisitListView(generics.ListAPIView):
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Visit.objects.filter(
            models.Q(user=user) | models.Q(petsitter__user=user)
        ).order_by('-start_date')
    
class VisitUpdateView(generics.UpdateAPIView):
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Visit.objects.all()
    def perform_update(self, serializer):
        visit = self.get_object()
        user = self.request.user
        # Pozwól tylko właścicielowi lub petsitterowi na zmianę
        if visit.user != user and visit.petsitter.user != user:
            raise PermissionDenied("Nie masz uprawnień do modyfikacji tej wizyty.")
        serializer.save()    

class PetsitterCreateView(generics.CreateAPIView):
    serializer_class = PetsitterSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Petsitter.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class PetListCreateView(generics.ListCreateAPIView):
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Pet.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PetUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Pet.objects.filter(user=self.request.user)