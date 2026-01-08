"""
URL configuration for screening_task project.
"""
from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt

def api_info(request):
    return JsonResponse({
        'message': 'Project Management API',
        'graphql_endpoint': '/graphql/',
        'admin_panel': '/admin/',
        'status': 'running'
    })

urlpatterns = [
    path('', api_info, name='api_info'),
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
]