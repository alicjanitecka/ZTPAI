from api.repositories.chat_repository import ChatRepository, MessageRepository
from api.repositories.user_repository import UserRepository


class ChatService:
    def __init__(self):
        self.chat_repo = ChatRepository()
        self.message_repo = MessageRepository()
        self.user_repo = UserRepository()

    def get_or_create_chat(self, current_user, other_user_id):
        """Get or create a chat between current user and another user"""
        other_user = self.user_repo.get_by_id(other_user_id)
        if not other_user:
            raise ValueError("User not found")

        # Don't allow chatting with yourself
        if current_user.id == other_user.id:
            raise ValueError("Cannot chat with yourself")

        return self.chat_repo.get_or_create_chat(current_user, other_user)

    def get_user_chats(self, user):
        """Get all chats for a user"""
        return self.chat_repo.get_user_chats(user)

    def get_chat(self, chat_id, user):
        """Get a specific chat if user is a participant"""
        chat = self.chat_repo.get_chat_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")

        # Verify user is a participant
        if chat.participant1 != user and chat.participant2 != user:
            raise PermissionError("You are not a participant in this chat")

        return chat

    def send_message(self, chat_id, sender, content):
        """Send a message in a chat"""
        if not content or not content.strip():
            raise ValueError("Message content cannot be empty")

        chat = self.chat_repo.get_chat_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")

        # Verify sender is a participant
        if chat.participant1 != sender and chat.participant2 != sender:
            raise PermissionError("You are not a participant in this chat")

        return self.message_repo.create_message(chat, sender, content.strip())

    def get_chat_messages(self, chat_id, user, limit=50):
        """Get messages for a chat"""
        chat = self.get_chat(chat_id, user)
        messages = self.message_repo.get_chat_messages(chat, limit)

        # Mark messages as read
        self.message_repo.mark_messages_as_read(chat, user)

        return list(reversed(messages))

    def mark_as_read(self, chat_id, user):
        """Mark all messages in a chat as read"""
        chat = self.get_chat(chat_id, user)
        self.message_repo.mark_messages_as_read(chat, user)

    def get_unread_count(self, user):
        """Get total unread message count for user"""
        return self.message_repo.get_unread_count(user)
