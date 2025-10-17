from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import VisitSerializer
from api.services.visit_service import VisitService
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics


class VisitCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a new visit.",
        request_body=VisitSerializer,
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
        serializer = VisitSerializer(data=request.data)
        if serializer.is_valid():
            visit = VisitService().create_visit(request.user, **serializer.validated_data)
            return Response(VisitSerializer(visit).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VisitListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VisitSerializer
    @swagger_auto_schema(
        operation_description="Get a list of visits for the authenticated user.",
        responses={
            200: "OK",
            401: "Unauthorized",
            403: "Forbidden",
            500: "Internal Server Error",
        }
    )
    def get_queryset(self):
        return VisitService().list_visits_for_user(self.request.user)

class VisitAsOwnerView(generics.ListAPIView):
    """Visits where user is the pet owner"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VisitSerializer

    @swagger_auto_schema(
        operation_description="Get visits where the user is the pet owner.",
        responses={
            200: "OK",
            401: "Unauthorized",
            500: "Internal Server Error",
        }
    )
    def get_queryset(self):
        from api.repositories.visit_repository import VisitRepository
        return VisitRepository().list_for_user(self.request.user)

class VisitAsPetsitterView(generics.ListAPIView):
    """Visits where user is the petsitter"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VisitSerializer

    @swagger_auto_schema(
        operation_description="Get visits where the user is the petsitter.",
        responses={
            200: "OK",
            401: "Unauthorized",
            500: "Internal Server Error",
        }
    )
    def get_queryset(self):
        from api.repositories.visit_repository import VisitRepository
        return VisitRepository().list_for_petsitter(self.request.user)

class VisitUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Update a visit partially by ID.",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="Visit ID", type=openapi.TYPE_INTEGER)
        ],
        request_body=VisitSerializer,
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
        visit = VisitService().get_visit(pk)
        if not visit:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = VisitSerializer(visit, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                VisitService().update_visit(visit, request.user, **serializer.validated_data)
                return Response(serializer.data)
            except PermissionError as e:
                raise PermissionDenied(str(e))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
