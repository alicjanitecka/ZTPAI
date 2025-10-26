from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import PetsitterSerializer
from api.services.petsitter_service import PetsitterService

class PetsitterDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Get petsitter details by ID.",
        responses={
            200: PetsitterSerializer,
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def get(self, request, pk):
        petsitter = PetsitterService().get_petsitter_by_id(pk)
        if not petsitter:
            return Response({"error": "Petsitter not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetsitterSerializer(petsitter)
        return Response(serializer.data)

class PetsitterMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get the petsitter profile for the authenticated user.",
        responses={
            200: "OK",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        petsitter = PetsitterService().get_petsitter_for_user(request.user)
        if not petsitter:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PetsitterSerializer(petsitter)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update the petsitter profile for the authenticated user (partial update).",
        request_body=PetsitterSerializer,
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

    @swagger_auto_schema(
        operation_description="Search for petsitters by city, pet type, care type, date range, and minimum rating.",
        manual_parameters=[
            openapi.Parameter('city', openapi.IN_QUERY, description="City", type=openapi.TYPE_STRING),
            openapi.Parameter('pet_type', openapi.IN_QUERY, description="Pet type", type=openapi.TYPE_STRING),
            openapi.Parameter('care_type', openapi.IN_QUERY, description="Care type", type=openapi.TYPE_STRING),
            openapi.Parameter('start_date', openapi.IN_QUERY, description="Start date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
            openapi.Parameter('end_date', openapi.IN_QUERY, description="End date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
            openapi.Parameter('min_rating', openapi.IN_QUERY, description="Minimum rating (1-5)", type=openapi.TYPE_NUMBER),
        ],
        responses={
            200: "OK",
            400: "Bad Request",
            404: "Not Found",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        city = request.query_params.get('city')
        pet_type = request.query_params.get('pet_type')
        care_type = request.query_params.get('care_type')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        min_rating = request.query_params.get('min_rating')
        petsitters = PetsitterService().search_petsitters(city, pet_type, care_type, start_date, end_date, min_rating)
        serializer = PetsitterSerializer(petsitters, many=True)
        return Response(serializer.data)
    
class PetsitterCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Register the authenticated user as a petsitter.",
        request_body=PetsitterSerializer,
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
