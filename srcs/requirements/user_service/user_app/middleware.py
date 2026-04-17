from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt

User = get_user_model()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("user") and scope["user"].is_authenticated:
            return await self.app(scope, receive, send)

        token = None
        headers = dict(scope['headers'])
        
        if b'cookie' in headers:
            cookies = headers[b'cookie'].decode().split('; ')
            for cookie in cookies:
                if cookie.startswith('access_token='):
                    token = cookie.split('=')[1]
                    break
                elif cookie.startswith('jwt='):
                    token = cookie.split('=')[1]
                    break

        if token:
            scope['user'] = await self.get_user(token)
        
        return await self.app(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload['user_id'])
            return user
        except:
            return AnonymousUser()