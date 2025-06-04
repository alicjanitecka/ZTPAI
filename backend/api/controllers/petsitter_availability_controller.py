from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import PetsitterAvailabilitySerializer
from api.services.petsitter_availability_service import PetsitterAvailabilityService

class PetsitterAvailabilityListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get a list of all availability slots for the authenticated petsitter.",
        responses={
            200: "OK",
            401: "Unauthorized",
            403: "Forbidden",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        availabilities = PetsitterAvailabilityService().list_for_user(request.user)
        serializer = PetsitterAvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Create a new availability slot for the authenticated petsitter.",
        request_body=PetsitterAvailabilitySerializer,
        responses={
            201: "Created",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            409: "Conflict",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
        }
    )
    def post(self, request):
        serializer = PetsitterAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            availability = PetsitterAvailabilityService().create_for_user(
                request.user, **serializer.validated_data
            )
            return Response(PetsitterAvailabilitySerializer(availability).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PetsitterAvailabilityUpdateDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Delete an availability slot by ID for the authenticated petsitter.",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="Availability ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            204: "No Content",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            409: "Conflict",
            500: "Internal Server Error",
        }
    )
    def delete(self, request, pk):
        availability = PetsitterAvailabilityService().get_for_user(pk, request.user)
        if not availability:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        PetsitterAvailabilityService().delete(availability)
        return Response(status=status.HTTP_204_NO_CONTENT)
