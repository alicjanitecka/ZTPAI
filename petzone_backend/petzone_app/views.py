from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import LoginSerializer

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Zalogowano pomyślnie!"}, status=200)
        return Response(serializer.errors, status=400)
