from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import VisitSerializer
from api.services.visit_service import VisitService
from rest_framework.exceptions import PermissionDenied

class VisitCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VisitSerializer(data=request.data)
        if serializer.is_valid():
            visit = VisitService().create_visit(request.user, **serializer.validated_data)
            return Response(VisitSerializer(visit).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VisitListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        visits = VisitService().list_visits_for_user(request.user)
        serializer = VisitSerializer(visits, many=True)
        return Response(serializer.data)

class VisitUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
