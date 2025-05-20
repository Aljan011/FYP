import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = self.room_name  

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        content = data.get('content')
        typing = data.get('typing')

        # Handle typing events
        if typing is not None:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_status',
                    'sender_id': sender_id,
                    'typing': typing
                }
            )
            return

        # Validate user and trainer relationship
        if not await self.is_valid_pair(sender_id, receiver_id):
            await self.send(text_data=json.dumps({'error': 'Only trainer-user messaging is allowed.'}))
            return

        # Save message to DB
        await self.save_message(sender_id, receiver_id, content)

        # Broadcast the message to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'content': content
            }
        )

    async def chat_message(self, event):
       await self.send(text_data=json.dumps({
        'type': 'chat_message',
        'sender_id': event['sender_id'],
        'receiver_id': event['receiver_id'],
        'content': event['content'],
        'timestamp': event.get('timestamp'),
        'message_type': event.get('message_type', 'text')  #  Add this line
}))

    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender_id': event['sender_id'],
            'typing': event['typing']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        # Import models here to avoid "Apps aren't loaded yet" error
        from django.contrib.auth.models import User
        from api.models import Message

        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        Message.objects.create(sender=sender, receiver=receiver, content=content)

    @database_sync_to_async
    def is_valid_pair(self, sender_id, receiver_id):
        # Import models here as well
        from api.models import UserProfile

        sender_role = UserProfile.objects.get(user__id=sender_id).role
        receiver_role = UserProfile.objects.get(user__id=receiver_id).role
        return sender_role != receiver_role
