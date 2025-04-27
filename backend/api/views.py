from api.models import CustomUser
from rest_framework import generics
from .serializers import UserCreateSerializer, UserListDetailSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import JsonResponse


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserCreateSerializer 
    permission_classes = [AllowAny]

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserListDetailSerializer 

class UserDetailView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserListDetailSerializer
    permission_classes = [IsAuthenticated]

def bad_request(request, exception=None):
    return JsonResponse({"error": 400, "message": "Bad Request"}, status=400)

def permission_denied(request, exception=None):
    return JsonResponse({"error": 403, "message": "Permission Denied"}, status=403)

def page_not_found(request, exception=None):
    return JsonResponse({"error": 404, "message": "Not Found"}, status=404)

def server_error(request):
    return JsonResponse({"error": 500, "message": "Internal Server Error"}, status=500)