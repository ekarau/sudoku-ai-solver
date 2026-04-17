# user_app/routing.py
from django.urls import path
from user_app import consumers

websocket_urlpatterns = [
    path('ws/presence/', consumers.PresenceConsumer.as_asgi()),
]