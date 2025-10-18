from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.serializers import ChatSerializer, MessageSerializer
from api.services.chat_service import ChatService
from rest_framework.exceptions import PermissionDenied


class ChatListView(APIView):
    """List all chats for the authenticated user"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get all chats for the authenticated user.",
        responses={
            200: ChatSerializer(many=True),
            401: "Unauthorized",
            500: "Internal Server Error",
        }
    )
    def get(self, request):
        chats = ChatService().get_user_chats(request.user)
        serializer = ChatSerializer(chats, many=True, context={'request': request})
        return Response(serializer.data)


class ChatDetailView(APIView):
    """Get or create a chat with another user"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get details of a specific chat.",
        responses={
            200: ChatSerializer,
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def get(self, request, pk):
        try:
            chat = ChatService().get_chat(pk, request.user)
            serializer = ChatSerializer(chat, context={'request': request})
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as e:
            raise PermissionDenied(str(e))


class ChatCreateView(APIView):
    """Create or get a chat with another user"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create or get a chat with another user.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['other_user_id'],
            properties={
                'other_user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the other user')
            }
        ),
        responses={
            200: ChatSerializer,
            201: ChatSerializer,
            400: "Bad Request",
            401: "Unauthorized",
            500: "Internal Server Error",
        }
    )
    def post(self, request):
        other_user_id = request.data.get('other_user_id')
        if not other_user_id:
            return Response({"error": "other_user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            chat = ChatService().get_or_create_chat(request.user, other_user_id)
            serializer = ChatSerializer(chat, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChatMessagesView(APIView):
    """Get messages for a specific chat"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get messages for a specific chat.",
        manual_parameters=[
            openapi.Parameter('limit', openapi.IN_QUERY, description="Number of messages to retrieve (default: 50)", type=openapi.TYPE_INTEGER, required=False)
        ],
        responses={
            200: MessageSerializer(many=True),
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
        }
    )
    def get(self, request, pk):
        limit = int(request.query_params.get('limit', 50))
        try:
            messages = ChatService().get_chat_messages(pk, request.user, limit)
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as e:
            raise PermissionDenied(str(e))


class UnreadCountView(APIView):
    """Get total unread message count for the authenticated user"""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get total unread message count for the authenticated user.",
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
        count = ChatService().get_unread_count(request.user)
        return Response({"unread_count": count})
