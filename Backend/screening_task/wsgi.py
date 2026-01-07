"""
WSGI config for screening_task project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screening_task.settings')

application = get_wsgi_application()