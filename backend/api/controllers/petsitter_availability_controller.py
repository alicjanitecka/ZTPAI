from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import PetsitterAvailabilitySerializer
from api.services.petsitter_availability_service import PetsitterAvailabilityService

class PetsitterAvailabilityListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        availabilities = PetsitterAvailabilityService().list_for_user(request.user)
        serializer = PetsitterAvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

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

    def delete(self, request, pk):
        availability = PetsitterAvailabilityService().get_for_user(pk, request.user)
        if not availability:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        PetsitterAvailabilityService().delete(availability)
        return Response(status=status.HTTP_204_NO_CONTENT)
