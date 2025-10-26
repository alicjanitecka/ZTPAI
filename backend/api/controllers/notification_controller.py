from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import NotificationSerializer
from api.services.notification_service import NotificationService


class NotificationListView(APIView):
    """List all notifications for the authenticated user"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get all notifications for the authenticated user.",
        responses={
            200: NotificationSerializer(many=True),
            401: "Unauthorized",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        notifications = NotificationService().list_notifications_for_user(request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class NotificationUnreadCountView(APIView):
    """Get unread notification count for the authenticated user"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get unread notification count for the authenticated user.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'unread_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                }
            ),
            401: "Unauthorized",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        count = NotificationService().get_unread_count(request.user)
        return Response({"unread_count": count})


class NotificationMarkAsReadView(APIView):
    """Mark a notification as read"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Mark a specific notification as read.",
        responses={
            200: NotificationSerializer,
            401: "Unauthorized",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def patch(self, request, pk):
        notification = NotificationService().mark_as_read(pk, request.user)
        if not notification:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)


class NotificationMarkAllAsReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Mark all notifications as read for the authenticated user.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            ),
            401: "Unauthorized",
            500: "Internal Server Error",
        }
    )
    def post(self, request):
        NotificationService().mark_all_as_read(request.user)
        return Response({"message": "All notifications marked as read"})
