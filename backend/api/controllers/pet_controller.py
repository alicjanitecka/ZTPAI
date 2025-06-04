from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import PetSerializer
from api.services.pet_service import PetService

class PetListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pets = PetService().list_pets_for_user(request.user)
        serializer = PetSerializer(pets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PetSerializer(data=request.data)
        if serializer.is_valid():
            pet = PetService().create_pet(request.user, **serializer.validated_data)
            return Response(PetSerializer(pet).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PetUpdateDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        pet = PetService().get_pet_for_user(pk, request.user)
        if not pet:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetSerializer(pet)
        return Response(serializer.data)

    def patch(self, request, pk):
        pet = PetService().get_pet_for_user(pk, request.user)
        if not pet:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetSerializer(pet, data=request.data, partial=True)
        if serializer.is_valid():
            PetService().update_pet(pet, **serializer.validated_data)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        pet = PetService().get_pet_for_user(pk, request.user)
        if not pet:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        PetService().delete_pet(pet)
        return Response(status=status.HTTP_204_NO_CONTENT)

