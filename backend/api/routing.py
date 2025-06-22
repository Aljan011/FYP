from django.urls import re_path
from django.urls import path
from . import consumers
from api.consumers import  WorkoutPostConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    path("ws/workout_feed/", WorkoutPostConsumer.as_asgi()),
]
