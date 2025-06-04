from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import UserCreateSerializer, UserListDetailSerializer, UserProfileSerializer
from api.services.user_service import UserService

class CreateUserView(APIView):
    """
    Register a new user.
    """
    permission_classes = [permissions.AllowAny]
    @swagger_auto_schema(
        operation_description="Register a new user account.",
        request_body=UserCreateSerializer,
        responses={
            201: "Created",
            400: "Bad Request",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
        }
    )
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
    """
    List all users (admin only).
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get a list of all users (admin only).",
        responses={
            200: "OK",
            401: "Unauthorized",
            403: "Forbidden",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        users = UserService().list_users()
        serializer = UserListDetailSerializer(users, many=True)
        return Response(serializer.data)

class UserDetailView(APIView):
    """
    Retrieve user details by ID.
    """
    permission_classes = [permissions.IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Get details of a user by user ID.",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="User ID", type=openapi.TYPE_INTEGER)
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
        user = UserService().get_user(pk)
        if user:
            serializer = UserListDetailSerializer(user)
            return Response(serializer.data)
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class UserDeleteView(APIView):
    """
    Delete a user (admin only).
    """
    permission_classes = [permissions.IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Delete a user by ID (admin only).",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="User ID", type=openapi.TYPE_INTEGER)
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
        user = UserService().get_user(pk)
        if not user:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin':
            return Response({"error": "Brak uprawnień"}, status=status.HTTP_403_FORBIDDEN)
        UserService().delete_user(user)
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserProfileView(APIView):
    """
    Retrieve or update the authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get the profile of the currently authenticated user.",
        responses={
            200: "OK",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update the profile of the currently authenticated user (partial update).",
        request_body=UserProfileSerializer,
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
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            UserService().update_user(request.user, **serializer.validated_data)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
