from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from rest_framework import status
from .serializers import LoginSerializer
# from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import json 
User = get_user_model()


# class LoginView(APIView):
#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.validated_data.get('user')
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 'message': 'Zalogowano pomyślnie!'
#             }, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        print("### OTRZYMANE DANE ###")
        print(json.dumps(request.data, indent=4))
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data.get('user')
            if user is not None:
                login(request, user)
                return Response({"message": "Zalogowano pomyślnie!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Nieprawidłowe dane uwierzytelniające"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request):
        return Response({"message": "Strona logowania"}, status=status.HTTP_200_OK)