from api.models import Chat, Message
from django.db.models import Q, Max


class ChatRepository:
    def get_or_create_chat(self, user1, user2):
        """Get or create a chat between two users"""
        # Ensure consistent ordering to avoid duplicate chats
        if user1.id > user2.id:
            user1, user2 = user2, user1

        chat, created = Chat.objects.get_or_create(
            participant1=user1,
            participant2=user2
        )
        return chat

    def get_chat_by_id(self, chat_id):
        return Chat.objects.filter(id=chat_id).select_related(
            'participant1', 'participant2'
        ).first()

    def get_user_chats(self, user):
        """Get all chats for a user"""
        return Chat.objects.filter(
            Q(participant1=user) | Q(participant2=user)
        ).select_related('participant1', 'participant2').annotate(
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time')

    def get_chat_between_users(self, user1, user2):
        """Get existing chat between two users"""
        return Chat.objects.filter(
            (Q(participant1=user1) & Q(participant2=user2)) |
            (Q(participant1=user2) & Q(participant2=user1))
        ).select_related('participant1', 'participant2').first()


class MessageRepository:
    def create_message(self, chat, sender, content):
        """Create a new message"""
        message = Message.objects.create(
            chat=chat,
            sender=sender,
            content=content
        )
        # Update chat timestamp
        chat.save()
        return message

    def get_chat_messages(self, chat, limit=50):
        """Get messages for a chat with limit"""
        return Message.objects.filter(chat=chat).select_related(
            'sender'
        ).order_by('-created_at')[:limit]

    def mark_messages_as_read(self, chat, user):
        """Mark all messages in a chat as read for the given user"""
        Message.objects.filter(
            chat=chat,
            is_read=False
        ).exclude(sender=user).update(is_read=True)

    def get_unread_count(self, user):
        """Get count of unread messages for a user"""
        return Message.objects.filter(
            Q(chat__participant1=user) | Q(chat__participant2=user),
            is_read=False
        ).exclude(sender=user).count()
