import socketio
from django.urls import re_path


from .views import ChatView

sio_app = socketio.ASGIApp(socketio.AsyncServer(async_mode="asgi"))

websocket_urlpatterns = [
    # Mount it on the default Socket.IO path:
    re_path(r"^socket\.io/", sio_app),
    # Other Channels consumers:
    re_path(r"ws/chat/$", ChatView.as_asgi()), 
]