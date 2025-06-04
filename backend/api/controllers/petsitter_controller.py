from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import PetsitterSerializer
from api.services.petsitter_service import PetsitterService

class PetsitterMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        petsitter = PetsitterService().get_petsitter_for_user(request.user)
        if not petsitter:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetsitterSerializer(petsitter)
        return Response(serializer.data)

    def patch(self, request):
        petsitter = PetsitterService().get_petsitter_for_user(request.user)
        if not petsitter:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetsitterSerializer(petsitter, data=request.data, partial=True)
        if serializer.is_valid():
            PetsitterService().update_petsitter(petsitter, **serializer.validated_data)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class PetsitterSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        city = request.query_params.get('city')
        pet_type = request.query_params.get('pet_type')
        care_type = request.query_params.get('care_type')
        date = request.query_params.get('date')
        petsitters = PetsitterService().search_petsitters(city, pet_type, care_type, date)
        serializer = PetsitterSerializer(petsitters, many=True)
        return Response(serializer.data)
    
class PetsitterCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PetsitterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                petsitter = PetsitterService().create_petsitter(
                    user=request.user,
                    **serializer.validated_data
                )
                return Response(PetsitterSerializer(petsitter).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)