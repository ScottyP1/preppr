
from django.urls import re_path, path
#from django.conf.urls import url

from .views import ChatView


websocket_urlpatterns = [
    re_path(r"ws/chat/$", ChatView.as_asgi()),
    path("ws/chat/", ChatView.as_asgi()),
    # url(r"ws/chat/$", ChatView.as_asgi())
    
]