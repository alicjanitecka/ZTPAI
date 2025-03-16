from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        print("Dane otrzymane od frontendu:", request.data)  # Debugowanie
        username = request.data.get('username')
        # password = request.data.get('password')

        # if not username or not password:
        #     return Response({"error": "Brak nazwy użytkownika lub hasła"}, status=400)

        return Response({"message": f"Zalogowano pomyślnie! Użytkownik: {username}"}, status=200)
