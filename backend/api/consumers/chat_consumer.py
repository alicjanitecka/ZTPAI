import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from api.services.chat_service import ChatService
from api.serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        # Verify user is participant in this chat
        try:
            await self.verify_chat_participant()
        except Exception as e:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Mark messages as read when user connects
        await self.mark_messages_read()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')

            if message_type == 'message':
                content = data.get('content', '')

                # Save message to database
                message = await self.save_message(content)

                # Serialize message
                message_data = await self.serialize_message(message)

                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message_data
                    }
                )

            elif message_type == 'mark_read':
                await self.mark_messages_read()
                await self.send(text_data=json.dumps({
                    'type': 'read_confirmation',
                    'status': 'success'
                }))

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))

    @database_sync_to_async
    def verify_chat_participant(self):
        service = ChatService()
        return service.get_chat(self.chat_id, self.user)

    @database_sync_to_async
    def save_message(self, content):
        service = ChatService()
        return service.send_message(self.chat_id, self.user, content)

    @database_sync_to_async
    def serialize_message(self, message):
        serializer = MessageSerializer(message)
        return serializer.data

    @database_sync_to_async
    def mark_messages_read(self):
        service = ChatService()
        service.mark_as_read(self.chat_id, self.user)
