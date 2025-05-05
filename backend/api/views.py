from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import UserCreateSerializer, UserListDetailSerializer
from api.services.user_service import UserService

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
