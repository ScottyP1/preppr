from django.shortcuts import render
import json
from channels.generic.websocket import WebsocketConsumer



class ChatView(WebsocketConsumer):
    def connect(self):
        self.accept()
        
    def disconnect(self, code):
        return super().disconnect(code)
    
    def receive(self, text_data=None, bytes_data=None):
        try:
            text_data_json =json.load(text_data) if (text_data != None)  else  None
            author = text_data_json["author"] # type:ignore object will have state or exception will be thrown
            message = text_data_json["message"] # type:ignore object will have state or exception will be thrown
            super().send(text_data=json.dumps({"mesage": message}))
            return super().receive(text_data, bytes_data)
        except Exception as e:
            pass