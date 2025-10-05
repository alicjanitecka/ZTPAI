from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import PetSerializer
from api.services.pet_service import PetService

class PetListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get a list of all pets for the authenticated user.",
        responses={
            200: "OK",
            401: "Unauthorized",
            403: "Forbidden",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        pets = PetService().list_pets_for_user(request.user)
        serializer = PetSerializer(pets, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Create a new pet for the authenticated user.",
        request_body=PetSerializer,
        responses={
            201: "Created",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
        }
    )
    def post(self, request):
        serializer = PetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PetUpdateDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get details of a pet by ID for the authenticated user.",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="Pet ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: "OK",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def get(self, request, pk):
        pet = PetService().get_pet_for_user(pk, request.user)
        if not pet:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetSerializer(pet)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update details of a pet by ID (partial update).",
        request_body=PetSerializer,
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="Pet ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: "OK",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
        }
    )
    def patch(self, request, pk):
        pet = PetService().get_pet_for_user(pk, request.user)
        if not pet:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetSerializer(pet, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Delete a pet by ID for the authenticated user.",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="Pet ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            204: "No Content",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def delete(self, request, pk):
        pet = PetService().get_pet_for_user(pk, request.user)
        if not pet:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        PetService().delete_pet(pet)
        return Response(status=status.HTTP_204_NO_CONTENT)
