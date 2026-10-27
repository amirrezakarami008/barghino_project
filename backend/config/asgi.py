"""
ASGI entrypoint.

When ``USE_WEBSOCKETS`` is True, HTTP and WebSocket are routed together.
Otherwise this is a plain Django ASGI app (HTTP only).
"""

import os

from django.conf import settings
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

# Initialise Django before importing Channels routing / consumers.
django_asgi_app = get_asgi_application()

if getattr(settings, "USE_WEBSOCKETS", False):
    from channels.routing import ProtocolTypeRouter, URLRouter

    from apps.realtime.middleware import JWTAuthMiddlewareStack
    from apps.realtime.routing import websocket_urlpatterns

    application = ProtocolTypeRouter(
        {
            "http": django_asgi_app,
            "websocket": JWTAuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
        }
    )
else:
    application = django_asgi_app
