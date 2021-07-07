import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import *


class ChatRoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
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
        recieve_dict = json.loads(text_data)
        recieve_dict['message']['receiver_channel_name'] = self.channel_name
        action = recieve_dict['action']

        if(action == 'new-offer') or (action == 'new-answer'):
            receiver_channel_name = recieve_dict['message']['receiver_channel_name']
            recieve_dict['message']['receiver_channel_name'] = self.channel_name

            await self.channel_layer.send(
                receiver_channel_name,
                {
                    'type': 'send_sdp',
                    'receive_dict' : recieve_dict,
                }
            )

            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_sdp',
                'receive_dict' : recieve_dict,
            }
        )

    async def send_sdp(self, event):
        receive_dict = event['receive_dict']

        await self.send(text_data=json.dumps(receive_dict))

    pass
