from django.shortcuts import render
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer



class ChatView(WebsocketConsumer):
    
    def connect(self): 
        self.room_name = "broadcast"
        
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        print(self.channel_name)
        self.accept()
        
    def disconnect(self, code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )
        return super().disconnect(code)
    
    def receive(self, text_data=None, bytes_data=None):
        try:
            text_data_json = json.loads(text_data) if (text_data != None)  else  None

            author = text_data_json["author"] # type:ignore object will have state or exception will be thrown
            message = text_data_json["message"] # type:ignore object will have state or exception will be thrown
            # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "chat.message", "author": author, "message": message}
            )
        except Exception as e:
            print(e)

    def chat_message(self, event):
        # event == {"type":"chat.message","author":..,"message":..}
        self.send(text_data=json.dumps({
            "author": event["author"],
            "message": event["message"],
        }))


