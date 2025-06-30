"""
ASGI config for gymfreak project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import sys
#  Add the directory that contains 'jazzmin'
sys.path.insert(0, os.path.abspath("E:/Collegestuff/FYP/django_jazzmin-3.0.1"))
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import api.routing



#  Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymfreak.settings')

#  Set up ASGI application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            api.routing.websocket_urlpatterns
        )
    ),
})
