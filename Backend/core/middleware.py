from django.http import JsonResponse
from .models import Organization


class OrganizationMiddleware:
    """
    Middleware to handle organization-based multi-tenancy.
    Expects organization slug in the request headers or query parameters.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip middleware for admin and static files
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return self.get_response(request)

        # Get organization slug from header or query parameter
        org_slug = (
            request.headers.get('X-Organization-Slug') or 
            request.GET.get('org_slug')
        )

        if org_slug and request.path.startswith('/graphql/'):
            try:
                organization = Organization.objects.get(slug=org_slug)
                request.organization = organization
            except Organization.DoesNotExist:
                return JsonResponse({
                    'error': 'Organization not found',
                    'code': 'ORGANIZATION_NOT_FOUND'
                }, status=404)
        else:
            request.organization = None

        response = self.get_response(request)
        return response