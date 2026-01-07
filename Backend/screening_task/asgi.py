"""
ASGI config for screening_task project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screening_task.settings')

application = get_asgi_application()