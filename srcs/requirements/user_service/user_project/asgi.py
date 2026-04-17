import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_project.settings')

# Initialize Django ASGI application early, looks into Django settings module
django_asgi_app = get_asgi_application()

# Import routing and middleware AFTER get_asgi_application()
from user_app.middleware import JWTAuthMiddleware
import user_app.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        JWTAuthMiddleware(
            URLRouter(
                user_app.routing.websocket_urlpatterns
            )
        )
    ),
})