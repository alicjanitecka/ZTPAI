from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from api.serializers import ReviewSerializer
from api.services.review_service import ReviewService
from rest_framework.exceptions import PermissionDenied

class ReviewCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a new review for a completed visit.",
        request_body=ReviewSerializer,
        responses={
            201: ReviewSerializer,
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            500: "Internal Server Error",
        }
    )
    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            try:
                review = ReviewService().create_review(
                    reviewer=request.user,
                    visit_id=serializer.validated_data['visit'].id,
                    petsitter_id=serializer.validated_data['petsitter'].id,
                    rating=serializer.validated_data['rating'],
                    comment=serializer.validated_data.get('comment', '')
                )
                return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
            except (ValueError, PermissionError) as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewListForPetsitterView(generics.ListAPIView):
    """Get all reviews for a specific petsitter"""
    permission_classes = [permissions.AllowAny]
    serializer_class = ReviewSerializer

    @swagger_auto_schema(
        operation_description="Get all reviews for a specific petsitter.",
        manual_parameters=[
            openapi.Parameter('petsitter_id', openapi.IN_QUERY, description="Petsitter ID", type=openapi.TYPE_INTEGER, required=True)
        ],
        responses={
            200: ReviewSerializer(many=True),
            400: "Bad Request",
            500: "Internal Server Error",
        }
    )
    def get_queryset(self):
        petsitter_id = self.request.query_params.get('petsitter_id')
        if not petsitter_id:
            return []
        from api.models import Petsitter
        petsitter = Petsitter.objects.filter(id=petsitter_id).first()
        if not petsitter:
            return []
        return ReviewService().list_reviews_for_petsitter(petsitter)

class ReviewDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Update a review.",
        request_body=ReviewSerializer,
        responses={
            200: ReviewSerializer,
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def patch(self, request, pk):
        review = ReviewService().get_review(pk)
        if not review:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                updated_review = ReviewService().update_review(
                    review, request.user, **serializer.validated_data
                )
                return Response(ReviewSerializer(updated_review).data)
            except PermissionError as e:
                raise PermissionDenied(str(e))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Delete a review.",
        responses={
            204: "No Content",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def delete(self, request, pk):
        review = ReviewService().get_review(pk)
        if not review:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            ReviewService().delete_review(review, request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PermissionError as e:
            raise PermissionDenied(str(e))
